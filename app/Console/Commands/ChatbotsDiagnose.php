<?php

namespace App\Console\Commands;

use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotFlow;
use Illuminate\Console\Command;

class ChatbotsDiagnose extends Command
{
    protected $signature = 'chatbots:diagnose {--account=} {--bot=}';

    protected $description = 'Diagnose chatbots and flows for non-runnable configurations';

    public function handle(): int
    {
        $accountId = $this->option('account');
        $botId = $this->option('bot');

        $query = Bot::query()->with(['flows.nodes', 'flows.edges']);
        if ($accountId !== null && $accountId !== '') {
            $query->where('account_id', (int) $accountId);
        }
        if ($botId !== null && $botId !== '') {
            $query->where('id', (int) $botId);
        }

        $bots = $query->orderBy('account_id')->orderBy('id')->get();
        if ($bots->isEmpty()) {
            $this->warn('No bots found for the provided filters.');
            return Command::SUCCESS;
        }

        $issues = [];
        $summaryRows = [];

        foreach ($bots as $bot) {
            $enabledFlows = $bot->flows->where('enabled', true);
            $runnableFlows = 0;

            if ($bot->status === 'active' && $enabledFlows->isEmpty()) {
                $issues[] = [
                    'account_id' => (int) $bot->account_id,
                    'bot_id' => (int) $bot->id,
                    'flow_id' => '-',
                    'level' => 'ERROR',
                    'issue' => 'Active bot has no enabled flows',
                ];
            }

            /** @var BotFlow $flow */
            foreach ($enabledFlows as $flow) {
                $nodes = $flow->nodes;
                $edges = $flow->edges;
                $hasNodes = $nodes->isNotEmpty();
                $hasExecutableNode = $nodes->contains(fn ($node) => in_array($node->type, ['action', 'delay', 'webhook'], true));
                $hasStartNode = $nodes->contains(fn ($node) => (bool) ($node->config['is_start'] ?? false));
                $hasEdges = $edges->isNotEmpty();

                if ($hasNodes && $hasExecutableNode) {
                    $runnableFlows++;
                }

                if (!$hasNodes) {
                    $issues[] = [
                        'account_id' => (int) $bot->account_id,
                        'bot_id' => (int) $bot->id,
                        'flow_id' => (int) $flow->id,
                        'level' => 'ERROR',
                        'issue' => 'Enabled flow has no nodes',
                    ];
                    continue;
                }

                if (!$hasExecutableNode) {
                    $issues[] = [
                        'account_id' => (int) $bot->account_id,
                        'bot_id' => (int) $bot->id,
                        'flow_id' => (int) $flow->id,
                        'level' => 'ERROR',
                        'issue' => 'Enabled flow has no executable node (action/delay/webhook)',
                    ];
                }

                if ($hasEdges && !$hasStartNode) {
                    $issues[] = [
                        'account_id' => (int) $bot->account_id,
                        'bot_id' => (int) $bot->id,
                        'flow_id' => (int) $flow->id,
                        'level' => 'WARN',
                        'issue' => 'Graph flow has edges but no explicit start node',
                    ];
                }
            }

            $summaryRows[] = [
                (int) $bot->account_id,
                (int) $bot->id,
                $bot->name,
                $bot->status,
                $bot->flows->count(),
                $enabledFlows->count(),
                $runnableFlows,
            ];
        }

        $this->table(
            ['account_id', 'bot_id', 'name', 'status', 'flows', 'enabled_flows', 'runnable_flows'],
            $summaryRows
        );

        if (empty($issues)) {
            $this->info('No configuration issues detected.');
            return Command::SUCCESS;
        }

        $this->newLine();
        $this->table(['account_id', 'bot_id', 'flow_id', 'level', 'issue'], $issues);
        $this->warn('Issues detected. Fix these before expecting consistent bot replies.');

        return Command::FAILURE;
    }
}

