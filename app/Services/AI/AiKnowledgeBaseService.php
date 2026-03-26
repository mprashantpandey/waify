<?php

namespace App\Services\AI;

use App\Models\Account;
use App\Models\AiKnowledgeItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class AiKnowledgeBaseService
{
    public function sync(Account $account, array $items): void
    {
        $normalized = collect($items)
            ->map(function (array $item, int $index): array {
                return [
                    'id' => isset($item['id']) && is_numeric($item['id']) ? (int) $item['id'] : null,
                    'title' => trim((string) ($item['title'] ?? '')),
                    'content' => trim((string) ($item['content'] ?? '')),
                    'is_enabled' => (bool) ($item['is_enabled'] ?? true),
                    'sort_order' => is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : $index,
                ];
            })
            ->filter(fn (array $item) => $item['title'] !== '' && $item['content'] !== '')
            ->values();

        $existingIds = AiKnowledgeItem::query()
            ->where('account_id', $account->id)
            ->pluck('id')
            ->map(fn ($id) => (int) $id);

        $keptIds = [];

        foreach ($normalized as $item) {
            $record = null;
            if ($item['id']) {
                $record = AiKnowledgeItem::query()
                    ->where('account_id', $account->id)
                    ->where('id', $item['id'])
                    ->first();
            }

            if ($record) {
                $record->update([
                    'title' => $item['title'],
                    'content' => $item['content'],
                    'is_enabled' => $item['is_enabled'],
                    'sort_order' => $item['sort_order'],
                ]);
            } else {
                $record = AiKnowledgeItem::create([
                    'account_id' => $account->id,
                    'title' => $item['title'],
                    'content' => $item['content'],
                    'is_enabled' => $item['is_enabled'],
                    'sort_order' => $item['sort_order'],
                ]);
            }

            $keptIds[] = (int) $record->id;
        }

        $toDelete = $existingIds->diff($keptIds)->values();
        if ($toDelete->isNotEmpty()) {
            AiKnowledgeItem::query()
                ->where('account_id', $account->id)
                ->whereIn('id', $toDelete)
                ->delete();
        }
    }

    public function promptContext(Account $account, ?string $query = null, int $limit = 4): string
    {
        $items = AiKnowledgeItem::query()
            ->where('account_id', $account->id)
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['title', 'content']);

        if ($items->isEmpty()) {
            return '';
        }

        $selected = $this->selectRelevant($items, $query, $limit);
        if ($selected->isEmpty()) {
            return '';
        }

        return $selected
            ->map(function (AiKnowledgeItem $item, int $index): string {
                $number = $index + 1;
                return "{$number}. {$item->title}\n{$item->content}";
            })
            ->implode("\n\n");
    }

    public function tokenize(?string $text): array
    {
        $normalized = Str::of((string) $text)
            ->lower()
            ->replaceMatches('/[^a-z0-9\s]+/u', ' ')
            ->squish()
            ->toString();

        if ($normalized === '') {
            return [];
        }

        return collect(explode(' ', $normalized))
            ->filter(fn (string $token) => strlen($token) >= 3)
            ->unique()
            ->values()
            ->all();
    }

    protected function selectRelevant(Collection $items, ?string $query, int $limit): Collection
    {
        $tokens = $this->tokenize($query);

        if ($tokens === []) {
            return $items->take($limit)->values();
        }

        $scored = $items
            ->map(function (AiKnowledgeItem $item) use ($tokens) {
                $haystack = Str::lower($item->title . ' ' . $item->content);
                $score = 0;
                foreach ($tokens as $token) {
                    if (str_contains($haystack, $token)) {
                        $score++;
                    }
                }
                return ['item' => $item, 'score' => $score];
            })
            ->sortByDesc('score')
            ->values();

        $matching = $scored->filter(fn (array $row) => $row['score'] > 0)->take($limit)->pluck('item')->values();

        if ($matching->isNotEmpty()) {
            return $matching;
        }

        return $items->take(min(2, $limit))->values();
    }
}
