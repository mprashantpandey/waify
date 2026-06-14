<?php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BillingRenewalReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscription $subscription) {}

    public function build(): self
    {
        return $this->subject('Your Zyptos plan renews soon')
            ->view('emails.billing.renewal-reminder')
            ->text('emails.billing.text.renewal-reminder')
            ->with([
                'subscription' => $this->subscription,
                'billingUrl' => route('app.billing.index', ['tab' => 'plans']),
                'brand' => app(\App\Services\BrandingService::class)->getAll(),
            ]);
    }
}
