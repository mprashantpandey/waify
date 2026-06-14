part of '../../../main.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key, required this.api});
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () => api.getJson('/api/mobile/notifications'),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          children: [
            SectionTitle(
              title: 'Alerts',
              trailing: TextButton.icon(
                onPressed: () async {
                  await api.postJson('/api/mobile/notifications/read-all');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('All alerts marked read')),
                    );
                  }
                },
                icon: const Icon(Icons.done_all_rounded, size: 16),
                label: const Text('Read all'),
              ),
            ),
            if (items.isEmpty)
              const EmptyState(
                message: 'No alerts right now.',
                icon: Icons.notifications_outlined,
              ),
            ...items.map(
              (item) => AlertTile(
                icon: severityIcon(item['severity']?.toString()),
                severity: item['severity']?.toString(),
                title: item['title']?.toString() ?? 'Notification',
                message: item['body']?.toString() ?? '',
                actionUrl: item['action_url']?.toString(),
                read: item['read_at'] != null,
                onMarkRead: item['read_at'] == null
                    ? () => api.postJson(
                        '/api/mobile/notifications/${item['id']}/read',
                      )
                    : null,
              ),
            ),
          ],
        );
      },
    );
  }
}

class AlertTile extends StatelessWidget {
  const AlertTile({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.severity,
    this.actionUrl,
    required this.read,
    this.onMarkRead,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? severity;
  final String? actionUrl;
  final bool read;
  final Future<void> Function()? onMarkRead;

  Color _iconColor() => switch (severity) {
    'critical' || 'error' => AppColors.errorText,
    'warning' => AppColors.warningText,
    'success' => AppColors.greenDark,
    _ => AppColors.infoText,
  };

  Color _bgColor() => switch (severity) {
    'critical' || 'error' => AppColors.errorSurface,
    'warning' => AppColors.warningSurface,
    'success' => AppColors.greenSoft,
    _ => AppColors.infoSurface,
  };

  @override
  Widget build(BuildContext context) {
    final iconColor = _iconColor();
    final bgColor = _bgColor();
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: read ? AppColors.surface : bgColor.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: read ? AppColors.border : iconColor.withValues(alpha: 0.25),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(icon, color: iconColor, size: 18),
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
                      fontWeight: FontWeight.w600,
                      color: AppColors.text,
                    ),
                  ),
                  if (message.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      message,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.muted,
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              children: [
                if (actionUrl != null && actionUrl!.isNotEmpty)
                  IconButton(
                    tooltip: 'Open',
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.all(4),
                    icon: const Icon(
                      Icons.open_in_new_rounded,
                      size: 18,
                      color: AppColors.muted,
                    ),
                    onPressed: () =>
                        openExternalUri(context, Uri.parse(actionUrl!)),
                  ),
                if (!read)
                  IconButton(
                    tooltip: 'Mark read',
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.all(4),
                    icon: const Icon(
                      Icons.done_rounded,
                      size: 18,
                      color: AppColors.greenDark,
                    ),
                    onPressed: () async {
                      await onMarkRead?.call();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Marked read')),
                        );
                      }
                    },
                  )
                else
                  const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.check_circle_rounded,
                      size: 18,
                      color: AppColors.muted,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
