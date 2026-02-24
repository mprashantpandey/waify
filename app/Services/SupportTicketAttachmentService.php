<?php

namespace App\Services;

use App\Models\SupportMessage;
use App\Models\SupportMessageAttachment;
use App\Models\SupportThread;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SupportTicketAttachmentService
{
    /**
     * @param array<int,UploadedFile> $files
     */
    public function attachFiles(SupportThread $thread, SupportMessage $message, array $files): void
    {
        if (empty($files)) {
            return;
        }

        $disk = Storage::disk(config('filesystems.default', 'local'));

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }

            $safeName = Str::limit((string) $file->getClientOriginalName(), 180, '');
            $ext = $file->getClientOriginalExtension();
            $storedName = now()->format('YmdHis').'-'.Str::random(8).($ext ? '.'.$ext : '');
            $path = 'support/'.(int) $thread->account_id.'/'.(int) $thread->id.'/'.(int) $message->id.'/'.$storedName;

            $disk->putFileAs(dirname($path), $file, basename($path));

            SupportMessageAttachment::create([
                'support_message_id' => $message->id,
                'file_name' => $safeName !== '' ? $safeName : ($file->getClientOriginalName() ?: $storedName),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'file_size' => (int) $file->getSize(),
            ]);
        }
    }
}
