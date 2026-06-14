part of '../main.dart';

String relativeTime(String? value) {
  if (value == null || value.isEmpty) return '';
  final date = DateTime.tryParse(value);
  if (date == null) return '';
  final diff = DateTime.now().difference(date.toLocal());
  if (diff.inMinutes < 1) return 'now';
  if (diff.inHours < 1) return '${diff.inMinutes}m';
  if (diff.inDays < 1) return '${diff.inHours}h';
  return '${diff.inDays}d';
}

String? formatDuration(dynamic seconds) {
  final value = seconds is int
      ? seconds
      : int.tryParse(seconds?.toString() ?? '');
  if (value == null || value <= 0) return null;
  final minutes = value ~/ 60;
  final remaining = value % 60;
  if (minutes <= 0) return '${remaining}s';
  return '${minutes}m ${remaining}s';
}

String money(dynamic minor, String currency) {
  final value = minor is int
      ? minor
      : int.tryParse(minor?.toString() ?? '') ?? 0;
  final amount = value / 100;
  final symbol = currency == 'INR' ? '₹' : currency;
  return '$symbol ${amount.toStringAsFixed(amount.truncateToDouble() == amount ? 0 : 2)}';
}

IconData severityIcon(String? severity) => switch (severity) {
  'critical' || 'error' => Icons.error_rounded,
  'warning' => Icons.warning_amber_rounded,
  'success' => Icons.check_circle_rounded,
  _ => Icons.notifications_rounded,
};
