<?php

namespace App\Modules\Chatbots\Services;

use App\Modules\Chatbots\Models\BotFlow;

class TriggerEvaluator
{
    /**
     * Check if a flow's trigger matches the context.
     */
    public function matches(BotFlow $flow, BotContext $context): bool
    {
        $trigger = $flow->trigger;
        $type = $trigger['type'] ?? null;

        return match ($type) {
            'inbound_message' => $this->matchesInboundMessage($trigger, $context),
            'keyword' => $this->matchesKeyword($trigger, $context),
            'button_reply' => $this->matchesButtonReply($trigger, $context),
            default => false,
        };
    }

    protected function matchesInboundMessage(array $trigger, BotContext $context): bool
    {
        // Check if only first message
        if ($trigger['first_message_only'] ?? false) {
            if (!$context->isFirstMessage()) {
                return false;
            }
        }

        // Check connection filter
        if (isset($trigger['connection_ids']) && is_array($trigger['connection_ids'])) {
            if (!in_array($context->getConnectionId(), $trigger['connection_ids'])) {
                return false;
            }
        }

        // Check if conversation already assigned (optional skip)
        if ($trigger['skip_if_assigned'] ?? false) {
            if ($context->conversation->assignee_id) {
                return false;
            }
        }

        return true;
    }

    protected function matchesKeyword(array $trigger, BotContext $context): bool
    {
        $keywords = $trigger['keywords'] ?? [];
        if (empty($keywords)) {
            return false;
        }

        $text = $context->getMessageText() ?? '';
        $caseSensitive = $trigger['case_sensitive'] ?? false;
        $wholeWord = $trigger['whole_word'] ?? false;
        $matchType = $trigger['match_type'] ?? 'any'; // any|all

        if (!$caseSensitive) {
            $text = mb_strtolower($text);
        }

        $matches = [];
        foreach ($keywords as $keyword) {
            $searchKeyword = $caseSensitive ? $keyword : mb_strtolower($keyword);
            
            if ($wholeWord) {
                $pattern = '/\b' . preg_quote($searchKeyword, '/') . '\b/';
                $matches[] = preg_match($pattern, $text) === 1;
            } else {
                $matches[] = str_contains($text, $searchKeyword);
            }
        }

        return $matchType === 'all' 
            ? count(array_filter($matches)) === count($keywords)
            : count(array_filter($matches)) > 0;
    }

    protected function matchesButtonReply(array $trigger, BotContext $context): bool
    {
        // Check if message has interactive payload
        $payload = $context->inboundMessage->payload ?? [];
        $interactive = $payload['interactive'] ?? null;

        if (!$interactive) {
            return false;
        }

        $buttonId = $interactive['button_reply']['id'] ?? $interactive['list_reply']['id'] ?? null;
        $expectedButtonId = $trigger['button_id'] ?? null;

        return $buttonId === $expectedButtonId;
    }
}

