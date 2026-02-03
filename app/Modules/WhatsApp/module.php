<?php

return [
    'key' => 'whatsapp.cloud',
    'name' => 'WhatsApp Cloud',
    'description' => 'Connect and manage Meta WhatsApp Cloud API',
    'enabled_by_default' => true,
    'is_core' => false,
    'icon' => 'MessageCircle',
    'nav' => [
        [
            'label' => 'Inbox',
            'href' => 'app.whatsapp.conversations.index',
            'icon' => 'Inbox',
            'group' => 'messaging'],
        [
            'label' => 'Templates',
            'href' => 'app.whatsapp.templates.index',
            'icon' => 'FileText',
            'group' => 'messaging'],
        [
            'label' => 'Connections',
            'href' => 'app.whatsapp.connections.index',
            'icon' => 'Settings',
            'group' => 'messaging']]];

