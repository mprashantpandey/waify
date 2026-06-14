<?php

namespace App\Mail;

use App\Models\PaymentOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BillingPaymentFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PaymentOrder $order, public string $reason) {}

    public function build(): self
    {
        return $this->subject('Payment needs attention for '.$this->invoiceNumber())
            ->view('emails.billing.payment-failed')
            ->text('emails.billing.text.payment-failed')
            ->with(array_merge(app(\App\Services\InvoicePdfService::class)->viewData($this->order), [
                'order' => $this->order,
                'reason' => $this->reason,
                'invoiceNumber' => $this->invoiceNumber(),
                'billingUrl' => route('app.billing.index', ['tab' => 'invoices']),
            ]));
    }

    private function invoiceNumber(): string
    {
        return $this->order->invoice_number ?: $this->order->provider_order_id;
    }
}
