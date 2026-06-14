part of '../../../main.dart';

class IntegrationsScreen extends StatelessWidget {
  const IntegrationsScreen({super.key, required this.api});

  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () async {
        final leads = await api.getJson('/api/mobile/leads');
        return {'leads': leads['items'] ?? []};
      },
      builder: (data) {
        final leads = List<Map<String, dynamic>>.from(
          (data['leads'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
          children: [
            SectionTitle(title: 'Integrations'),
            _IntegrationStatusCard(
              icon: Icons.facebook_rounded,
              title: 'Meta Lead Forms',
              subtitle: '${leads.length} synced leads',
              status: leads.isEmpty ? 'Ready' : 'Active',
              color: AppColors.infoText,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => Scaffold(
                    appBar: AppBar(title: const Text('Meta leads')),
                    body: LeadsScreen(api: api),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            const _IntegrationStatusCard(
              icon: Icons.chat_bubble_rounded,
              title: 'WhatsApp Business',
              subtitle: 'Inbox, templates, campaigns, automations',
              status: 'Connected',
              color: AppColors.greenDark,
            ),
            const SizedBox(height: 10),
            const _IntegrationStatusCard(
              icon: Icons.smart_toy_rounded,
              title: 'AI agents',
              subtitle: 'Assistant replies and automation handoff',
              status: 'Configured',
              color: AppColors.warningText,
            ),
            const SizedBox(height: 10),
            const _IntegrationStatusCard(
              icon: Icons.payments_rounded,
              title: 'Payments',
              subtitle: 'Payment links, invoices, proofs',
              status: 'Available',
              color: AppColors.greenDarker,
            ),
            const SizedBox(height: 24),
            SectionTitle(title: 'Latest leads'),
            if (leads.isEmpty)
              const EmptyState(
                message: 'No leads yet.',
                icon: Icons.track_changes_outlined,
              ),
            ...leads
                .take(8)
                .map(
                  (item) => LeadTile(
                    item: item,
                    title: item['name']?.toString() ?? 'Meta lead',
                    subtitle:
                        item['form_name']?.toString() ??
                        item['platform']?.toString() ??
                        'Lead',
                    stage: item['stage']?.toString() ?? 'new',
                  ),
                ),
          ],
        );
      },
    );
  }
}

class _IntegrationStatusCard extends StatelessWidget {
  const _IntegrationStatusCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.status,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String status;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.muted,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
