<?php

return [
    'key' => 'templates',
    'name' => 'Templates',
    'description' => 'Manage WhatsApp message templates',
    'enabled_by_default' => false,
    'is_core' => false,
    'icon' => 'FileText',
    'nav' => [
        [
            'label' => 'Templates',
            'href' => 'app.whatsapp.templates.index',
            'icon' => 'FileText',
            'group' => 'messaging',
        ],
    ],
];

