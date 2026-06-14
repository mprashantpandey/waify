Your plan renews soon

Your {{ $subscription->plan?->name ?? 'Zyptos' }} plan is due on {{ $subscription->current_period_end?->format('d M Y') ?? 'the renewal date' }}.

Renew Plan:
{{ $billingUrl }}
