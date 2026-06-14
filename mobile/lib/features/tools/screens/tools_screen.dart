part of '../../../main.dart';

class ToolsScreen extends StatelessWidget {
  const ToolsScreen({
    super.key,
    required this.api,
    required this.session,
    required this.onSessionChanged,
    required this.onSignedOut,
  });

  final ApiClient api;
  final MobileSession session;
  final ValueChanged<MobileSession> onSessionChanged;
  final VoidCallback onSignedOut;

  void _open(BuildContext context, String title, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: screen,
        ),
      ),
    );
  }

  void _openWeb(BuildContext context, String path) {
    openExternalUri(context, Uri.parse('$apiBaseUrl$path'));
  }

  int _int(dynamic value) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () => api.getJson('/api/mobile/tools'),
      builder: (data) {
        final summary = Map<String, dynamic>.from(
          data['summary'] as Map? ?? {},
        );
        final modules = Map<String, dynamic>.from(
          data['modules'] as Map? ?? {},
        );
        final campaigns = Map<String, dynamic>.from(
          modules['campaigns'] as Map? ?? {},
        );
        final templates = Map<String, dynamic>.from(
          modules['templates'] as Map? ?? {},
        );
        final automations = Map<String, dynamic>.from(
          modules['automations'] as Map? ?? {},
        );
        final integrations = Map<String, dynamic>.from(
          modules['integrations'] as Map? ?? {},
        );
        final billing = Map<String, dynamic>.from(
          modules['billing'] as Map? ?? {},
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
          children: [
            SectionTitle(title: 'Command center'),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.55,
              children: [
                MetricCard(
                  label: 'Unread',
                  value: _int(summary['unread']).toString(),
                  icon: Icons.mark_chat_unread_rounded,
                  accent: AppColors.infoText,
                  accentSurface: AppColors.infoSurface,
                ),
                MetricCard(
                  label: 'Open chats',
                  value: _int(summary['open_conversations']).toString(),
                  icon: Icons.forum_rounded,
                  accent: AppColors.greenDark,
                  accentSurface: AppColors.greenSoft,
                ),
                MetricCard(
                  label: 'Contacts',
                  value: _int(summary['contacts']).toString(),
                  icon: Icons.people_rounded,
                  accent: AppColors.warningText,
                  accentSurface: AppColors.warningSurface,
                ),
                MetricCard(
                  label: 'Alerts',
                  value: _int(summary['alerts']).toString(),
                  icon: Icons.notifications_active_rounded,
                  accent: AppColors.errorText,
                  accentSurface: AppColors.errorSurface,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SectionTitle(title: 'Workspace tools'),
            _ToolCard(
              icon: Icons.campaign_rounded,
              iconColor: const Color(0xFF7C3AED),
              title: 'Campaigns',
              subtitle: '${_int(campaigns['count'])} campaigns · ${_int(campaigns['active'])} active',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Campaigns',
                ModuleListScreen(
                  api: api,
                  title: 'Campaigns',
                  endpoint: '/api/mobile/campaigns',
                  icon: Icons.campaign_rounded,
                  webPath: '/app/campaigns',
                  itemBuilder: ModuleListItem.campaign,
                ),
              ),
            ),
            _ToolCard(
              icon: Icons.description_rounded,
              iconColor: const Color(0xFF2563EB),
              title: 'Templates',
              subtitle: '${_int(templates['approved'])} approved · ${_int(templates['rejected'])} rejected',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Templates',
                ModuleListScreen(
                  api: api,
                  title: 'Templates',
                  endpoint: '/api/mobile/templates',
                  icon: Icons.description_rounded,
                  webPath: '/app/templates',
                  itemBuilder: ModuleListItem.template,
                ),
              ),
            ),
            _ToolCard(
              icon: Icons.account_tree_rounded,
              iconColor: const Color(0xFF059669),
              title: 'Automations',
              subtitle: '${_int(automations['active'])} active · ${_int(automations['paused'])} paused',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Automations',
                ModuleListScreen(
                  api: api,
                  title: 'Automations',
                  endpoint: '/api/mobile/automations',
                  icon: Icons.account_tree_rounded,
                  webPath: '/app/chatbots',
                  itemBuilder: ModuleListItem.automation,
                ),
              ),
            ),
            _ToolCard(
              icon: Icons.flash_on_rounded,
              iconColor: const Color(0xFFD97706),
              title: 'Quick replies',
              subtitle: '${_int(summary['quick_replies'])} saved replies',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Quick replies',
                ModuleListScreen(
                  api: api,
                  title: 'Quick replies',
                  endpoint: '/api/mobile/quick-replies',
                  icon: Icons.flash_on_rounded,
                  webPath: '/app/quick-replies',
                  itemBuilder: ModuleListItem.quickReply,
                ),
              ),
            ),
            _ToolCard(
              icon: Icons.track_changes_rounded,
              iconColor: const Color(0xFFDB2777),
              title: 'Meta leads',
              subtitle: '${_int(summary['leads'])} synced leads',
              status: 'Mobile',
              onTap: () => _open(context, 'Meta leads', LeadsScreen(api: api)),
            ),
            _ToolCard(
              icon: Icons.hub_rounded,
              iconColor: const Color(0xFF0891B2),
              title: 'Integrations',
              subtitle: '${_int(integrations['connected'])} connected · ${_int(integrations['needs_attention'])} need attention',
              status: 'Mobile',
              onTap: () => _open(context, 'Integrations', IntegrationsScreen(api: api)),
            ),
            _ToolCard(
              icon: Icons.call_rounded,
              iconColor: AppColors.greenDark,
              title: 'WhatsApp calls',
              subtitle: '${_int(summary['calls'])} call records',
              status: 'Mobile',
              onTap: () => _open(context, 'Calls', CallsScreen(api: api)),
            ),
            _ToolCard(
              icon: Icons.payments_rounded,
              iconColor: const Color(0xFF059669),
              title: 'Billing and invoices',
              subtitle: '${_int(billing['unpaid_orders'])} unpaid or pending invoices',
              status: 'Mobile',
              onTap: () => _open(context, 'Billing', BillingManagementPanel(api: api)),
            ),
            _ToolCard(
              icon: Icons.business_rounded,
              iconColor: const Color(0xFF4B5563),
              title: 'Workspace settings',
              subtitle: 'Profile, billing address, workspace type',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Workspace',
                WorkspaceManagementPanel(
                  api: api,
                  session: session,
                  onSessionChanged: onSessionChanged,
                ),
              ),
            ),
            _ToolCard(
              icon: Icons.notifications_active_rounded,
              iconColor: const Color(0xFFD97706),
              title: 'Notification preferences',
              subtitle: 'Email, in-app, sound, quiet hours',
              status: 'Mobile',
              onTap: () => _open(context, 'Notifications', NotificationPreferencesPanel(api: api)),
            ),
            _ToolCard(
              icon: Icons.security_rounded,
              iconColor: const Color(0xFFDC2626),
              title: 'Security',
              subtitle: 'Password and mobile sessions',
              status: 'Mobile',
              onTap: () => _open(
                context,
                'Security',
                SecurityManagementPanel(api: api, session: session, onSignedOut: onSignedOut),
              ),
            ),
            _ToolCard(
              icon: Icons.code_rounded,
              iconColor: const Color(0xFF1D4ED8),
              title: 'Developer API',
              subtitle: 'API keys, webhooks, event logs',
              status: 'Web',
              onTap: () => _openWeb(context, '/app/developer'),
            ),
          ],
        );
      },
    );
  }
}

class _ToolCard extends StatelessWidget {
  const _ToolCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.status,
    required this.onTap,
    this.iconColor,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String status;
  final VoidCallback onTap;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final color = iconColor ?? AppColors.greenDark;
    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color, color.withValues(alpha: 0.7)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(13),
          ),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.text),
        ),
        subtitle: Text(
          subtitle,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.muted, height: 1.4),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (status != 'Mobile')
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.infoSurface,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.infoText),
                ),
              ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded, color: AppColors.mutedLight, size: 20),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}

class ModuleListScreen extends StatelessWidget {
  const ModuleListScreen({
    super.key,
    required this.api,
    required this.title,
    required this.endpoint,
    required this.icon,
    required this.webPath,
    required this.itemBuilder,
  });

  final ApiClient api;
  final String title;
  final String endpoint;
  final IconData icon;
  final String webPath;
  final ModuleListItem Function(Map<String, dynamic> item) itemBuilder;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: '${api.accountId}:$endpoint',
      loader: () => api.getJson(endpoint),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List? ?? []).map(
            (item) => Map<String, dynamic>.from(item as Map),
          ),
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
          children: [
            Row(
              children: [
                Expanded(
                  child: SectionTitle(title: '$title (${items.length})'),
                ),
                TextButton.icon(
                  onPressed: () => openExternalUri(
                    context,
                    Uri.parse('$apiBaseUrl$webPath'),
                  ),
                  icon: const Icon(Icons.open_in_new_rounded, size: 16),
                  label: const Text('Open web'),
                ),
              ],
            ),
            if (items.isEmpty)
              EmptyState(message: 'No ${title.toLowerCase()} yet.', icon: icon),
            ...items.map((item) => _ModuleListTile(item: itemBuilder(item))),
          ],
        );
      },
    );
  }
}

class ModuleListItem {
  const ModuleListItem({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.rows,
    this.danger = false,
  });

  final String title;
  final String subtitle;
  final String status;
  final Map<String, String> rows;
  final bool danger;

  static ModuleListItem campaign(Map<String, dynamic> item) {
    return ModuleListItem(
      title: item['name']?.toString() ?? 'Campaign',
      subtitle:
          '${item['sent_count'] ?? 0}/${item['total_recipients'] ?? 0} sent · ${item['failed_count'] ?? 0} failed',
      status: item['status']?.toString() ?? 'draft',
      danger: (item['failed_count'] ?? 0).toString() != '0',
      rows: {
        'Type': item['type']?.toString() ?? '',
        'Recipients': item['total_recipients']?.toString() ?? '0',
        'Sent': item['sent_count']?.toString() ?? '0',
        'Delivered': item['delivered_count']?.toString() ?? '0',
        'Read': item['read_count']?.toString() ?? '0',
        'Failed': item['failed_count']?.toString() ?? '0',
        'Scheduled': item['scheduled_at']?.toString() ?? '',
        'Updated': item['updated_at']?.toString() ?? '',
      },
    );
  }

  static ModuleListItem template(Map<String, dynamic> item) {
    final status = item['status']?.toString() ?? 'unknown';
    return ModuleListItem(
      title: item['name']?.toString() ?? 'Template',
      subtitle:
          '${item['category'] ?? 'template'} · ${item['language'] ?? '-'}',
      status: status,
      danger: status.toLowerCase() == 'rejected',
      rows: {
        'Category': item['category']?.toString() ?? '',
        'Language': item['language']?.toString() ?? '',
        'Quality': item['quality_score']?.toString() ?? '',
        'Body': item['body_text']?.toString() ?? '',
        'Meta error': item['last_meta_error']?.toString() ?? '',
        'Last synced': item['last_synced_at']?.toString() ?? '',
      },
    );
  }

  static ModuleListItem automation(Map<String, dynamic> item) {
    return ModuleListItem(
      title: item['name']?.toString() ?? 'Automation',
      subtitle:
          '${item['flows_count'] ?? 0} flows · ${item['executions_count'] ?? 0} runs',
      status: item['status']?.toString() ?? 'draft',
      rows: {
        'Description': item['description']?.toString() ?? '',
        'Flows': item['flows_count']?.toString() ?? '0',
        'Runs': item['executions_count']?.toString() ?? '0',
        'Default': item['is_default'] == true ? 'Yes' : 'No',
        'Session timeout': '${item['session_timeout_minutes'] ?? '-'} minutes',
        'Updated': item['updated_at']?.toString() ?? '',
      },
    );
  }

  static ModuleListItem quickReply(Map<String, dynamic> item) {
    return ModuleListItem(
      title: item['title']?.toString() ?? item['name']?.toString() ?? 'Reply',
      subtitle: item['message']?.toString() ?? item['body']?.toString() ?? '',
      status: item['category']?.toString() ?? 'reply',
      rows: {
        'Message':
            item['message']?.toString() ?? item['body']?.toString() ?? '',
        'Shortcut': item['shortcut']?.toString() ?? '',
        'Category': item['category']?.toString() ?? '',
      },
    );
  }
}

class _ModuleListTile extends StatelessWidget {
  const _ModuleListTile({required this.item});

  final ModuleListItem item;

  @override
  Widget build(BuildContext context) {
    final statusColor = item.danger ? AppColors.errorText : AppColors.greenDark;
    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        title: Text(
          item.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
        ),
        subtitle: Text(
          item.subtitle,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.muted),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            item.status,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: statusColor,
            ),
          ),
        ),
        onTap: () => showModalBottomSheet<void>(
          context: context,
          showDragHandle: true,
          builder: (_) => DetailSheet(title: item.title, rows: item.rows),
        ),
      ),
    );
  }
}
