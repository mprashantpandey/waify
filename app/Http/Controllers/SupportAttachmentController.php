<?php

namespace App\Http\Controllers;

use App\Modules\Support\Models\SupportMessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SupportAttachmentController extends Controller
{
    public function show(Request $request, SupportMessageAttachment $attachment)
    {
        $message = $attachment->message()->with('thread.account')->first();
        $thread = $message?->thread;
        $account = $thread?->account;
        $user = $request->user();

        if (!$message || !$thread || !$account || !$user) {
            abort(404);
        }

        if (!$user->isSuperAdmin() && !$user->canAccessAccount($account)) {
            abort(403);
        }

        $filePath = $attachment->file_path;
        if ($filePath === null || $filePath === '' || str_contains($filePath, '..')) {
            abort(404);
        }

        $root = Storage::disk('public')->path('');
        $path = Storage::disk('public')->path($filePath);
        $realPath = realpath($path);
        if ($realPath === false || !str_starts_with($realPath, $root) || !is_file($realPath)) {
            abort(404);
        }

        $safeName = preg_replace('/[^\w\s\-\.]/', '_', $attachment->file_name ?? 'attachment');
        $safeName = substr($safeName, 0, 255) ?: 'attachment';

        return response()->file($realPath, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"']);
    }
}
