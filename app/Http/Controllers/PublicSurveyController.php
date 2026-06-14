<?php

namespace App\Http\Controllers;

use App\Models\AccountSurvey;
use App\Models\AccountSurveyResponse;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Services\BotRuntime;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicSurveyController extends Controller
{
    public function show(AccountSurvey $survey): Response
    {
        abort_unless($survey->status === 'active', 404);

        return Inertia::render('Public/SurveyForm', [
            'survey' => [
                'id' => $survey->id,
                'name' => $survey->name,
                'type' => $survey->type,
                'trigger' => $survey->trigger,
                'questions' => $survey->questions ?: [],
                'successMessage' => $survey->success_message,
            ],
            'workspace' => [
                'name' => $survey->account?->name,
            ],
        ]);
    }

    public function submit(Request $request, AccountSurvey $survey): RedirectResponse
    {
        abort_unless($survey->status === 'active', 404);

        $validated = $request->validate([
            'respondent_name' => ['nullable', 'string', 'max:160'],
            'respondent_phone' => ['nullable', 'string', 'max:30'],
            'respondent_email' => ['nullable', 'email', 'max:160'],
            'score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'answers' => ['nullable', 'array'],
            'answers.*' => ['nullable', 'string', 'max:2000'],
        ]);

        $result = DB::transaction(function () use ($request, $survey, $validated) {
            $response = AccountSurveyResponse::create([
                'account_survey_id' => $survey->id,
                'account_id' => $survey->account_id,
                'respondent_name' => $validated['respondent_name'] ?? null,
                'respondent_phone' => $validated['respondent_phone'] ?? null,
                'respondent_email' => $validated['respondent_email'] ?? null,
                'score' => $validated['score'] ?? null,
                'answers' => $validated['answers'] ?? [],
                'ip_hash' => hash('sha256', (string) $request->ip()),
            ]);

            $contact = $survey->auto_create_contact ? $this->createContactFromResponse($survey, $response) : null;

            $survey->forceFill([
                'responses_count' => AccountSurveyResponse::where('account_survey_id', $survey->id)->count(),
                'average_score' => AccountSurveyResponse::where('account_survey_id', $survey->id)->whereNotNull('score')->avg('score'),
            ])->save();

            return ['response' => $response, 'contact' => $contact];
        });

        $this->triggerFormAutomation($survey, $result['response'], $result['contact']);

        return back()->with('success', 'Thank you. Your response has been submitted.');
    }

    private function createContactFromResponse(AccountSurvey $survey, AccountSurveyResponse $response): ?WhatsAppContact
    {
        $answers = is_array($response->answers) ? $response->answers : [];
        $name = $this->answerValue($survey, $response, $survey->contact_name_field, ['name', 'full name', 'your name']) ?: $response->respondent_name;
        $phone = $this->answerValue($survey, $response, $survey->contact_phone_field, ['phone', 'mobile', 'whatsapp', 'number']) ?: $response->respondent_phone;
        $email = $this->answerValue($survey, $response, $survey->contact_email_field, ['email', 'mail']) ?: $response->respondent_email;
        $waId = $this->normalisePhone($phone);

        if ($waId === '') {
            return null;
        }

        $questionMap = collect($survey->questions ?: [])
            ->mapWithKeys(fn ($question, $index) => [Str::slug((string) $question, '_') ?: 'question_'.$index => $answers[(string) $index] ?? null])
            ->filter(fn ($value) => filled($value))
            ->all();

        $existingContact = WhatsAppContact::where('account_id', $survey->account_id)->where('wa_id', $waId)->first();
        $existingMetadata = is_array($existingContact?->metadata) ? $existingContact->metadata : [];
        $existingCustomFields = is_array($existingContact?->custom_fields) ? $existingContact->custom_fields : [];

        $contact = WhatsAppContact::updateOrCreate(
            ['account_id' => $survey->account_id, 'wa_id' => $waId],
            [
                'name' => filled($name) ? $name : $existingContact?->name,
                'phone' => $phone ?: $waId,
                'email' => filled($email) ? $email : $existingContact?->email,
                'source' => 'public_form',
                'metadata' => [
                    ...$existingMetadata,
                    'last_form_id' => $survey->id,
                    'last_form_response_id' => $response->id,
                    'last_form_name' => $survey->name,
                ],
                'custom_fields' => [
                    ...$existingCustomFields,
                    'form_'.$survey->id => $questionMap,
                ],
            ]
        );

        $tagNames = collect($survey->auto_tag_names ?: [])
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique()
            ->values();

        if ($tagNames->isNotEmpty()) {
            $tagIds = $tagNames->map(fn ($name) => ContactTag::firstOrCreate(
                ['account_id' => $survey->account_id, 'name' => $name],
                ['color' => '#16a34a', 'description' => 'Applied from public form submissions.']
            )->id)->all();

            $contact->tags()->syncWithoutDetaching($tagIds);
        }

        return $contact;
    }

    private function triggerFormAutomation(AccountSurvey $survey, AccountSurveyResponse $response, ?WhatsAppContact $contact): void
    {
        if (! $survey->automation_enabled || ! $survey->automation_bot_flow_id || ! $contact) {
            return;
        }

        $flow = BotFlow::where('account_id', $survey->account_id)
            ->where('id', $survey->automation_bot_flow_id)
            ->where('enabled', true)
            ->with('bot')
            ->first();

        if (! $flow || ! $flow->bot || $flow->bot->status !== 'active') {
            return;
        }

        $connection = WhatsAppConnection::where('account_id', $survey->account_id)
            ->where('is_active', true)
            ->orderByDesc('webhook_last_received_at')
            ->orderBy('id')
            ->first();

        if (! $connection) {
            return;
        }

        $conversation = WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $survey->account_id,
                'whatsapp_connection_id' => $connection->id,
                'whatsapp_contact_id' => $contact->id,
            ],
            [
                'status' => 'open',
                'last_message_at' => now(),
                'last_message_preview' => 'Public form submitted: '.$survey->name,
                'metadata' => ['source' => 'public_form'],
            ]
        );

        $conversation->forceFill([
            'status' => 'open',
            'last_message_at' => now(),
            'last_message_preview' => 'Public form submitted: '.$survey->name,
        ])->save();

        $message = WhatsAppMessage::firstOrCreate(
            [
                'account_id' => $survey->account_id,
                'meta_message_id' => 'form:'.$survey->id.':'.$response->id,
            ],
            [
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'inbound',
                'type' => 'form_submission',
                'text_body' => 'Public form submitted: '.$survey->name,
                'payload' => [
                    'source' => 'public_form',
                    'survey_id' => $survey->id,
                    'survey_name' => $survey->name,
                    'response_id' => $response->id,
                    'answers' => $response->answers ?: [],
                ],
                'status' => 'received',
                'received_at' => now(),
            ]
        );

        app(BotRuntime::class)->startFlowForConversation(
            $flow,
            $message,
            $conversation,
            'form:'.$survey->id.':'.$response->id.':flow:'.$flow->id
        );
    }

    private function answerValue(AccountSurvey $survey, AccountSurveyResponse $response, ?string $field, array $fallbackLabels): ?string
    {
        $answers = is_array($response->answers) ? $response->answers : [];

        if ($field === 'respondent_name') {
            return $response->respondent_name;
        }
        if ($field === 'respondent_phone') {
            return $response->respondent_phone;
        }
        if ($field === 'respondent_email') {
            return $response->respondent_email;
        }
        if (str_starts_with((string) $field, 'answer_')) {
            return $answers[substr((string) $field, 7)] ?? null;
        }

        foreach (($survey->questions ?: []) as $index => $question) {
            $label = Str::lower((string) $question);
            foreach ($fallbackLabels as $needle) {
                if (str_contains($label, $needle) && filled($answers[(string) $index] ?? null)) {
                    return $answers[(string) $index];
                }
            }
        }

        return null;
    }

    private function normalisePhone(?string $phone): string
    {
        return preg_replace('/\D+/', '', (string) $phone) ?: '';
    }
}
