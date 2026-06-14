<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotEdge;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use Illuminate\Support\Facades\DB;

$accountId = (int) ($argv[1] ?? 5);

$bot = Bot::where('account_id', $accountId)
    ->where(function ($query) {
        $query->where('name', 'Zyptos Deep Demo Assistant')
            ->orWhere('name', 'Zyptos Production Journey Demo')
            ->orWhere('is_default', true);
    })
    ->orderByDesc('name')
    ->first();

if (! $bot) {
    $bot = Bot::create([
        'account_id' => $accountId,
        'name' => 'Zyptos Production Journey Demo',
        'status' => 'active',
        'description' => 'One clean branched Zyptos sales/support/payment/AI automation journey.',
        'applies_to' => ['all_connections' => true, 'connection_ids' => []],
        'stop_on_first_flow' => true,
    ]);
}

$bot->forceFill([
    'name' => 'Zyptos Production Journey Demo',
    'description' => 'Single visual journey with branches for pricing, payment, media, demo booking, AI sales, support, and handoff.',
    'status' => 'active',
    'applies_to' => ['all_connections' => true, 'connection_ids' => []],
    'stop_on_first_flow' => true,
])->save();

$salesAgentId = DB::table('ai_agents')->where('account_id', $accountId)->where('role', 'sales')->where('is_active', true)->value('id');
$supportAgentId = DB::table('ai_agents')->where('account_id', $accountId)->where('role', 'support')->where('is_active', true)->value('id');
$humanAgentId = DB::table('accounts')->where('id', $accountId)->value('owner_id');

$created = DB::transaction(function () use ($accountId, $bot, $salesAgentId, $supportAgentId, $humanAgentId) {
    $flowIds = BotFlow::where('account_id', $accountId)->where('bot_id', $bot->id)->pluck('id');
    if ($flowIds->isNotEmpty()) {
        BotEdge::whereIn('bot_flow_id', $flowIds)->delete();
        BotNode::whereIn('bot_flow_id', $flowIds)->delete();
        BotFlow::whereIn('id', $flowIds)->delete();
    }

    $flow = BotFlow::create([
        'account_id' => $accountId,
        'bot_id' => $bot->id,
        'name' => 'Zyptos sales/support journey',
        'trigger' => [
            'type' => 'keyword',
            'keywords' => [
                'hi', 'hello', 'menu', 'start', 'help',
                'pricing', 'price', 'plans',
                'payment', 'pay', 'checkout', 'razorpay',
                'image', 'brochure', 'features',
                'demo', 'walkthrough', 'call',
                'support', 'human', 'issue', 'problem',
                'ai', 'agent', 'sales',
            ],
            'match_type' => 'any',
            'whole_word' => false,
            'case_sensitive' => false,
            'cooldown_minutes' => 1,
        ],
        'enabled' => true,
        'priority' => 10,
    ]);

    $nodes = [];
    $node = function (string $key, string $type, array $config, int $x, int $y) use ($accountId, $flow, &$nodes) {
        $nodes[$key] = BotNode::create([
            'account_id' => $accountId,
            'bot_flow_id' => $flow->id,
            'type' => $type,
            'config' => $config,
            'sort_order' => count($nodes) + 1,
            'pos_x' => $x,
            'pos_y' => $y,
        ]);
    };

    $condition = function (string $key, string $pattern, int $x, int $y, bool $start = false) use ($node) {
        $config = [
            'type' => 'regex_match',
            'pattern' => $pattern,
            'case_sensitive' => false,
        ];
        if ($start) {
            $config['is_start'] = true;
        }
        $node($key, 'condition', $config, $x, $y);
    };

    $action = fn (string $key, array $config, int $x, int $y) => $node($key, 'action', $config, $x, $y);

    $condition('c_pricing', '/pricing|price|plan|show_pricing/i', 80, 120, true);
    $condition('c_payment', '/payment|pay|checkout|razorpay|pay_link/i', 80, 300);
    $condition('c_media', '/image|brochure|feature|features|overview/i', 80, 480);
    $condition('c_demo', '/demo|walkthrough|book|call/i', 80, 660);
    $condition('c_support', '/support|human|issue|problem|help me|talk_human/i', 80, 840);
    $condition('c_ai', '/ai|agent|sales/i', 80, 1020);

    $action('pricing_text', [
        'action_type' => 'send_text',
        'message' => "Zyptos pricing test:\n\nStarter: WhatsApp CRM basics.\nGrowth: automation, broadcasts, AI agents, reports.\nScale: routing, webhooks, integrations.\n\nPricing page: https://zyptos.com/pricing\n\nReply payment for a checkout link, image for feature overview, demo to book a walkthrough, or ai for a sales assistant.",
    ], 420, 80);
    $action('pricing_tag', ['action_type' => 'add_tag', 'tag_name' => 'Pricing Interest', 'color' => '#10B981'], 760, 80);
    $action('pricing_deal', ['action_type' => 'create_deal', 'title' => 'Zyptos pricing lead', 'stage' => 'qualified', 'value' => 49900, 'currency' => 'INR', 'source' => 'chatbot_pricing_journey'], 1080, 80);

    $action('payment_text', [
        'action_type' => 'send_text',
        'message' => 'Creating a Zyptos test payment link for INR 499. If workspace Razorpay credentials are configured, this creates a live dynamic payment link.',
    ], 420, 260);
    $action('payment_link', [
        'action_type' => 'send_payment_link',
        'create_razorpay_link' => true,
        'fallback_payment_url' => 'https://zyptos.com/pricing',
        'amount' => 49900,
        'currency' => 'INR',
        'description' => 'Zyptos demo payment',
        'message' => 'Here is your Zyptos payment link for {{currency}} {{amount}}: {{payment_url}}',
    ], 760, 260);
    $action('payment_tag', ['action_type' => 'add_tag', 'tag_name' => 'Payment Intent', 'color' => '#F59E0B'], 1080, 260);

    $action('media_image', ['action_type' => 'send_media', 'media_type' => 'image', 'media_url' => 'https://zyptos.com/demo/zyptos-overview.png', 'caption' => 'Zyptos feature overview: inbox, automation, broadcasts, AI agents, payments, and analytics.'], 420, 440);
    $action('media_text', ['action_type' => 'send_text', 'message' => "Feature map:\n- Shared WhatsApp inbox\n- Chatbot automation builder\n- AI sales/support agents\n- Broadcasts and templates\n- Leads, contacts, tags, deals\n- Payment links and ecommerce recovery\n- WABA diagnostics\n\nReply pricing, payment, demo, support, or ai."], 760, 440);

    $action('demo_tag', ['action_type' => 'add_tag', 'tag_name' => 'Demo Requested', 'color' => '#3B82F6'], 420, 620);
    $action('demo_deal', ['action_type' => 'create_deal', 'title' => 'Zyptos demo request', 'stage' => 'demo_requested', 'value' => 0, 'currency' => 'INR', 'source' => 'chatbot_demo_journey'], 760, 620);
    $action('demo_text', ['action_type' => 'send_text', 'message' => 'Demo request captured. Please share company name, team size, use case, and preferred time. The AI sales agent will qualify the request next.'], 1080, 620);
    $action('demo_ai', ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'max_chars' => 1200, 'handoff_rule' => 'Handoff if customer asks for a human, asks for custom pricing, or gives a time slot.', 'instruction' => 'The customer wants a Zyptos demo. Ask only for missing details: company name, WhatsApp volume, use case, team size, and preferred demo time. Keep it short and do not repeat the deterministic message.'], 1420, 620);

    $action('support_tag', ['action_type' => 'add_tag', 'tag_name' => 'Support Needed', 'color' => '#EF4444'], 420, 800);
    $action('support_ai', ['action_type' => 'ai_agent_reply', 'agent_id' => $supportAgentId, 'agent_role' => 'support', 'max_chars' => 1200, 'handoff_rule' => 'Handoff if billing, WABA, webhook, failed payment, or app error needs human review.', 'instruction' => 'You are Zyptos Support Agent. Triage the issue, ask for the exact error/screenshot if needed, and mention that a human handoff has been marked.'], 760, 800);
    $handoff = ['action_type' => 'handoff', 'priority' => 'high', 'status' => 'open', 'reason' => 'Customer requested human/support help'];
    if ($humanAgentId) {
        $handoff['agent_id'] = (int) $humanAgentId;
    }
    $action('support_handoff', $handoff, 1080, 800);

    $action('ai_sales', ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'max_chars' => 1500, 'handoff_rule' => 'Handoff if customer asks for custom quote, human callback, legal terms, or unclear support issue.', 'instruction' => 'You are Zyptos Sales Agent. Qualify the customer for WhatsApp CRM, WABA setup, broadcasts, chatbots, AI agents, payment links, and ecommerce recovery. Ask one next-step question only.'], 420, 980);

    $action('menu_buttons', [
        'action_type' => 'send_buttons',
        'header_text' => 'Zyptos demo',
        'body_text' => "Choose what to test.\n\nYou can also type: pricing, payment, image, demo, support, or ai.",
        'footer_text' => 'One branched journey',
        'buttons' => [
            ['id' => 'show_pricing', 'text' => 'Pricing'],
            ['id' => 'pay_link', 'text' => 'Payment'],
            ['id' => 'ai_agent', 'text' => 'AI agent'],
        ],
    ], 420, 1160);

    $edge = function (string $from, string $to, string $label, int $order) use ($accountId, $flow, &$nodes) {
        BotEdge::create([
            'account_id' => $accountId,
            'bot_flow_id' => $flow->id,
            'from_node_id' => $nodes[$from]->id,
            'to_node_id' => $nodes[$to]->id,
            'label' => $label,
            'sort_order' => $order,
        ]);
    };

    $order = 1;
    $edge('c_pricing', 'pricing_text', 'true', $order++);
    $edge('c_pricing', 'c_payment', 'false', $order++);
    $edge('pricing_text', 'pricing_tag', 'next', $order++);
    $edge('pricing_tag', 'pricing_deal', 'next', $order++);

    $edge('c_payment', 'payment_text', 'true', $order++);
    $edge('c_payment', 'c_media', 'false', $order++);
    $edge('payment_text', 'payment_link', 'next', $order++);
    $edge('payment_link', 'payment_tag', 'next', $order++);

    $edge('c_media', 'media_image', 'true', $order++);
    $edge('c_media', 'c_demo', 'false', $order++);
    $edge('media_image', 'media_text', 'next', $order++);

    $edge('c_demo', 'demo_tag', 'true', $order++);
    $edge('c_demo', 'c_support', 'false', $order++);
    $edge('demo_tag', 'demo_deal', 'next', $order++);
    $edge('demo_deal', 'demo_text', 'next', $order++);
    $edge('demo_text', 'demo_ai', 'next', $order++);

    $edge('c_support', 'support_tag', 'true', $order++);
    $edge('c_support', 'c_ai', 'false', $order++);
    $edge('support_tag', 'support_ai', 'next', $order++);
    $edge('support_ai', 'support_handoff', 'next', $order++);

    $edge('c_ai', 'ai_sales', 'true', $order++);
    $edge('c_ai', 'menu_buttons', 'false', $order++);

    return [$flow->id, count($nodes), $order - 1];
});

[$flowId, $nodeCount, $edgeCount] = $created;

echo "Bot {$bot->id} rebuilt as one visual journey.\n";
echo "Flow {$flowId}: nodes={$nodeCount} edges={$edgeCount}\n";
