part of '../main.dart';

class InfoCard extends StatelessWidget {
  const InfoCard({
    super.key,
    required this.title,
    required this.body,
    this.accent,
    this.icon,
    this.trailing,
  });

  final String title;
  final String body;
  final Color? accent;
  final IconData? icon;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final accentColor = accent ?? AppColors.greenDark;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Accent strip
            Container(
              height: 3,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [accentColor, accentColor.withValues(alpha: 0.6)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (icon != null) ...[
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            accentColor.withValues(alpha: 0.15),
                            accentColor.withValues(alpha: 0.07),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon, color: accentColor, size: 18),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.text,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          body,
                          style: GoogleFonts.inter(
                            color: AppColors.muted,
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (trailing != null) ...[const SizedBox(width: 8), trailing!],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class UsageRow extends StatelessWidget {
  const UsageRow({
    super.key,
    required this.label,
    required this.used,
    required this.limit,
  });

  final String label;
  final dynamic used;
  final dynamic limit;

  @override
  Widget build(BuildContext context) {
    final usedValue =
        used is int ? used : int.tryParse(used?.toString() ?? '') ?? 0;
    final limitValue =
        limit is int ? limit : int.tryParse(limit?.toString() ?? '');
    final hasLimit = limitValue != null && limitValue > 0;
    final ratio =
        hasLimit ? (usedValue / limitValue!).clamp(0.0, 1.0) : 0.0;
    final isHigh = ratio >= 0.85;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.text,
                ),
              ),
              Text(
                hasLimit ? '$usedValue / $limitValue' : '$usedValue used',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isHigh ? AppColors.warningText : AppColors.muted,
                ),
              ),
            ],
          ),
          if (hasLimit) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: ratio,
                minHeight: 5,
                backgroundColor: AppColors.bg,
                valueColor: AlwaysStoppedAnimation(
                  isHigh ? AppColors.warningText : AppColors.greenDark,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
