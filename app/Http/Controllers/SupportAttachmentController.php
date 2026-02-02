<?php

namespace App\Http\Controllers;

use App\Modules\Support\Models\SupportMessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SupportAttachmentController extends Controller
{
    public function show(Request $request, SupportMessageAttachment $attachment)
    {
        $message = $attachment->message()->with('thread.workspace')->first();
        $thread = $message?->thread;
        $workspace = $thread?->workspace;
        $user = $request->user();

        if (!$message || !$thread || !$workspace || !$user) {
            abort(404);
        }

        if (!$user->isSuperAdmin() && !$user->canAccessWorkspace($workspace)) {
            abort(403);
        }

        $path = Storage::disk('public')->path($attachment->file_path);
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $attachment->file_name . '"',
        ]);
    }
}
