<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Models\SystemBackup;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class OpsMaintenanceService
{
    public function __construct(
        protected OperationalAlertService $alertService
    ) {
    }

    public function runDatabaseBackup(bool $force = false): array
    {
        $lock = Cache::lock('ops:db-backup', 1800);
        if (!$lock->get()) {
            return ['status' => 'skipped', 'message' => 'Backup already running.'];
        }

        try {
            $intervalHours = max(6, (int) PlatformSetting::get('compliance.backup_interval_hours', 24));
            $lastSuccess = SystemBackup::query()
                ->where('type', 'database')
                ->where('status', 'completed')
                ->latest('completed_at')
                ->first();

            if (!$force && $lastSuccess?->completed_at && $lastSuccess->completed_at->gt(now()->subHours($intervalHours))) {
                return ['status' => 'skipped', 'message' => "Last backup is within {$intervalHours}h window."];
            }

            $backup = SystemBackup::create([
                'type' => 'database',
                'status' => 'running',
                'disk' => 'local',
                'started_at' => now(),
            ]);

            $timestamp = now()->format('Ymd-His');
            $relativeDir = "backups/database/" . now()->format('Y/m/d');
            $absoluteDir = storage_path("app/{$relativeDir}");
            File::ensureDirectoryExists($absoluteDir);
            $relativePath = "{$relativeDir}/db-{$timestamp}.sql.gz";
            $absolutePath = storage_path("app/{$relativePath}");

            $connection = config('database.default', 'mysql');
            $db = config("database.connections.{$connection}");

            $host = (string) ($db['host'] ?? '127.0.0.1');
            $port = (string) ($db['port'] ?? '3306');
            $database = (string) ($db['database'] ?? '');
            $username = (string) ($db['username'] ?? '');
            $password = (string) ($db['password'] ?? '');

            if ($database === '' || $username === '') {
                throw new \RuntimeException('Database backup configuration is incomplete.');
            }

            $command = sprintf(
                'mysqldump --single-transaction --quick --skip-lock-tables --host=%s --port=%s --user=%s %s | gzip > %s',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($database),
                escapeshellarg($absolutePath)
            );

            $process = Process::fromShellCommandline($command, base_path(), $password !== '' ? ['MYSQL_PWD' => $password] : []);
            $process->setTimeout(1800);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \RuntimeException(trim($process->getErrorOutput() ?: $process->getOutput()) ?: 'mysqldump failed');
            }

            if (!File::exists($absolutePath) || File::size($absolutePath) <= 0) {
                throw new \RuntimeException('Backup file was not created or is empty.');
            }

            $this->runRestoreDrill($absolutePath, $backup);

            $backup->update([
                'status' => 'completed',
                'path' => $relativePath,
                'file_size_bytes' => File::size($absolutePath),
                'checksum' => hash_file('sha256', $absolutePath),
                'completed_at' => now(),
            ]);

            $this->pruneBackupFiles();

            return [
                'status' => 'completed',
                'message' => "Backup created: {$relativePath}",
                'backup_id' => $backup->id,
            ];
        } catch (\Throwable $e) {
            Log::error('Database backup failed', ['error' => $e->getMessage()]);
            $this->alertService->send(
                eventKey: 'backup.failed',
                title: 'Database backup failed',
                context: ['error' => $e->getMessage()],
                severity: 'critical'
            );

            SystemBackup::create([
                'type' => 'database',
                'status' => 'failed',
                'started_at' => now(),
                'completed_at' => now(),
                'error_message' => mb_substr($e->getMessage(), 0, 2000),
            ]);

            return ['status' => 'failed', 'message' => $e->getMessage()];
        } finally {
            $lock->release();
        }
    }

    public function runRetentionCleanup(bool $force = false): array
    {
        $lock = Cache::lock('ops:retention-cleanup', 600);
        if (!$lock->get()) {
            return ['status' => 'skipped', 'message' => 'Cleanup already running.'];
        }

        try {
            $intervalMinutes = max(30, (int) PlatformSetting::get('compliance.cleanup_interval_minutes', 180));
            $lastRunAtRaw = PlatformSetting::get('compliance.cleanup.last_run_at');
            $lastRunAt = $lastRunAtRaw ? Carbon::parse((string) $lastRunAtRaw) : null;
            if (!$force && $lastRunAt && $lastRunAt->gt(now()->subMinutes($intervalMinutes))) {
                return ['status' => 'skipped', 'message' => "Cleanup ran within {$intervalMinutes} minutes."];
            }

            $retentionDays = max(7, (int) PlatformSetting::get('compliance.data_retention_days', 365));
            $outboxRetentionDays = max(7, (int) PlatformSetting::get('compliance.notification_outbox_retention_days', 45));
            $failedJobsRetentionDays = max(3, (int) PlatformSetting::get('compliance.failed_jobs_retention_days', 14));

            $deleted = [];

            if (DB::getSchemaBuilder()->hasTable('contact_activities')) {
                $deleted['contact_activities'] = DB::table('contact_activities')
                    ->where('created_at', '<', now()->subDays($retentionDays))
                    ->delete();
            }

            if (DB::getSchemaBuilder()->hasTable('support_audit_logs')) {
                $deleted['support_audit_logs'] = DB::table('support_audit_logs')
                    ->where('created_at', '<', now()->subDays($retentionDays))
                    ->delete();
            }

            if (DB::getSchemaBuilder()->hasTable('bot_executions')) {
                $deleted['bot_executions'] = DB::table('bot_executions')
                    ->where('created_at', '<', now()->subDays($retentionDays))
                    ->delete();
            }

            if (DB::getSchemaBuilder()->hasTable('notification_outbox')) {
                $deleted['notification_outbox'] = DB::table('notification_outbox')
                    ->whereIn('status', ['sent', 'failed'])
                    ->where('created_at', '<', now()->subDays($outboxRetentionDays))
                    ->delete();
            }

            if (DB::getSchemaBuilder()->hasTable('failed_jobs')) {
                $deleted['failed_jobs'] = DB::table('failed_jobs')
                    ->where('failed_at', '<', now()->subDays($failedJobsRetentionDays))
                    ->delete();
            }

            $deleted['contacts_purged'] = WhatsAppContact::onlyTrashed()
                ->whereNotNull('purge_after_at')
                ->where('purge_after_at', '<=', now())
                ->forceDelete();

            $deleted['campaigns_purged'] = Campaign::onlyTrashed()
                ->whereNotNull('purge_after_at')
                ->where('purge_after_at', '<=', now())
                ->forceDelete();

            PlatformSetting::set('compliance.cleanup.last_run_at', now()->toIso8601String(), 'string', 'compliance');
            PlatformSetting::set('compliance.cleanup.last_summary', json_encode($deleted), 'string', 'compliance');

            return ['status' => 'completed', 'message' => 'Cleanup completed.', 'deleted' => $deleted];
        } catch (\Throwable $e) {
            Log::error('Retention cleanup failed', ['error' => $e->getMessage()]);
            $this->alertService->send(
                eventKey: 'cleanup.failed',
                title: 'Retention cleanup failed',
                context: ['error' => $e->getMessage()],
                severity: 'critical'
            );

            return ['status' => 'failed', 'message' => $e->getMessage()];
        } finally {
            $lock->release();
        }
    }

    public function runTick(bool $forceBackup = false, bool $forceCleanup = false): array
    {
        $backup = $this->runDatabaseBackup($forceBackup);
        $cleanup = $this->runRetentionCleanup($forceCleanup);

        return [
            'backup' => $backup,
            'cleanup' => $cleanup,
        ];
    }

    protected function runRestoreDrill(string $absolutePath, SystemBackup $backup): void
    {
        $restoreEveryDays = max(1, (int) PlatformSetting::get('compliance.backup_restore_drill_days', 7));

        $lastDrill = SystemBackup::query()
            ->where('type', 'database')
            ->whereNotNull('restore_drill_at')
            ->latest('restore_drill_at')
            ->first();

        if ($lastDrill?->restore_drill_at && $lastDrill->restore_drill_at->gt(now()->subDays($restoreEveryDays))) {
            return;
        }

        $handle = @gzopen($absolutePath, 'rb');
        if (!$handle) {
            $backup->update([
                'restore_drill_at' => now(),
                'restore_drill_status' => 'failed',
                'error_message' => 'Restore drill failed: could not open gzip file.',
            ]);
            return;
        }

        $sample = (string) gzread($handle, 4096);
        gzclose($handle);

        $passed = trim($sample) !== '';

        $backup->update([
            'restore_drill_at' => now(),
            'restore_drill_status' => $passed ? 'passed' : 'failed',
            'meta' => array_merge($backup->meta ?? [], [
                'restore_drill_sample_prefix' => mb_substr($sample, 0, 200),
            ]),
        ]);
    }

    protected function pruneBackupFiles(): void
    {
        $retentionDays = max(3, (int) PlatformSetting::get('compliance.backup_retention_days', 14));
        $threshold = now()->subDays($retentionDays);

        $oldBackups = SystemBackup::query()
            ->where('type', 'database')
            ->where('status', 'completed')
            ->whereNotNull('path')
            ->where('created_at', '<', $threshold)
            ->get();

        foreach ($oldBackups as $backup) {
            $absolutePath = storage_path('app/' . ltrim((string) $backup->path, '/'));
            if (File::exists($absolutePath)) {
                File::delete($absolutePath);
            }
            $backup->delete();
        }
    }
}
