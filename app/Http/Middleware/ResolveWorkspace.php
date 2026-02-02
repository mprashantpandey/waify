<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveWorkspace
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get workspace slug from route parameter
        $workspaceSlug = $request->route('workspace');
        
        // If route hasn't matched yet, try to extract from path
        if (!$workspaceSlug && $request->is('app/*')) {
            $path = trim($request->path(), '/');
            $pathParts = explode('/', $path);
            // Path format: app/{workspace}/...
            if (count($pathParts) >= 2 && $pathParts[0] === 'app') {
                $workspaceSlug = $pathParts[1];
            }
        }

        if ($workspaceSlug) {
            $workspace = Workspace::where('slug', $workspaceSlug)->first();

            if (!$workspace) {
                \Log::error('ResolveWorkspace: Workspace not found', [
                    'slug' => $workspaceSlug,
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);
                abort(404, 'Workspace not found');
            }

            // Check if user has access to this workspace
            $user = $request->user();
            if ($user && !$workspace->users->contains($user) && $workspace->owner_id !== $user->id) {
                abort(403, 'You do not have access to this workspace');
            }

            // Set workspace in request and session
            $request->attributes->set('workspace', $workspace);
            session(['current_workspace_id' => $workspace->id]);
        }

        return $next($request);
    }
}
