part of '../main.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(compact ? 9 : 11),
            color: AppColors.greenDark,
          ),
          clipBehavior: Clip.antiAlias,
          child: Image.asset(
            'assets/branding/zyptos_launcher.png',
            fit: BoxFit.cover,
          ),
        ),
        SizedBox(width: compact ? 10 : 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              AppStrings.appName,
              style: GoogleFonts.inter(
                fontSize: compact ? 18 : 22,
                fontWeight: FontWeight.w800,
                color: AppColors.text,
                letterSpacing: -0.3,
              ),
            ),
            if (!compact)
              Text(
                'WhatsApp CRM mobile',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.muted),
              ),
          ],
        ),
      ],
    );
  }
}
