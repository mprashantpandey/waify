part of '../../../main.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key, required this.api, this.onUnreadCount});

  final ApiClient api;
  final ValueChanged<int>? onUnreadCount;

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  String _filter = 'all';
  String _query = '';

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: widget.api.accountId,
      loader: () async {
        final dashboard = await widget.api.getJson('/api/mobile/dashboard');
        final inbox = await widget.api.getJson('/api/mobile/inbox');
        return {'summary': dashboard['summary'], 'items': inbox['items']};
      },
      builder: (data) {
        final summary = Map<String, dynamic>.from(data['summary'] as Map);
        final unread = summary['unread'] as int? ?? 0;
        WidgetsBinding.instance.addPostFrameCallback(
          (_) => widget.onUnreadCount?.call(unread),
        );

        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );

        final filtered = items.where((item) {
          final unreadCount = item['unread_count'] as int? ?? 0;
          final botPaused = item['bot_paused'] == true;
          final itemStatus = item['status']?.toString() ?? 'open';
          final priority = item['priority']?.toString() ?? 'normal';
          final text = [
            item['contact_name'],
            item['contact_phone'],
            item['last_message_preview'],
          ].whereType<Object>().join(' ').toLowerCase();
          final matchesQuery =
              _query.trim().isEmpty ||
              text.contains(_query.trim().toLowerCase());
          final matchesFilter = switch (_filter) {
            'unread' => unreadCount > 0,
            'paused' => botPaused,
            'urgent' => priority == 'urgent' || priority == 'high',
            'closed' => itemStatus == 'closed',
            _ => itemStatus != 'closed',
          };
          return matchesQuery && matchesFilter;
        }).toList();

        return CustomScrollView(
          slivers: [
            // ── Metrics + search pinned header ──────────────────────
            SliverToBoxAdapter(
              child: Column(
                children: [
                  Container(
                    color: AppColors.surface,
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                    child: Column(
                      children: [
                        MetricRow(summary: summary),
                        const SizedBox(height: 14),
                        SearchBox(
                          label: 'Search conversations…',
                          onChanged: (v) => setState(() => _query = v),
                          onSubmitted: (v) => setState(() => _query = v),
                        ),
                        const SizedBox(height: 12),
                        FilterChips(
                          value: _filter,
                          options: const {
                            'all': 'Open',
                            'unread': 'Unread',
                            'urgent': 'Priority',
                            'paused': 'Bot paused',
                            'closed': 'Closed',
                          },
                          onChanged: (v) => setState(() => _filter = v),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    color: AppColors.surface,
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
                    child: Row(
                      children: [
                        Text(
                          'Conversations',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.muted,
                            letterSpacing: 0.2,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.bg,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${filtered.length}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.muted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                ],
              ),
            ),

            // ── Conversation list ───────────────────────────────────
            if (filtered.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: EmptyState(
                    message: 'No conversations match your filter.',
                    icon: Icons.chat_bubble_outline_rounded,
                  ),
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) => ConversationTile(
                    api: widget.api,
                    id: filtered[i]['id'] as int,
                    name: filtered[i]['contact_name']?.toString() ?? 'WhatsApp contact',
                    message: filtered[i]['last_message_preview']?.toString() ?? '',
                    time: relativeTime(filtered[i]['last_message_at']?.toString()),
                    unread: filtered[i]['unread_count'] as int? ?? 0,
                    status: filtered[i]['status']?.toString() ?? 'open',
                    priority: filtered[i]['priority']?.toString() ?? 'normal',
                    botPaused: filtered[i]['bot_paused'] == true,
                    connection: filtered[i]['connection_name']?.toString(),
                    onChanged: () => setState(() {}),
                  ),
                  childCount: filtered.length,
                ),
              ),
          ],
        );
      },
    );
  }
}
