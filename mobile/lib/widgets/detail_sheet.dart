part of '../main.dart';

class DetailSheet extends StatelessWidget {
  const DetailSheet({
    super.key,
    required this.title,
    required this.rows,
    this.actions = const [],
  });

  final String title;
  final Map<String, String> rows;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final visibleRows = rows.entries
        .where((e) => e.value.trim().isNotEmpty)
        .toList();
    return SafeArea(
      child: ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
        children: [
          SectionTitle(title: title),
          if (actions.isNotEmpty) ...[
            Wrap(spacing: 8, runSpacing: 8, children: actions),
            const SizedBox(height: 16),
          ],
          if (visibleRows.isEmpty)
            const EmptyState(message: 'No details available.'),
          ...visibleRows.map(
            (entry) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    entry.key.toUpperCase(),
                    style: GoogleFonts.inter(
                      color: AppColors.muted,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    entry.value,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      color: AppColors.text,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Divider(height: 1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
