<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Modules\Chatbots\Models\BotEdge;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use Illuminate\Support\Facades\DB;

$accountId = 5;
$flowNames = ['Pricing path - media + deal + AI sales', 'Button - pricing path'];
$message = "Zyptos pricing test:\n\nStarter: WhatsApp CRM basics.\nGrowth: automation, broadcasts, AI agents, reports.\nScale: routing, webhooks, integrations.\n\nPricing page: https://zyptos.com/pricing\n\nReply payment for a payment link, image for brochure, ai for sales AI, demo to book a walkthrough, or human for handoff.";

DB::transaction(function () use ($accountId, $flowNames, $message) {
    $flows = BotFlow::where('account_id', $accountId)->whereIn('name', $flowNames)->get();

    foreach ($flows as $flow) {
        BotEdge::where('bot_flow_id', $flow->id)->delete();
        BotNode::where('bot_flow_id', $flow->id)->delete();

        $nodes = [];
        $payloads = [
            ['action_type' => 'send_text', 'message' => $message, 'is_start' => true],
            ['action_type' => 'add_tag', 'tag_name' => 'Pricing Interest', 'color' => '#10B981'],
            ['action_type' => 'create_deal', 'title' => 'Zyptos pricing lead', 'stage' => 'qualified', 'value' => 49900, 'currency' => 'INR', 'source' => 'chatbot_pricing_flow'],
        ];

        foreach ($payloads as $index => $config) {
            $nodes[] = BotNode::create([
                'account_id' => $accountId,
                'bot_flow_id' => $flow->id,
                'type' => 'action',
                'config' => $config,
                'sort_order' => $index + 1,
                'pos_x' => 120 + ($index * 290),
                'pos_y' => 180,
            ]);
        }

        for ($i = 1; $i < count($nodes); $i++) {
            BotEdge::create([
                'account_id' => $accountId,
                'bot_flow_id' => $flow->id,
                'from_node_id' => $nodes[$i - 1]->id,
                'to_node_id' => $nodes[$i]->id,
                'label' => 'next',
                'sort_order' => $i,
            ]);
        }

        echo "Simplified pricing flow {$flow->id}: {$flow->name}\n";
    }
});
