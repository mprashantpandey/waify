part of '../../../main.dart';

class QuickReplySheet extends StatelessWidget {
  const QuickReplySheet({
    super.key,
    required this.replies,
    required this.onSelected,
  });

  final List<Map<String, dynamic>> replies;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.5,
      minChildSize: 0.3,
      maxChildSize: 0.85,
      expand: false,
      builder: (context, scrollController) => Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
            child: SectionTitle(title: 'Quick replies'),
          ),
          const Divider(height: 1),
          Expanded(
            child: replies.isEmpty
                ? const EmptyState(
                    message: 'No quick replies configured.',
                    icon: Icons.bolt_outlined,
                  )
                : ListView.separated(
                    controller: scrollController,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: replies.length,
                    separatorBuilder: (context, index) =>
                        const Divider(height: 1, indent: 72),
                    itemBuilder: (context, i) {
                      final reply = replies[i];
                      final text = reply['text']?.toString() ?? '';
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 4,
                        ),
                        leading: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.greenSoft,
                            borderRadius: BorderRadius.circular(9),
                          ),
                          child: const Icon(
                            Icons.bolt_rounded,
                            size: 18,
                            color: AppColors.greenDark,
                          ),
                        ),
                        title: Text(
                          reply['label']?.toString() ?? 'Reply',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.text,
                          ),
                        ),
                        subtitle: Text(
                          text,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.muted,
                          ),
                        ),
                        onTap: () {
                          Navigator.pop(context);
                          onSelected(text);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
