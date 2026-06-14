part of '../../../main.dart';

class ConversationTile extends StatelessWidget {
  const ConversationTile({
    super.key,
    required this.api,
    required this.id,
    required this.name,
    required this.message,
    required this.time,
    required this.unread,
    required this.status,
    required this.priority,
    required this.botPaused,
    this.connection,
    this.onChanged,
  });

  final ApiClient api;
  final int id;
  final String name;
  final String message;
  final String time;
  final int unread;
  final String status;
  final String priority;
  final bool botPaused;
  final String? connection;
  final VoidCallback? onChanged;

  Color _avatarColor() {
    final palette = AppColors.avatarPalette;
    return name.isEmpty
        ? palette[0]
        : palette[name.codeUnitAt(0) % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    final isUrgent = priority == 'urgent' || priority == 'high';
    final hasUnread = unread > 0;
    final isClosed = status == 'closed';
    final avatarColor = _avatarColor();
    final initial = name.trim().isEmpty ? '?' : name.characters.first.toUpperCase();

    return Material(
      color: AppColors.surface,
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ConversationDetailScreen(
              api: api,
              conversationId: id,
              title: name,
            ),
          ),
        ),
        onLongPress: () => _showQuickActions(context),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppColors.border, width: 0.5)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Avatar ───────────────────────────────────────────
              Stack(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          avatarColor,
                          avatarColor.withValues(alpha: 0.7),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        initial,
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 20,
                        ),
                      ),
                    ),
                  ),
                  if (botPaused)
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: AppColors.warningText,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.surface, width: 2),
                        ),
                        child: const Icon(Icons.pause, size: 10, color: Colors.white),
                      ),
                    ),
                  if (isClosed && !botPaused)
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: AppColors.mutedLight,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.surface, width: 2),
                        ),
                        child: const Icon(Icons.lock, size: 10, color: Colors.white),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 13),

              // ── Content ──────────────────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w600,
                              color: hasUnread ? AppColors.text : AppColors.textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          time,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: hasUnread ? AppColors.greenDark : AppColors.mutedLight,
                            fontWeight: hasUnread ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Text(
                            message,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: hasUnread ? AppColors.text : AppColors.muted,
                              fontWeight: hasUnread ? FontWeight.w500 : FontWeight.w400,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Badge or priority tag
                        if (hasUnread)
                          Container(
                            constraints: const BoxConstraints(minWidth: 22),
                            height: 22,
                            padding: const EdgeInsets.symmetric(horizontal: 7),
                            decoration: BoxDecoration(
                              color: AppColors.green,
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child: Center(
                              child: Text(
                                '$unread',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          )
                        else if (isUrgent)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.warningSurface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.warningText.withValues(alpha: 0.35),
                              ),
                            ),
                            child: Text(
                              priority == 'urgent' ? '🔥 urgent' : '↑ high',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.warningText,
                              ),
                            ),
                          ),
                      ],
                    ),
                    if (connection != null && connection!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.hub_outlined, size: 11, color: AppColors.mutedLight),
                          const SizedBox(width: 3),
                          Flexible(
                            child: Text(
                              connection!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: AppColors.mutedLight,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showQuickActions(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Text(
                name,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text,
                ),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.infoSurface,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.done_all_rounded, color: AppColors.infoText, size: 20),
              ),
              title: const Text('Mark as read'),
              onTap: () => _runAction(
                context,
                () => api.postJson('/api/mobile/inbox/$id/read'),
              ),
            ),
            ListTile(
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.warningSurface,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  botPaused ? Icons.smart_toy_rounded : Icons.pause_circle_outline_rounded,
                  color: AppColors.warningText,
                  size: 20,
                ),
              ),
              title: Text(botPaused ? 'Resume bot' : 'Pause bot'),
              onTap: () => _runAction(
                context,
                () => api.postJson(
                  '/api/mobile/inbox/$id/bot',
                  body: {
                    'paused': !botPaused,
                    'reason': !botPaused ? 'Paused by mobile agent' : null,
                    'assign_to_me': !botPaused,
                  },
                ),
              ),
            ),
            ListTile(
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: status == 'closed' ? AppColors.greenSofter : AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  status == 'closed' ? Icons.lock_open_rounded : Icons.lock_outline_rounded,
                  color: status == 'closed' ? AppColors.greenDark : AppColors.errorText,
                  size: 20,
                ),
              ),
              title: Text(status == 'closed' ? 'Reopen conversation' : 'Close conversation'),
              onTap: () => _runAction(
                context,
                () => api.patchJson(
                  '/api/mobile/inbox/$id',
                  body: {'status': status == 'closed' ? 'open' : 'closed'},
                ),
              ),
            ),
            ListTile(
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.priority_high_rounded, color: AppColors.errorText, size: 20),
              ),
              title: const Text('Set urgent priority'),
              onTap: () => _runAction(
                context,
                () => api.patchJson('/api/mobile/inbox/$id', body: {'priority': 'urgent'}),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _runAction(
    BuildContext context,
    Future<Map<String, dynamic>> Function() action,
  ) async {
    Navigator.pop(context);
    try {
      await action();
      onChanged?.call();
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Conversation updated')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    }
  }
}
