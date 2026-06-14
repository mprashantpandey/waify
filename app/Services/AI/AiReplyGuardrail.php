<?php

namespace App\Services\AI;

class AiReplyGuardrail
{
    public static function paymentUrlInstruction(): string
    {
        return implode(' ', [
            'Payment URL rule:',
            'Never invent or guess Zyptos checkout, payment, Razorpay, invoice, or subscription URLs.',
            'Do not use /checkout URLs.',
            'For Zyptos plan purchase questions, share https://zyptos.com/pricing or ask the customer to open Billing in their Zyptos dashboard.',
            'Only send a direct payment link when an actual generated payment URL is already provided by the system, recent messages, or tool output.',
        ]);
    }

    public static function sanitize(string $reply): string
    {
        $reply = trim($reply);

        if ($reply === '') {
            return '';
        }

        $reply = preg_replace(
            '~https?://(?:www\.)?zyptos\.com/checkout/[^\s)>\]]+~i',
            'https://zyptos.com/pricing',
            $reply
        ) ?? $reply;

        $reply = preg_replace(
            '~\b(?:Here is|Here\'s)\s+your\s+(?:Zyptos\s+)?payment\s+link\b~i',
            'Here is the Zyptos pricing page',
            $reply
        ) ?? $reply;

        return trim($reply);
    }

    public static function isInvalidZyptosPaymentUrl(string $url): bool
    {
        return preg_match('~^https?://(?:www\.)?zyptos\.com/checkout(?:/|$)~i', trim($url)) === 1;
    }
}
