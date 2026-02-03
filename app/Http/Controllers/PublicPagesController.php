<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PublicPagesController extends Controller
{
    /**
     * Normalize old module keys to new module keys.
     */
    protected function normalizeModuleKeys(array $moduleKeys): array
    {
        $keyMap = [
            'whatsapp' => 'whatsapp.cloud',
            'chatbots' => 'automation.chatbots'];

        return array_map(function ($key) use ($keyMap) {
            return $keyMap[$key] ?? $key;
        }, $moduleKeys);
    }

    /**
     * Display the pricing page.
     */
    public function pricing(): Response
    {
        // Fetch all modules from database to get accurate names
        $modules = \App\Models\Module::all()->keyBy('key');
        $moduleNames = $modules->mapWithKeys(function ($module) {
            return [$module->key => $module->name];
        })->toArray();

        $plans = \App\Models\Plan::where('is_active', true)
            ->orderBy('price_monthly', 'asc')
            ->get()
            ->map(function ($plan) use ($moduleNames) {
                $features = [];
                
                // Normalize old module keys to new ones
                $normalizedModules = $this->normalizeModuleKeys($plan->modules ?? []);
                
                // Add modules as features using actual module names from database
                if (!empty($normalizedModules)) {
                    foreach ($normalizedModules as $moduleKey) {
                        // Use database module name, fallback to formatted key
                        $moduleName = $moduleNames[$moduleKey] ?? ucfirst(str_replace(['.', '_'], ' ', $moduleKey));
                        $features[] = $moduleName;
                    }
                }
                
                // Add limits as features
                if ($plan->limits && is_array($plan->limits)) {
                    if (isset($plan->limits['whatsapp_connections'])) {
                        $conn = $plan->limits['whatsapp_connections'];
                        $features[] = $conn === -1 ? 'Unlimited WhatsApp Connections' : "{$conn} WhatsApp Connection" . ($conn > 1 ? 's' : '');
                    }
                    if (isset($plan->limits['agents'])) {
                        $agents = $plan->limits['agents'];
                        $features[] = $agents === -1 ? 'Unlimited Agents' : "{$agents} Agent" . ($agents > 1 ? 's' : '');
                    }
                    if (isset($plan->limits['messages_monthly'])) {
                        $msgs = $plan->limits['messages_monthly'];
                        $features[] = $msgs === -1 ? 'Unlimited Messages' : number_format($msgs) . ' Messages/Month';
                    }
                    if (isset($plan->limits['template_sends_monthly'])) {
                        $templates = $plan->limits['template_sends_monthly'];
                        $features[] = $templates === -1 ? 'Unlimited Template Sends' : number_format($templates) . ' Template Sends/Month';
                    }
                    if (isset($plan->limits['retention_days'])) {
                        $retention = $plan->limits['retention_days'];
                        $features[] = $retention === -1 ? 'Unlimited Data Retention' : "{$retention} Days Data Retention";
                    }
                }
                
                // Add trial days if available
                if ($plan->trial_days > 0) {
                    $features[] = "{$plan->trial_days}-Day Free Trial";
                }

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'key' => $plan->key,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => app(\App\Services\PlatformSettingsService::class)->get('payment.default_currency', 'USD'), // Use platform default currency
                    'trial_days' => $plan->trial_days ?? 0,
                    'features' => $features,
                    'modules' => $normalizedModules,
                    'limits' => $plan->limits ?? []];
            });

        return Inertia::render('Public/Pricing', [
            'plans' => $plans,
            'canRegister' => \Route::has('register')]);
    }

    /**
     * Display the privacy policy page.
     */
    public function privacy(): Response
    {
        return Inertia::render('Public/Privacy');
    }

    /**
     * Display the terms of service page.
     */
    public function terms(): Response
    {
        return Inertia::render('Public/Terms');
    }

    /**
     * Display the help page.
     */
    public function help(): Response
    {
        return Inertia::render('Public/Help');
    }

    /**
     * Display the FAQs page.
     */
    public function faqs(): Response
    {
        $faqs = \App\Models\PlatformSetting::get('support.faqs', []);
        
        return Inertia::render('Public/FAQs', [
            'faqs' => is_array($faqs) ? $faqs : []]);
    }

    /**
     * Display the about us page.
     */
    public function about(): Response
    {
        return Inertia::render('Public/About');
    }

    /**
     * Display the contact page.
     */
    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    /**
     * Handle contact form submission.
     */
    public function contactSubmit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000']);

        $supportEmail = \App\Models\PlatformSetting::get('branding.support_email')
            ?: \App\Models\PlatformSetting::get('general.support_email')
            ?: config('mail.from.address');

        if ($supportEmail) {
            try {
                Mail::raw(
                    "New contact form submission:\n\nName: {$validated['name']}\nEmail: {$validated['email']}\nSubject: {$validated['subject']}\n\nMessage:\n{$validated['message']}\n",
                    function ($message) use ($supportEmail, $validated) {
                        $message->to($supportEmail)
                            ->subject("Contact: {$validated['subject']}")
                            ->replyTo($validated['email'], $validated['name']);
                    }
                );
            } catch (\Throwable $e) {
                Log::error('Failed to send contact form email', [
                    'error' => $e->getMessage(),
                    'support_email' => $supportEmail,
                    'from' => $validated['email'],
                ]);
            }
        } else {
            Log::warning('Contact form submitted but no support email configured', [
                'from' => $validated['email'],
                'subject' => $validated['subject'],
            ]);
        }

        return back()->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}
