<?php

return [
    'key' => 'contacts',
    'name' => 'Contacts & CRM',
    'description' => 'Manage contacts, segments, and customer relationships',
    'enabled_by_default' => false,
    'is_core' => false,
    'icon' => 'Users',
    'nav' => [
        [
            'label' => 'Contacts',
            'href' => 'app.contacts.index',
            'icon' => 'Users',
            'group' => 'messaging',
        ],
    ],
];

