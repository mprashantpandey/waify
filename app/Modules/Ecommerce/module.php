<?php

return [
    'key' => 'ecommerce',
    'name' => 'WhatsApp Commerce',
    'description' => 'Product catalog and order capture workflows for WhatsApp',
    'enabled_by_default' => false,
    'is_core' => false,
    'icon' => 'ShoppingCart',
    'nav' => [
        [
            'label' => 'Commerce',
            'href' => 'app.ecommerce.index',
            'icon' => 'ShoppingCart',
            'group' => 'growth',
        ],
        [
            'label' => 'Products',
            'href' => 'app.ecommerce.products.index',
            'icon' => 'Package',
            'group' => 'growth',
        ],
        [
            'label' => 'Orders',
            'href' => 'app.ecommerce.orders.index',
            'icon' => 'Receipt',
            'group' => 'growth',
        ],
    ],
];

