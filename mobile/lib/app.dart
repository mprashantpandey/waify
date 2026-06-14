part of 'main.dart';

class ZyptosMobileApp extends StatefulWidget {
  const ZyptosMobileApp({super.key});

  @override
  State<ZyptosMobileApp> createState() => _ZyptosMobileAppState();
}

class _ZyptosMobileAppState extends State<ZyptosMobileApp> {
  MobileSession? _session;
  bool _loaded = false;
  final GlobalKey<ScaffoldMessengerState> _messengerKey =
      GlobalKey<ScaffoldMessengerState>();

  @override
  void initState() {
    super.initState();
    _listenForPushMessages();
    _restoreSession();
  }

  void _listenForPushMessages() {
    try {
      FirebaseMessaging.onMessage.listen((message) {
        final notification = message.notification;
        final title =
            notification?.title ??
            message.data['title']?.toString() ??
            'Zyptos';
        final body =
            notification?.body ??
            message.data['body']?.toString() ??
            'New notification';
        _messengerKey.currentState?.showSnackBar(
          SnackBar(
            content: Text(
              '$title: $body',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            action: SnackBarAction(label: 'Open', onPressed: () {}),
          ),
        );
      });
    } catch (_) {}
  }

  Future<void> _restoreSession() async {
    final session = await SessionStore.load();
    if (!mounted) return;
    setState(() {
      _session = session;
      _loaded = true;
    });
  }

  void _setSession(MobileSession session) {
    setState(() => _session = session);
    SessionStore.save(session);
    _registerDevice(session);
  }

  void _updateSession(MobileSession session) {
    setState(() => _session = session);
    SessionStore.save(session);
  }

  Future<void> _registerDevice(MobileSession session) async {
    final api = ApiClient(
      baseUrl: apiBaseUrl,
      token: session.token,
      accountId: _accountId(session.currentAccount),
    );
    String? pushToken;
    String? pushProvider;
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      pushToken = await messaging.getToken();
      pushProvider = pushToken == null ? null : 'fcm';
    } catch (_) {}

    try {
      await api.postJson(
        '/api/mobile/auth/device',
        body: {
          'device_platform': defaultTargetPlatform.name,
          'device_id':
              'flutter-${session.user['id'] ?? 'user'}-${DateTime.now().timeZoneName}',
          'push_provider': pushProvider,
          'push_token': pushToken,
        },
      );
    } catch (_) {}
  }

  int? _accountId(Map<String, dynamic>? account) {
    final id = account?['id'];
    return id is int ? id : int.tryParse(id?.toString() ?? '');
  }

  void _clearSession() {
    setState(() => _session = null);
    SessionStore.clear();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName,
      scaffoldMessengerKey: _messengerKey,
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: !_loaded
          ? const _SplashScreen()
          : _session == null
          ? LoginScreen(onSignedIn: _setSession)
          : WorkspaceShell(
              session: _session!,
              onSessionChanged: _updateSession,
              onSignedOut: _clearSession,
            ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.greenDark,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.asset(
                    'assets/branding/zyptos_launcher.png',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                AppStrings.appName,
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'WhatsApp CRM',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: Colors.white.withValues(alpha: 0.7),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
