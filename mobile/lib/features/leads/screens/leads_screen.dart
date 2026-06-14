part of '../../../main.dart';

class LeadsScreen extends StatelessWidget {
  const LeadsScreen({super.key, required this.api});
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () => api.getJson('/api/mobile/leads'),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          children: [
            SectionTitle(title: 'Meta leads (${items.length})'),
            if (items.isEmpty)
              const EmptyState(
                message: 'No leads yet.',
                icon: Icons.track_changes_outlined,
              ),
            ...items.map(
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

class LeadTile extends StatelessWidget {
  const LeadTile({
    super.key,
    required this.item,
    required this.title,
    required this.subtitle,
    required this.stage,
  });
  final Map<String, dynamic> item;
  final String title;
  final String subtitle;
  final String stage;

  Color _stageColor() => switch (stage.toLowerCase()) {
    'converted' || 'won' => AppColors.greenDark,
    'qualified' => AppColors.infoText,
    'lost' || 'rejected' => AppColors.errorText,
    _ => AppColors.warningText,
  };

  @override
  Widget build(BuildContext context) {
    final stageColor = _stageColor();
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.bg,
            borderRadius: BorderRadius.circular(11),
            border: Border.all(color: AppColors.border),
          ),
          child: const Icon(
            Icons.track_changes_rounded,
            color: AppColors.muted,
            size: 22,
          ),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: GoogleFonts.inter(fontSize: 13, color: AppColors.muted),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: stageColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: stageColor.withValues(alpha: 0.3)),
          ),
          child: Text(
            stage,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: stageColor,
            ),
          ),
        ),
        onTap: () => showModalBottomSheet<void>(
          context: context,
          showDragHandle: true,
          builder: (_) => DetailSheet(
            title: title,
            rows: {
              'Phone': item['phone']?.toString() ?? '',
              'Email': item['email']?.toString() ?? '',
              'City': item['city']?.toString() ?? '',
              'Stage': stage,
              'Form': item['form_name']?.toString() ?? '',
              'Ad': item['ad_name']?.toString() ?? '',
              'Campaign': item['campaign_name']?.toString() ?? '',
              'Captured': item['captured_at']?.toString() ?? '',
            },
          ),
        ),
      ),
    );
  }
}
