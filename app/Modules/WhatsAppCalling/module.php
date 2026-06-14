<?php

return [
    'key' => 'whatsapp.calling',
    'name' => 'WhatsApp Calling',
    'description' => 'Enable, diagnose, and route WhatsApp Business calls',
    'enabled_by_default' => false,
    'is_core' => false,
    'icon' => 'PhoneCall',
    'nav' => [
        [
            'label' => 'WhatsApp Calls',
            'href' => 'app.whatsapp-calls.index',
            'icon' => 'PhoneCall',
            'group' => 'ai',
        ],
    ],
];
