part of '../main.dart';

abstract final class AppColors {
  // Primary brand — WhatsApp palette
  static const green = Color(0xFF25D366);        // bright WhatsApp green (badges)
  static const greenDark = Color(0xFF128C7E);    // header teal
  static const greenDarker = Color(0xFF075E54);  // dark teal
  static const greenSoft = Color(0xFFDCF8EC);    // soft green bg
  static const greenSofter = Color(0xFFF0FBF7);  // very soft for hover states

  // Page / structural
  static const bg = Color(0xFFF0F2F5);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSubtle = Color(0xFFF9FAFB); // inputs, slight off-white
  static const sidebar = Color(0xFF1A1A2E);

  // Typography
  static const text = Color(0xFF111827);
  static const textSecondary = Color(0xFF374151);
  static const muted = Color(0xFF6B7280);
  static const mutedLight = Color(0xFF9CA3AF);

  // Borders
  static const border = Color(0xFFE5E7EB);
  static const borderDark = Color(0xFFD1D5DB);

  // Semantic surfaces
  static const successSurface = Color(0xFFDCF8C6);
  static const errorSurface = Color(0xFFFEF2F2);
  static const errorBorder = Color(0xFFFECACA);
  static const errorText = Color(0xFFDC2626);
  static const warningSurface = Color(0xFFFFFBEB);
  static const warningText = Color(0xFFD97706);
  static const infoSurface = Color(0xFFEFF6FF);
  static const infoText = Color(0xFF2563EB);

  // Chat specific
  static const chatBg = Color(0xFFECE5DD);
  static const bubbleSent = Color(0xFFDCF8C6);
  static const bubbleRecv = Color(0xFFFFFFFF);
  static const chatMuted = Color(0xFF667781);

  // Avatar palette (deterministic color per contact)
  static const List<Color> avatarPalette = [
    Color(0xFF128C7E), // teal
    Color(0xFF2563EB), // blue
    Color(0xFF7C3AED), // purple
    Color(0xFFDB2777), // pink
    Color(0xFFD97706), // amber
    Color(0xFF059669), // emerald
    Color(0xFFDC2626), // red
    Color(0xFF0891B2), // cyan
  ];
}
