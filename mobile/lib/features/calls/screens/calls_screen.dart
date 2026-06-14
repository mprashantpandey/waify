part of '../../../main.dart';

class CallsScreen extends StatelessWidget {
  const CallsScreen({super.key, required this.api});
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () => api.getJson('/api/mobile/calls'),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        final active = items.where((item) {
          final status = item['status']?.toString().toLowerCase() ?? '';
          return [
            'ringing',
            'answered',
            'in_progress',
            'queued',
          ].contains(status);
        }).toList();
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          children: [
            if (active.isNotEmpty) ...[
              SectionTitle(title: 'Active (${active.length})'),
              ...active.map((item) => CallTile(item: item, highlighted: true)),
              const SizedBox(height: 20),
            ],
            SectionTitle(title: 'All calls'),
            if (items.isEmpty)
              const EmptyState(
                message: 'No calls yet.',
                icon: Icons.call_outlined,
              ),
            ...items.map((item) => CallTile(item: item)),
          ],
        );
      },
    );
  }
}

class CallTile extends StatelessWidget {
  const CallTile({super.key, required this.item, this.highlighted = false});
  final Map<String, dynamic> item;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final title = item['contact_name']?.toString().isNotEmpty == true
        ? item['contact_name'].toString()
        : item['phone_number']?.toString() ?? 'WhatsApp call';
    final status = item['status']?.toString() ?? 'unknown';
    final outbound = item['direction'] == 'outbound';
    final duration = formatDuration(item['duration_seconds']);
    final statusColor = switch (status.toLowerCase()) {
      'answered' || 'in_progress' => AppColors.greenDark,
      'ringing' => AppColors.infoText,
      'missed' || 'rejected' => AppColors.errorText,
      _ => AppColors.muted,
    };
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: highlighted
            ? AppColors.greenSoft.withValues(alpha: 0.5)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: highlighted
              ? AppColors.greenDark.withValues(alpha: 0.3)
              : AppColors.border,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: highlighted ? AppColors.greenSoft : AppColors.bg,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.border),
          ),
          child: Icon(
            outbound ? Icons.call_made_rounded : Icons.call_received_rounded,
            color: outbound ? AppColors.greenDark : AppColors.infoText,
            size: 20,
          ),
        ),
        title: Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
        ),
        subtitle: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: statusColor,
                ),
              ),
            ),
            if (duration != null) ...[
              const SizedBox(width: 6),
              Text(
                duration,
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.muted),
              ),
            ],
          ],
        ),
        trailing: Text(
          relativeTime(item['created_at']?.toString()),
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.muted),
        ),
        onTap: () => showModalBottomSheet<void>(
          context: context,
          showDragHandle: true,
          builder: (_) => DetailSheet(
            title: title,
            actions: [
              if ((item['phone']?.toString() ?? '').isNotEmpty)
                OutlinedButton.icon(
                  onPressed: () => openExternalUri(
                    context,
                    Uri(scheme: 'tel', path: item['phone'].toString()),
                  ),
                  icon: const Icon(Icons.call_rounded, size: 16),
                  label: const Text('Call'),
                ),
              if ((item['email']?.toString() ?? '').isNotEmpty)
                OutlinedButton.icon(
                  onPressed: () => openExternalUri(
                    context,
                    Uri(scheme: 'mailto', path: item['email'].toString()),
                  ),
                  icon: const Icon(Icons.mail_outline_rounded, size: 16),
                  label: const Text('Email'),
                ),
            ],
            rows: {
              'Direction': item['direction']?.toString() ?? '',
              'Status': status,
              'Phone': item['phone_number']?.toString() ?? '',
              'Duration': formatDuration(item['duration_seconds']) ?? '',
              'Summary': item['summary']?.toString() ?? '',
              'Created': item['created_at']?.toString() ?? '',
            },
          ),
        ),
      ),
    );
  }
}
