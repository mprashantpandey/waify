<?php

namespace App\Http\Controllers;

use App\Models\SupportMessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupportAttachmentController extends Controller
{
    public function show(Request $request, SupportMessageAttachment $attachment): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user, 403);

        $attachment->loadMissing('message.thread.account');
        $thread = $attachment->message?->thread;
        abort_unless($thread, 404);

        $isPlatformAdmin = method_exists($user, 'isSuperAdmin') ? $user->isSuperAdmin() : false;
        $canTenantAccess = method_exists($user, 'canAccessAccount') && $user->canAccessAccount($thread->account);

        abort_unless($isPlatformAdmin || $canTenantAccess, 403);

        $diskName = config('filesystems.default', 'local');
        $disk = Storage::disk($diskName);
        abort_unless($disk->exists($attachment->file_path), 404);

        $disposition = str_starts_with((string) $attachment->mime_type, 'image/') ? 'inline' : 'attachment';

        return $disk->download(
            $attachment->file_path,
            $attachment->file_name,
            [
                'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
                'Content-Disposition' => $disposition.'; filename="'.addslashes($attachment->file_name).'"',
            ]
        );
    }
}
