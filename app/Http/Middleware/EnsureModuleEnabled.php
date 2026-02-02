<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if (!$workspace) {
            abort(404, 'Workspace not found');
        }

        if (!module_enabled($workspace, $moduleKey)) {
            abort(403, 'Module is not enabled for this workspace');
        }

        return $next($request);
    }
}
