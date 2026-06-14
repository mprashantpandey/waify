<?php

namespace App\Http\Controllers;

use App\Core\Billing\UsageService;
use App\Models\AccountAppointment;
use App\Models\AccountCatalogProduct;
use App\Models\AccountEcommerceOrder;
use App\Models\AccountIntegration;
use App\Models\AccountMediaAsset;
use App\Models\AccountMetaLead;
use App\Models\AccountSurvey;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\RazorpayPaymentLinkService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceAddonController extends Controller
{
    public function media(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', Rule::in(['image', 'video', 'audio', 'document'])],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $type = $filters['type'] ?? null;
        $messages = WhatsAppMessage::where('account_id', $account->id)
            ->whereIn('type', ['image', 'video', 'audio', 'document'])
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('text_body', 'like', "%{$q}%")
                    ->orWhere('payload', 'like', "%{$q}%");
            }))
            ->latest()
            ->limit(24)
            ->get();
        $assets = AccountMediaAsset::where('account_id', $account->id)
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($q !== '', fn ($query) => $query->where('name', 'like', "%{$q}%"))
            ->latest()
            ->paginate(48)
            ->withQueryString();
        $assetCollection = $assets->getCollection();

        return Inertia::render('Addons/MediaLibrary', [
            'items' => $assetCollection->map(fn (AccountMediaAsset $asset) => [
                'id' => 'asset-'.$asset->id,
                'numericId' => $asset->id,
                'name' => $asset->name,
                'type' => $asset->type,
                'size' => $this->humanSize($asset->size),
                'usedIn' => 'Workspace library',
                'uploaded' => $asset->created_at?->toIso8601String(),
                'url' => $asset->url(),
                'deletable' => true,
            ])->concat($messages->map(function ($message) {
                $payload = $message->payload ?: [];

                return [
                    'id' => 'message-'.$message->id,
                    'numericId' => $message->id,
                    'name' => $payload['filename'] ?? $payload['name'] ?? ucfirst($message->type).' message',
                    'type' => $message->type === 'audio' ? 'document' : $message->type,
                    'size' => $payload['size'] ?? 'Meta media',
                    'usedIn' => 'Inbox',
                    'uploaded' => $message->created_at?->toIso8601String(),
                    'url' => $payload['url'] ?? null,
                    'deletable' => false,
                ];
            }))->values(),
            'stats' => [
                'total' => $messages->count() + $assetCollection->count(),
                'images' => $messages->where('type', 'image')->count() + $assetCollection->where('type', 'image')->count(),
                'videos' => $messages->where('type', 'video')->count() + $assetCollection->where('type', 'video')->count(),
                'documents' => $messages->whereIn('type', ['document', 'audio'])->count() + $assetCollection->whereIn('type', ['document', 'audio'])->count(),
            ],
            'filters' => ['q' => $q, 'type' => $type],
            'pagination' => $this->paginationMeta($assets),
        ]);
    }

    public function storeMedia(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:20480', 'mimes:jpg,jpeg,png,webp,gif,mp4,mov,webm,pdf,doc,docx,xls,xlsx,csv,txt,mp3,wav,ogg'],
            'name' => ['nullable', 'string', 'max:160'],
        ]);

        $file = $validated['file'];
        $path = $file->store("accounts/{$account->id}/media", 'public');
        $mime = $file->getMimeType();
        $type = str_starts_with((string) $mime, 'image/')
            ? 'image'
            : (str_starts_with((string) $mime, 'video/') ? 'video' : (str_starts_with((string) $mime, 'audio/') ? 'audio' : 'document'));

        AccountMediaAsset::create([
            'account_id' => $account->id,
            'name' => ($validated['name'] ?? null) ?: $file->getClientOriginalName(),
            'type' => $type,
            'disk' => 'public',
            'path' => $path,
            'mime_type' => $mime,
            'size' => $file->getSize() ?: 0,
            'source' => 'upload',
        ]);

        return back()->with('success', 'Media uploaded.');
    }

    public function destroyMedia(Request $request, AccountMediaAsset $asset): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $asset->account_id);
        Storage::disk($asset->disk ?: 'public')->delete($asset->path);
        $asset->delete();

        return back()->with('success', 'Media removed.');
    }

    public function catalog(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['active', 'draft', 'archived'])],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $status = $filters['status'] ?? null;
        $integration = AccountIntegration::where('account_id', $account->id)
            ->whereIn('provider', ['shopify', 'woocommerce'])
            ->where('status', 'connected')
            ->first();
        $products = AccountCatalogProduct::where('account_id', $account->id)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%");
            }))
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Addons/Catalog', [
            'integration' => $integration ? [
                'provider' => $integration->provider,
                'lastSync' => $integration->last_sync_at?->toIso8601String(),
                'health' => $integration->health,
            ] : null,
            'products' => $products->getCollection()->map(fn (AccountCatalogProduct $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category ?: 'Uncategorized',
                'price' => $product->price,
                'stock' => $product->stock,
                'image' => $product->image_url ?: strtoupper(substr($product->name, 0, 2)),
                'imageUrl' => $product->image_url,
                'description' => $product->description,
                'status' => $product->status,
            ]),
            'filters' => ['q' => $q, 'status' => $status],
            'pagination' => $this->paginationMeta($products),
        ]);
    }

    public function surveys(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'paused', 'archived'])],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $status = $filters['status'] ?? null;
        $surveys = AccountSurvey::where('account_id', $account->id)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('name', 'like', "%{$q}%")
                    ->orWhere('type', 'like', "%{$q}%")
                    ->orWhere('trigger', 'like', "%{$q}%");
            }))
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Addons/Surveys', [
            'surveys' => $surveys->getCollection()->map(fn (AccountSurvey $survey) => [
                'id' => $survey->id,
                'name' => $survey->name,
                'type' => $survey->type,
                'trigger' => $survey->trigger ?: 'Manual',
                'responses' => $survey->responses_count,
                'status' => $survey->status,
                'averageScore' => $survey->average_score ? (float) $survey->average_score : null,
                'questions' => $survey->questions ?: [],
                'autoCreateContact' => $survey->auto_create_contact,
                'contactNameField' => $survey->contact_name_field,
                'contactPhoneField' => $survey->contact_phone_field,
                'contactEmailField' => $survey->contact_email_field,
                'autoTagNames' => $survey->auto_tag_names ?: [],
                'successMessage' => $survey->success_message,
                'automationEnabled' => $survey->automation_enabled,
                'automationBotFlowId' => $survey->automation_bot_flow_id,
                'publicUrl' => route('public.surveys.show', $survey),
            ]),
            'tags' => ContactTag::where('account_id', $account->id)->orderBy('name')->pluck('name')->all(),
            'automationFlows' => BotFlow::query()
                ->where('bot_flows.account_id', $account->id)
                ->where('bot_flows.enabled', true)
                ->join('bots', 'bots.id', '=', 'bot_flows.bot_id')
                ->where('bots.status', 'active')
                ->orderBy('bots.name')
                ->orderBy('bot_flows.name')
                ->get([
                    'bot_flows.id',
                    'bot_flows.name',
                    'bots.name as bot_name',
                ]),
            'filters' => ['q' => $q, 'status' => $status],
            'pagination' => $this->paginationMeta($surveys),
        ]);
    }

    public function appointments(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $status = $filters['status'] ?? null;
        $appointments = AccountAppointment::where('account_id', $account->id)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('title', 'like', "%{$q}%")
                    ->orWhere('contact_name', 'like', "%{$q}%")
                    ->orWhere('contact_phone', 'like', "%{$q}%")
                    ->orWhere('staff_name', 'like', "%{$q}%");
            }))
            ->orderBy('scheduled_at')
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Addons/Appointments', [
            'calendarIntegration' => $this->appointmentCalendarStatus($account->id),
            'appointments' => $appointments->getCollection()->map(fn (AccountAppointment $appointment) => [
                'id' => $appointment->id,
                'title' => $appointment->title,
                'contact' => $appointment->contact_name,
                'phone' => $appointment->contact_phone,
                'date' => $appointment->scheduled_at?->toIso8601String(),
                'duration' => $appointment->duration_minutes,
                'staff' => $appointment->staff_name ?: 'Unassigned',
                'status' => $appointment->status,
                'type' => $appointment->type ?: 'General',
                'location' => $appointment->location,
                'meetingUrl' => $appointment->meeting_url,
                'description' => $appointment->description,
                'source' => $appointment->external_source,
                'externalId' => $appointment->external_id,
                'reminderEnabled' => $appointment->reminder_enabled,
                'reminderMinutesBefore' => $appointment->reminder_minutes_before,
            ]),
            'filters' => ['q' => $q, 'status' => $status],
            'pagination' => $this->paginationMeta($appointments),
        ]);
    }

    public function metaLeads(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'stage' => ['nullable', Rule::in(['new', 'qualified', 'contacted', 'won', 'lost'])],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $stage = $filters['stage'] ?? null;
        $leads = AccountMetaLead::where('account_id', $account->id)
            ->when($stage, fn ($query) => $query->where('stage', $stage))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('form_name', 'like', "%{$q}%")
                    ->orWhere('ad_name', 'like', "%{$q}%");
            }))
            ->latest('captured_at')
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Addons/MetaLeads', [
            'metaIntegration' => $this->metaLeadIntegrationStatus($account->id),
            'leads' => $leads->getCollection()->map(fn (AccountMetaLead $lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'phone' => $lead->phone,
                'email' => $lead->email,
                'city' => $lead->city ?: 'Unknown',
                'stage' => $lead->stage,
                'platform' => $lead->platform,
                'sourceType' => $lead->source_type ?: 'meta_lead',
                'form' => $lead->form_name ?: 'Lead form',
                'adName' => $lead->ad_name ?: 'Meta campaign',
                'campaignName' => $lead->campaign_name,
                'cpl' => $lead->cost_per_lead,
                'score' => $lead->score,
                'assignee' => $lead->assignee_name ?: 'Unassigned',
                'autoTags' => $lead->auto_tags ?: [],
                'time' => $lead->captured_at?->toIso8601String() ?? $lead->created_at?->toIso8601String(),
            ]),
            'filters' => ['q' => $q, 'stage' => $stage],
            'pagination' => $this->paginationMeta($leads),
        ]);
    }

    public function ecommerce(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['pending', 'paid', 'fulfilled', 'completed', 'abandoned', 'cancelled', 'refunded'])],
            'source' => ['nullable', 'string', 'max:80'],
        ]);
        $q = trim((string) ($filters['q'] ?? ''));
        $status = $filters['status'] ?? null;
        $source = $filters['source'] ?? null;
        $integrations = AccountIntegration::where('account_id', $account->id)
            ->whereIn('provider', ['shopify', 'woocommerce', 'razorpay', 'cashfree'])
            ->get();
        $orders = AccountEcommerceOrder::where('account_id', $account->id)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($source, fn ($query) => $query->where('source', $source))
            ->when($q !== '', fn ($query) => $query->where(function ($nested) use ($q) {
                $nested->where('order_number', 'like', "%{$q}%")
                    ->orWhere('customer_name', 'like', "%{$q}%")
                    ->orWhere('customer_phone', 'like', "%{$q}%");
            }))
            ->latest('placed_at')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Addons/Ecommerce', [
            'integrations' => $integrations->map(fn ($integration) => [
                'id' => $integration->provider,
                'platform' => ucfirst(str_replace('-', ' ', $integration->provider)),
                'connected' => $integration->status === 'connected',
                'store' => $integration->config['store_url'] ?? $integration->config['account_email'] ?? null,
                'orders' => AccountEcommerceOrder::where('account_id', $account->id)->where('source', $integration->provider)->count(),
                'revenue' => AccountEcommerceOrder::where('account_id', $account->id)->where('source', $integration->provider)->whereIn('status', ['paid', 'fulfilled', 'completed'])->sum('amount'),
                'abandoned' => AccountEcommerceOrder::where('account_id', $account->id)->where('source', $integration->provider)->where('status', 'abandoned')->count(),
            ]),
            'orders' => $orders->getCollection()->map(fn (AccountEcommerceOrder $order) => [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'amount' => $order->amount,
                'status' => $order->status,
                'source' => $order->source ?: 'manual',
                'paymentUrl' => $order->payment_url,
                'recoveryStatus' => $order->recovery_status,
                'placedAt' => $order->placed_at?->toIso8601String() ?? $order->created_at?->toIso8601String(),
            ]),
            'filters' => ['q' => $q, 'status' => $status, 'source' => $source],
            'pagination' => $this->paginationMeta($orders),
        ]);
    }

    public function channels(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $waba = WhatsAppConnection::where('account_id', $account->id)->orderByDesc('is_active')->first();

        return Inertia::render('Addons/Channels', [
            'channels' => [
                ['id' => 'wa', 'name' => 'WhatsApp Business', 'color' => '#00A548', 'connected' => (bool) $waba, 'handle' => $waba?->business_phone ?: 'Not connected', 'metric' => WhatsAppConversation::where('account_id', $account->id)->count().' conversations', 'route' => 'app.whatsapp.connections.index'],
            ],
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sku' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', Rule::in(['active', 'draft', 'archived'])],
        ]);

        AccountCatalogProduct::create(['account_id' => $account->id, ...$data]);

        return back()->with('success', 'Product added to catalog.');
    }

    public function updateProduct(Request $request, AccountCatalogProduct $product): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $product->account_id);
        $product->update($request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sku' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'draft', 'archived'])],
        ]));

        return back()->with('success', 'Product updated.');
    }

    public function destroyProduct(Request $request, AccountCatalogProduct $product): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $product->account_id);
        $product->delete();

        return back()->with('success', 'Product removed.');
    }

    public function storeOrder(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        AccountEcommerceOrder::create(['account_id' => $account->id, ...$request->validate([
            'order_number' => ['required', 'string', 'max:100', Rule::unique('account_ecommerce_orders')->where('account_id', $account->id)],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['pending', 'paid', 'fulfilled', 'completed', 'abandoned', 'cancelled', 'refunded'])],
            'source' => ['nullable', 'string', 'max:80'],
            'payment_url' => ['nullable', 'url', 'max:800'],
            'recovery_status' => ['nullable', Rule::in(['none', 'queued', 'sent', 'recovered', 'failed'])],
            'placed_at' => ['nullable', 'date'],
        ])]);

        return back()->with('success', 'Order added.');
    }

    public function updateOrder(Request $request, AccountEcommerceOrder $order): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $order->account_id);
        $order->update($request->validate([
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['pending', 'paid', 'fulfilled', 'completed', 'abandoned', 'cancelled', 'refunded'])],
            'source' => ['nullable', 'string', 'max:80'],
            'payment_url' => ['nullable', 'url', 'max:800'],
            'recovery_status' => ['nullable', Rule::in(['none', 'queued', 'sent', 'recovered', 'failed'])],
            'placed_at' => ['nullable', 'date'],
        ]));

        return back()->with('success', 'Order updated.');
    }

    public function destroyOrder(Request $request, AccountEcommerceOrder $order): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $order->account_id);
        $order->delete();

        return back()->with('success', 'Order removed.');
    }

    public function createOrderPaymentLink(Request $request, AccountEcommerceOrder $order, RazorpayPaymentLinkService $paymentLinks): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $order->account_id);
        abort_unless($order->amount >= 100, 422, 'Order amount must be at least INR 1.00.');

        try {
            $link = $paymentLinks->createForAccount($order->account, [
                'amount' => $order->amount,
                'currency' => $order->currency ?: 'INR',
                'reference_id' => 'order_'.$order->id.'_'.time(),
                'description' => 'Payment for order '.$order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'notes' => [
                    'source' => 'ecommerce_order',
                    'order_id' => (string) $order->id,
                    'order_number' => $order->order_number,
                ],
            ]);

            $metadata = $order->metadata ?: [];
            $metadata['razorpay_payment_link'] = $link;
            $order->update([
                'payment_url' => $link['short_url'] ?? $link['short_url'] ?? $link['url'] ?? null,
                'recovery_status' => $order->status === 'abandoned' ? 'queued' : $order->recovery_status,
                'metadata' => $metadata,
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', 'Payment link failed: '.$e->getMessage());
        }

        return back()->with('success', 'Razorpay payment link created.');
    }

    public function convertOrderToContact(Request $request, AccountEcommerceOrder $order): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $order->account_id);
        abort_unless($order->customer_phone, 422, 'Order customer phone is required to create a WhatsApp contact.');

        $contact = $this->findOrCreateContact($order->account_id, $order->customer_name, $order->customer_phone, null, 'ecommerce_order', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'source' => $order->source,
        ]);

        return redirect()->route('app.contacts.index', ['contact' => $contact->slug])
            ->with('success', 'Order customer converted to contact.');
    }

    public function storeSurvey(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        AccountSurvey::create(['account_id' => $account->id, ...$request->validate([
            'name' => ['required', 'string', 'max:160'],
            'type' => ['required', 'string', 'max:60'],
            'trigger' => ['nullable', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'paused', 'archived'])],
            'average_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'questions' => ['nullable', 'array'],
            'questions.*' => ['nullable', 'string', 'max:500'],
            'auto_create_contact' => ['nullable', 'boolean'],
            'contact_name_field' => ['nullable', 'string', 'max:80'],
            'contact_phone_field' => ['nullable', 'string', 'max:80'],
            'contact_email_field' => ['nullable', 'string', 'max:80'],
            'auto_tag_names' => ['nullable', 'array'],
            'auto_tag_names.*' => ['nullable', 'string', 'max:60'],
            'success_message' => ['nullable', 'string', 'max:1000'],
            'automation_enabled' => ['nullable', 'boolean'],
            'automation_bot_flow_id' => ['nullable', Rule::exists('bot_flows', 'id')->where('account_id', $account->id)],
        ])]);

        return back()->with('success', 'Survey created.');
    }

    public function updateSurvey(Request $request, AccountSurvey $survey): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $survey->account_id);
        $survey->update($request->validate([
            'name' => ['required', 'string', 'max:160'],
            'type' => ['required', 'string', 'max:60'],
            'trigger' => ['nullable', 'string', 'max:160'],
            'status' => ['required', Rule::in(['draft', 'active', 'paused', 'archived'])],
            'average_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'questions' => ['nullable', 'array'],
            'questions.*' => ['nullable', 'string', 'max:500'],
            'auto_create_contact' => ['nullable', 'boolean'],
            'contact_name_field' => ['nullable', 'string', 'max:80'],
            'contact_phone_field' => ['nullable', 'string', 'max:80'],
            'contact_email_field' => ['nullable', 'string', 'max:80'],
            'auto_tag_names' => ['nullable', 'array'],
            'auto_tag_names.*' => ['nullable', 'string', 'max:60'],
            'success_message' => ['nullable', 'string', 'max:1000'],
            'automation_enabled' => ['nullable', 'boolean'],
            'automation_bot_flow_id' => ['nullable', Rule::exists('bot_flows', 'id')->where('account_id', $survey->account_id)],
        ]));

        return back()->with('success', 'Survey updated.');
    }

    public function destroySurvey(Request $request, AccountSurvey $survey): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $survey->account_id);
        $survey->delete();

        return back()->with('success', 'Survey removed.');
    }

    public function storeAppointment(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $appointment = AccountAppointment::create(['account_id' => $account->id, ...$request->validate([
            'title' => ['required', 'string', 'max:160'],
            'contact_name' => ['required', 'string', 'max:160'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:1440'],
            'staff_name' => ['nullable', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])],
            'type' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:800'],
            'description' => ['nullable', 'string', 'max:2000'],
            'reminder_enabled' => ['nullable', 'boolean'],
            'reminder_minutes_before' => ['nullable', 'integer', 'min:0', 'max:10080'],
        ])]);

        $googleResult = $this->syncAppointmentToGoogleCalendar($appointment, 'create');
        if ($googleResult['error'] ?? null) {
            return back()->with('warning', 'Appointment created, but Google Calendar sync failed: '.$googleResult['error']);
        }

        return back()->with('success', 'Appointment created.');
    }

    public function updateAppointment(Request $request, AccountAppointment $appointment): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $appointment->account_id);
        $appointment->update($request->validate([
            'title' => ['required', 'string', 'max:160'],
            'contact_name' => ['required', 'string', 'max:160'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:1440'],
            'staff_name' => ['nullable', 'string', 'max:160'],
            'status' => ['required', Rule::in(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])],
            'type' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:800'],
            'description' => ['nullable', 'string', 'max:2000'],
            'reminder_enabled' => ['nullable', 'boolean'],
            'reminder_minutes_before' => ['nullable', 'integer', 'min:0', 'max:10080'],
        ]));

        $googleResult = $this->syncAppointmentToGoogleCalendar($appointment->refresh(), 'update');
        if ($googleResult['error'] ?? null) {
            return back()->with('warning', 'Appointment updated, but Google Calendar sync failed: '.$googleResult['error']);
        }

        return back()->with('success', 'Appointment updated.');
    }

    public function destroyAppointment(Request $request, AccountAppointment $appointment): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $appointment->account_id);
        $googleResult = $this->deleteAppointmentFromGoogleCalendar($appointment);
        $appointment->delete();

        if ($googleResult['error'] ?? null) {
            return back()->with('warning', 'Appointment removed locally, but Google Calendar delete failed: '.$googleResult['error']);
        }

        return back()->with('success', 'Appointment removed.');
    }

    public function sendAppointmentReminder(Request $request, AccountAppointment $appointment): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $appointment->account_id);
        abort_unless($appointment->contact_phone, 422, 'Appointment contact phone is required.');

        $connection = WhatsAppConnection::where('account_id', $appointment->account_id)
            ->where('is_active', true)
            ->first();
        abort_unless($connection, 422, 'Connect an active WABA account before sending reminders.');

        $contact = $this->findOrCreateContact($appointment->account_id, $appointment->contact_name, $appointment->contact_phone, null, 'appointment');
        $conversation = $this->findOrCreateConversation($appointment->account_id, $connection->id, $contact->id);
        $body = sprintf(
            'Reminder: %s is scheduled for %s. Reply here if you need to reschedule.',
            $appointment->title,
            $appointment->scheduled_at?->format('d M Y, h:i A') ?? 'your appointment'
        );
        if ($appointment->meeting_url) {
            $body .= "\nJoin: ".$appointment->meeting_url;
        } elseif ($appointment->location) {
            $body .= "\nLocation: ".$appointment->location;
        }

        $message = WhatsAppMessage::create([
            'account_id' => $appointment->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'text',
            'text_body' => $body,
            'status' => 'queued',
        ]);

        try {
            $response = app(WhatsAppClient::class)->sendTextMessage($connection, $contact->wa_id, $body);
            $message->update([
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => $response,
            ]);
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($body, 0, 100),
            ]);
            $appointment->update(['reminder_sent_at' => now()]);
            app(UsageService::class)->incrementMessages($appointment->account, 1);
        } catch (\Throwable $e) {
            $message->update(['status' => 'failed', 'error_message' => $e->getMessage()]);

            return back()->with('error', 'Reminder failed: '.$e->getMessage());
        }

        return back()->with('success', 'Appointment reminder sent.');
    }

    public function storeMetaLead(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        AccountMetaLead::create(['account_id' => $account->id, ...$request->validate([
            'external_id' => ['nullable', 'string', 'max:160', Rule::unique('account_meta_leads')->where('account_id', $account->id)],
            'name' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'city' => ['nullable', 'string', 'max:100'],
            'stage' => ['nullable', Rule::in(['new', 'qualified', 'contacted', 'won', 'lost'])],
            'platform' => ['nullable', Rule::in(['Facebook', 'Instagram'])],
            'source_type' => ['nullable', Rule::in(['meta_lead', 'ctwa', 'manual'])],
            'form_name' => ['nullable', 'string', 'max:160'],
            'ad_name' => ['nullable', 'string', 'max:160'],
            'campaign_name' => ['nullable', 'string', 'max:160'],
            'cost_per_lead' => ['nullable', 'integer', 'min:0'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'assignee_name' => ['nullable', 'string', 'max:160'],
            'auto_tags' => ['nullable', 'array'],
            'auto_tags.*' => ['string', 'max:80'],
            'captured_at' => ['nullable', 'date'],
        ])]);

        return back()->with('success', 'Lead added.');
    }

    public function updateMetaLead(Request $request, AccountMetaLead $lead): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $lead->account_id);
        $lead->update($request->validate([
            'name' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'city' => ['nullable', 'string', 'max:100'],
            'stage' => ['required', Rule::in(['new', 'qualified', 'contacted', 'won', 'lost'])],
            'platform' => ['required', Rule::in(['Facebook', 'Instagram'])],
            'source_type' => ['nullable', Rule::in(['meta_lead', 'ctwa', 'manual'])],
            'form_name' => ['nullable', 'string', 'max:160'],
            'ad_name' => ['nullable', 'string', 'max:160'],
            'campaign_name' => ['nullable', 'string', 'max:160'],
            'cost_per_lead' => ['nullable', 'integer', 'min:0'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'assignee_name' => ['nullable', 'string', 'max:160'],
            'auto_tags' => ['nullable', 'array'],
            'auto_tags.*' => ['string', 'max:80'],
            'captured_at' => ['nullable', 'date'],
        ]));

        return back()->with('success', 'Lead updated.');
    }

    public function destroyMetaLead(Request $request, AccountMetaLead $lead): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $lead->account_id);
        $lead->delete();

        return back()->with('success', 'Lead removed.');
    }

    public function convertMetaLeadToContact(Request $request, AccountMetaLead $lead): RedirectResponse
    {
        $this->authorizeWorkspaceRecord($request, $lead->account_id);
        abort_unless($lead->phone, 422, 'Lead phone is required to create a WhatsApp contact.');

        $contact = $this->findOrCreateContact($lead->account_id, $lead->name, $lead->phone, $lead->email, 'meta_lead', [
            'meta_lead_id' => $lead->id,
            'platform' => $lead->platform,
            'form' => $lead->form_name,
            'campaign' => $lead->campaign_name,
            'source_type' => $lead->source_type,
        ]);
        foreach (($lead->auto_tags ?: []) as $tagName) {
            $tagName = trim((string) $tagName);
            if ($tagName === '') {
                continue;
            }
            $tag = \App\Modules\Contacts\Models\ContactTag::firstOrCreate(
                ['account_id' => $lead->account_id, 'name' => $tagName],
                ['color' => '#10b981']
            );
            $contact->tags()->syncWithoutDetaching([$tag->id]);
        }
        $lead->update(['stage' => 'contacted']);

        return redirect()->route('app.contacts.index', ['contact' => $contact->slug])
            ->with('success', 'Lead converted to contact.');
    }

    private function syncAppointmentToGoogleCalendar(AccountAppointment $appointment, string $action): array
    {
        $integration = $this->googleCalendarIntegration($appointment->account_id);
        if (! $integration) {
            return ['skipped' => true];
        }

        $syncDirection = (string) ($integration->config['sync_direction'] ?? 'import');
        $isGoogleBacked = $appointment->external_source === 'google_calendar' && filled($appointment->external_id);
        if (! $isGoogleBacked && ! in_array($syncDirection, ['export', 'bidirectional'], true)) {
            return ['skipped' => true];
        }

        try {
            $token = $this->googleAccessToken($integration);
            $calendarId = (string) ($integration->config['calendar_id'] ?? 'primary') ?: 'primary';
            $startsAt = $appointment->scheduled_at ?: now();
            $endsAt = $startsAt->copy()->addMinutes(max(5, (int) ($appointment->duration_minutes ?: 30)));
            $payload = [
                'summary' => $appointment->title,
                'description' => trim(collect([
                    $appointment->description,
                    'Contact: '.$appointment->contact_name,
                    $appointment->contact_phone ? 'Phone: '.$appointment->contact_phone : null,
                ])->filter()->join("\n")),
                'location' => $appointment->location ?: null,
                'start' => [
                    'dateTime' => $startsAt->toRfc3339String(),
                    'timeZone' => config('app.timezone', 'UTC'),
                ],
                'end' => [
                    'dateTime' => $endsAt->toRfc3339String(),
                    'timeZone' => config('app.timezone', 'UTC'),
                ],
                'extendedProperties' => [
                    'private' => [
                        'zyptos_account_id' => (string) $appointment->account_id,
                        'zyptos_appointment_id' => (string) $appointment->id,
                    ],
                ],
            ];

            if ($appointment->status === 'cancelled') {
                $payload['status'] = 'cancelled';
            }

            $query = [];
            if (! $appointment->meeting_url && (bool) ($integration->config['create_google_meet'] ?? false)) {
                $query['conferenceDataVersion'] = 1;
                $payload['conferenceData'] = [
                    'createRequest' => [
                        'requestId' => 'zyptos-'.$appointment->id.'-'.substr(sha1((string) $appointment->updated_at), 0, 10),
                    ],
                ];
            }

            $baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/'.rawurlencode($calendarId).'/events';
            $response = ($appointment->external_id && $appointment->external_source === 'google_calendar')
                ? Http::withToken($token)->acceptJson()->timeout(25)->patch($baseUrl.'/'.rawurlencode($appointment->external_id).($query ? '?'.http_build_query($query) : ''), $payload)
                : Http::withToken($token)->acceptJson()->timeout(25)->post($baseUrl.($query ? '?'.http_build_query($query) : ''), $payload);

            $event = $response->throw()->json();
            $metadata = $appointment->metadata ?: [];
            $metadata['google_calendar'] = [
                'calendar_id' => $calendarId,
                'html_link' => $event['htmlLink'] ?? null,
                'synced_at' => now()->toIso8601String(),
                'action' => $action,
            ];

            $appointment->forceFill([
                'external_source' => 'google_calendar',
                'external_id' => (string) ($event['id'] ?? $appointment->external_id),
                'meeting_url' => $appointment->meeting_url ?: ($event['hangoutLink'] ?? $event['conferenceData']['entryPoints'][0]['uri'] ?? null),
                'metadata' => $metadata,
            ])->save();

            return ['synced' => true, 'event_id' => $appointment->external_id];
        } catch (\Throwable $e) {
            Log::warning('Google Calendar appointment sync failed', [
                'appointment_id' => $appointment->id,
                'account_id' => $appointment->account_id,
                'error' => $e->getMessage(),
            ]);

            return ['error' => $e->getMessage()];
        }
    }

    private function deleteAppointmentFromGoogleCalendar(AccountAppointment $appointment): array
    {
        if ($appointment->external_source !== 'google_calendar' || blank($appointment->external_id)) {
            return ['skipped' => true];
        }

        $integration = $this->googleCalendarIntegration($appointment->account_id);
        if (! $integration) {
            return ['skipped' => true];
        }

        try {
            $token = $this->googleAccessToken($integration);
            $calendarId = (string) ($integration->config['calendar_id'] ?? 'primary') ?: 'primary';
            Http::withToken($token)
                ->acceptJson()
                ->timeout(20)
                ->delete('https://www.googleapis.com/calendar/v3/calendars/'.rawurlencode($calendarId).'/events/'.rawurlencode($appointment->external_id))
                ->throw();

            return ['deleted' => true];
        } catch (\Throwable $e) {
            Log::warning('Google Calendar appointment delete failed', [
                'appointment_id' => $appointment->id,
                'account_id' => $appointment->account_id,
                'error' => $e->getMessage(),
            ]);

            return ['error' => $e->getMessage()];
        }
    }

    private function googleCalendarIntegration(int $accountId): ?AccountIntegration
    {
        return AccountIntegration::where('account_id', $accountId)
            ->where('provider', 'google-calendar')
            ->where('status', 'connected')
            ->first();
    }

    private function appointmentCalendarStatus(int $accountId): ?array
    {
        $integration = AccountIntegration::where('account_id', $accountId)
            ->where('provider', 'google-calendar')
            ->first();

        if (! $integration) {
            return null;
        }

        return [
            'connected' => $integration->status === 'connected',
            'status' => $integration->status,
            'health' => $integration->health,
            'lastSyncAt' => $integration->last_sync_at?->toIso8601String(),
            'lastError' => $integration->last_error,
            'syncDirection' => $integration->config['sync_direction'] ?? 'import',
            'calendarId' => $integration->config['calendar_id'] ?? 'primary',
            'createGoogleMeet' => (bool) ($integration->config['create_google_meet'] ?? false),
        ];
    }

    private function metaLeadIntegrationStatus(int $accountId): ?array
    {
        $integration = AccountIntegration::where('account_id', $accountId)
            ->where('provider', 'meta-leads')
            ->first();

        if (! $integration) {
            return null;
        }

        $forms = collect($integration->config['lead_forms'] ?? [])
            ->filter(fn ($form) => is_array($form))
            ->map(fn (array $form) => [
                'id' => (string) ($form['id'] ?? ''),
                'name' => (string) ($form['name'] ?? 'Lead form'),
                'status' => $form['status'] ?? null,
            ])
            ->filter(fn (array $form) => $form['id'] !== '')
            ->values()
            ->all();

        return [
            'connected' => $integration->status === 'connected',
            'status' => $integration->status,
            'health' => $integration->health,
            'lastSyncAt' => $integration->last_sync_at?->toIso8601String(),
            'lastError' => $integration->last_error,
            'pageId' => $integration->config['page_id'] ?? null,
            'pageName' => $integration->config['page_name'] ?? null,
            'formId' => $integration->config['form_id'] ?? null,
            'formName' => $integration->config['form_name'] ?? null,
            'autoCreateContact' => (bool) ($integration->config['auto_create_contact'] ?? false),
            'forms' => $forms,
        ];
    }

    private function googleAccessToken(AccountIntegration $integration): string
    {
        $token = (string) ($integration->config['access_token'] ?? '');
        $expiresAt = isset($integration->config['expires_at']) ? Carbon::parse($integration->config['expires_at']) : null;
        if ($token !== '' && (! $expiresAt || $expiresAt->isFuture())) {
            return $token;
        }

        $refreshToken = (string) ($integration->config['refresh_token'] ?? '');
        if ($refreshToken === '') {
            throw new \RuntimeException('Google refresh token is missing. Reconnect Google Calendar.');
        }

        try {
            $response = Http::asForm()
                ->timeout(20)
                ->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'refresh_token' => $refreshToken,
                    'grant_type' => 'refresh_token',
                ])
                ->throw()
                ->json();
        } catch (\Throwable $e) {
            if (str_contains(strtolower($e->getMessage()), 'invalid_grant')) {
                $integration->update([
                    'status' => 'configured',
                    'health' => 'error',
                    'last_error' => 'Google access was revoked or expired. Reconnect Google Calendar.',
                ]);
            }

            throw $e;
        }

        $newToken = (string) ($response['access_token'] ?? '');
        if ($newToken === '') {
            throw new \RuntimeException('Google did not return a refreshed access token.');
        }

        $integration->update([
            'config' => [
                ...($integration->config ?? []),
                'access_token' => $newToken,
                'expires_at' => now()->addSeconds((int) ($response['expires_in'] ?? 3600))->toIso8601String(),
            ],
        ]);

        return $newToken;
    }

    private function authorizeWorkspaceRecord(Request $request, int $accountId): void
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && account_ids_match($account->id, $accountId), 404);
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1).' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return $bytes.' B';
    }

    private function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
        ];
    }

    private function findOrCreateContact(int $accountId, string $name, string $phone, ?string $email = null, ?string $source = null, array $metadata = []): WhatsAppContact
    {
        $waId = preg_replace('/\D+/', '', $phone);

        $contact = WhatsAppContact::withTrashed()->firstOrNew(['account_id' => $accountId, 'wa_id' => $waId]);
        $contact->fill([
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'status' => 'active',
            'source' => $source,
            'metadata' => array_filter($metadata),
        ]);
        $contact->save();

        if (method_exists($contact, 'restore') && $contact->trashed()) {
            $contact->restore();
        }

        return $contact->fresh();
    }

    private function findOrCreateConversation(int $accountId, int $connectionId, int $contactId): WhatsAppConversation
    {
        return WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $accountId,
                'whatsapp_connection_id' => $connectionId,
                'whatsapp_contact_id' => $contactId,
                'status' => 'open',
            ],
            [
                'last_message_at' => now(),
            ]
        );
    }
}
