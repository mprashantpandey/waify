<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Platform/Cms/Index', [
            'pages' => [
                'terms_content' => (string) PlatformSetting::get('cms.terms_content', ''),
                'privacy_content' => (string) PlatformSetting::get('cms.privacy_content', ''),
                'cookie_content' => (string) PlatformSetting::get('cms.cookie_content', ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'terms_content' => 'nullable|string|max:100000',
            'privacy_content' => 'nullable|string|max:100000',
            'cookie_content' => 'nullable|string|max:100000',
        ]);

        PlatformSetting::set('cms.terms_content', $validated['terms_content'] ?? '', 'string', 'cms');
        PlatformSetting::set('cms.privacy_content', $validated['privacy_content'] ?? '', 'string', 'cms');
        PlatformSetting::set('cms.cookie_content', $validated['cookie_content'] ?? '', 'string', 'cms');

        return back()->with('success', 'CMS policy pages updated.');
    }
}

