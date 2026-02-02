<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display unified settings page.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'workspace' => $workspace,
            'auth' => [
                'user' => $user,
            ],
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
        ]);
    }
}

