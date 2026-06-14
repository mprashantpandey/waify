part of 'main.dart';

const apiBaseUrl = String.fromEnvironment(
  'ZYPTOS_API_BASE_URL',
  defaultValue: 'https://zyptos.com',
);

const _notificationKeys = [
  'notify_assignment_enabled',
  'notify_mention_enabled',
  'notify_sound_enabled',
  'notify_billing_enabled',
  'notify_waba_enabled',
  'notify_automation_enabled',
  'notify_leads_enabled',
  'notify_templates_enabled',
  'notify_email_enabled',
  'notify_in_app_enabled',
];

const _notificationLabels = {
  'notify_assignment_enabled': 'Conversation assignments',
  'notify_mention_enabled': 'Mentions',
  'notify_sound_enabled': 'In-app sound',
  'notify_billing_enabled': 'Billing and payments',
  'notify_waba_enabled': 'WhatsApp/WABA health',
  'notify_automation_enabled': 'Automation failures',
  'notify_leads_enabled': 'New leads',
  'notify_templates_enabled': 'Template status',
  'notify_email_enabled': 'Email notifications',
  'notify_in_app_enabled': 'In-app notifications',
  'quiet_hours_enabled': 'Quiet hours',
};
