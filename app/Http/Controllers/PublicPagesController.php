<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\SeoService;

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
        $plans = \App\Models\Plan::where('is_active', true)
            ->orderBy('price_monthly', 'asc')
            ->get()
            ->map(function ($plan) {
                $normalizedModules = $this->normalizeModuleKeys($plan->modules ?? []);

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'key' => $plan->key,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => strtoupper((string) ($plan->currency ?: app(\App\Services\PlatformSettingsService::class)->get('payment.default_currency', 'INR'))),
                    'trial_days' => $plan->trial_days ?? 0,
                    'features' => $plan->publicFeatures(),
                    'modules' => $normalizedModules,
                    'limits' => $plan->limits ?? []];
            });

        return $this->renderPublic('Public/Pricing', 'pricing', [
            'plans' => $plans,
            'canRegister' => \Route::has('register')]);
    }

    /**
     * Display the privacy policy page.
     */
    public function privacy(): Response
    {
        return $this->renderPublic('Public/Privacy', 'privacy');
    }

    /**
     * Display the terms of service page.
     */
    public function terms(): Response
    {
        return $this->renderPublic('Public/Terms', 'terms');
    }

    public function refundPolicy(): Response
    {
        return $this->renderPublic('Public/RefundPolicy', 'refund');
    }

    public function acceptableUse(): Response
    {
        return $this->renderPublic('Public/AcceptableUse', 'acceptableUse');
    }

    public function qrDisclaimer(): Response
    {
        return $this->renderPublic('Public/QrDisclaimer', 'qrDisclaimer');
    }

    public function gdpr(): Response
    {
        return $this->renderPublic('Public/GDPR', 'gdpr');
    }

    public function cookies(): Response
    {
        return $this->renderPublic('Public/Cookies', 'cookies');
    }

    public function security(): Response
    {
        return $this->renderPublic('Public/Security', 'security');
    }

    /**
     * Display the help page.
     */
    public function help(): Response
    {
        return $this->renderPublic('Public/Help', 'help');
    }

    /**
     * Display the FAQs page.
     */
    public function faqs(): Response
    {
        $faqs = \App\Models\PlatformSetting::get('support.faqs', []);

        return $this->renderPublic('Public/FAQs', 'faqs', [
            'faqs' => is_array($faqs) ? $faqs : []]);
    }

    public function knowledgebase(): Response
    {
        return $this->renderPublic('Public/KnowledgeBase', 'knowledgebase');
    }

    public function roadmap(): Response
    {
        return $this->renderPublic('Public/Roadmap', 'roadmap');
    }

    public function docs(): Response
    {
        return $this->renderPublic('Public/Docs', 'docs');
    }

    /**
     * Display the about us page.
     */
    public function about(): Response
    {
        return $this->renderPublic('Public/About', 'about');
    }

    /**
     * Display the contact page.
     */
    public function contact(): Response
    {
        return $this->renderPublic('Public/Contact', 'contact');
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

        ContactRequest::create([
            ...$validated,
            'status' => ContactRequest::STATUS_NEW,
            'source' => 'public_contact',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

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

    protected function renderPublic(string $component, string $seoKey, array $props = []): Response
    {
        return Inertia::render($component, [
            'seo' => app(SeoService::class)->page($seoKey),
            ...$props,
        ]);
    }
}
