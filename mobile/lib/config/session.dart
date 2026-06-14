part of '../main.dart';

class MobileSession {
  const MobileSession({
    required this.token,
    required this.user,
    required this.accounts,
    required this.currentAccount,
  });

  final String token;
  final Map<String, dynamic> user;
  final List<Map<String, dynamic>> accounts;
  final Map<String, dynamic>? currentAccount;

  MobileSession copyWith({
    Map<String, dynamic>? user,
    List<Map<String, dynamic>>? accounts,
    Map<String, dynamic>? currentAccount,
  }) {
    return MobileSession(
      token: token,
      user: user ?? this.user,
      accounts: accounts ?? this.accounts,
      currentAccount: currentAccount ?? this.currentAccount,
    );
  }

  Map<String, dynamic> toJson() => {
    'token': token,
    'user': user,
    'accounts': accounts,
    'current_account': currentAccount,
  };

  static MobileSession? fromJson(Map<String, dynamic> json) {
    final token = json['token'];
    final user = json['user'];
    final accounts = json['accounts'];
    if (token is! String || user is! Map || accounts is! List) {
      return null;
    }

    return MobileSession(
      token: token,
      user: Map<String, dynamic>.from(user),
      accounts: accounts
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(),
      currentAccount: json['current_account'] is Map
          ? Map<String, dynamic>.from(json['current_account'] as Map)
          : null,
    );
  }
}

class SessionStore {
  static const _key = 'zyptos_mobile_session';

  static Future<MobileSession?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null || raw.isEmpty) return null;

    try {
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic>
          ? MobileSession.fromJson(decoded)
          : null;
    } catch (_) {
      await prefs.remove(_key);
      return null;
    }
  }

  static Future<void> save(MobileSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(session.toJson()));
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}

class DraftStore {
  static String _key(int conversationId) => 'zyptos_draft_$conversationId';

  static Future<String> load(int conversationId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key(conversationId)) ?? '';
  }

  static Future<void> save(int conversationId, String value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value.trim().isEmpty) {
      await prefs.remove(_key(conversationId));
      return;
    }
    await prefs.setString(_key(conversationId), value);
  }

  static Future<void> clear(int conversationId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key(conversationId));
  }
}
