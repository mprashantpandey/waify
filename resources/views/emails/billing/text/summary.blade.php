@php
    $currency = $invoice['currency'] ?? $order->currency ?? 'INR';
    $money = fn ($amount) => $currency.' '.number_format(((int) $amount) / 100, 2);
    $planName = $invoice['plan_name'] ?? $order->plan?->name ?? 'Subscription';
    $instructions = $invoice['payment_instructions'] ?? [];
@endphp
Invoice: {{ $invoice['number'] ?? $invoiceNumber }}
Plan: {{ $planName }}
@if(($invoice['discount_amount'] ?? 0) > 0)
Discount{{ ! empty($invoice['discount_code']) ? ' ('.$invoice['discount_code'].')' : '' }}: -{{ $money($invoice['discount_amount']) }}
@endif
Taxable value: {{ $money($invoice['taxable_amount'] ?? $order->taxable_amount ?: $order->base_amount) }}
Tax: {{ $money($invoice['tax_amount'] ?? $order->tax_amount) }}
Total: {{ $money($invoice['total_amount'] ?? $order->amount) }}
@if($invoice['show_payment_instructions'] ?? false)

Bank Transfer / UPI details:
Account: {{ $instructions['account_name'] ?? '-' }}
Account No. / IFSC: {{ $instructions['account_number'] ?? '-' }} / {{ $instructions['ifsc'] ?? '-' }}
UPI: {{ $instructions['upi_id'] ?? '-' }}
@endif
