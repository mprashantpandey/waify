part of '../../../main.dart';

class WorkspaceShell extends StatefulWidget {
  const WorkspaceShell({
    super.key,
    required this.session,
    required this.onSessionChanged,
    required this.onSignedOut,
  });

  final MobileSession session;
  final ValueChanged<MobileSession> onSessionChanged;
  final VoidCallback onSignedOut;

  @override
  State<WorkspaceShell> createState() => _WorkspaceShellState();
}

class _WorkspaceShellState extends State<WorkspaceShell> {
  late ApiClient _api;
  late MobileSession _session;
  int _index = 0;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _session = widget.session;
    _api = ApiClient(
      baseUrl: apiBaseUrl,
      token: _session.token,
      accountId: _accountId(_session.currentAccount),
    );
  }

  int? _accountId(Map<String, dynamic>? account) {
    final id = account?['id'];
    return id is int ? id : int.tryParse(id?.toString() ?? '');
  }

  void _switchAccount(Map<String, dynamic> account) {
    final next = _session.copyWith(currentAccount: account);
    setState(() {
      _session = next;
      _api = _api.copyWith(accountId: _accountId(account));
      _index = 0;
    });
    widget.onSessionChanged(next);
  }

  void _showWorkspaceSwitcher() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              child: Text(
                'Switch workspace',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text,
                ),
              ),
            ),
            ..._session.accounts.map((account) {
              final selected =
                  _accountId(account) == _accountId(_session.currentAccount);
              final name = account['name']?.toString() ?? 'Workspace';
              final initial = name.isNotEmpty ? name[0].toUpperCase() : 'W';
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: selected
                        ? const LinearGradient(
                            colors: [AppColors.greenDark, AppColors.greenDarker],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : null,
                    color: selected ? null : AppColors.bg,
                    borderRadius: BorderRadius.circular(12),
                    border: selected
                        ? null
                        : Border.all(color: AppColors.border),
                  ),
                  child: Center(
                    child: Text(
                      initial,
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: selected ? Colors.white : AppColors.muted,
                      ),
                    ),
                  ),
                ),
                title: Text(
                  name,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.text,
                  ),
                ),
                subtitle: Text(
                  account['role']?.toString() ?? 'member',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.muted),
                ),
                trailing: selected
                    ? Container(
                        width: 22,
                        height: 22,
                        decoration: const BoxDecoration(
                          color: AppColors.greenDark,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
                      )
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  _switchAccount(account);
                },
              );
            }),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Future<void> _logout() async {
    try {
      await _api.postJson('/api/mobile/auth/logout');
    } catch (_) {}
    widget.onSignedOut();
  }

  @override
  Widget build(BuildContext context) {
    final accountName = _session.currentAccount?['name']?.toString() ?? 'Zyptos';
    final initial = accountName.isNotEmpty ? accountName[0].toUpperCase() : 'Z';

    final pages = [
      InboxScreen(
        api: _api,
        onUnreadCount: (count) {
          if (count != _unreadCount) setState(() => _unreadCount = count);
        },
      ),
      CallsScreen(api: _api),
      ContactsScreen(api: _api),
      ToolsScreen(
        api: _api,
        session: _session,
        onSessionChanged: (next) {
          setState(() => _session = next);
          widget.onSessionChanged(next);
        },
        onSignedOut: _logout,
      ),
      AccountScreen(
        api: _api,
        session: _session,
        onSessionChanged: (next) {
          setState(() => _session = next);
          widget.onSessionChanged(next);
        },
        onSignedOut: _logout,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            GestureDetector(
              onTap: _showWorkspaceSwitcher,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.greenDark, AppColors.greenDarker],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Flexible(
              child: GestureDetector(
                onTap: _showWorkspaceSwitcher,
                child: Text(
                  accountName,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 4),
            GestureDetector(
              onTap: _showWorkspaceSwitcher,
              child: const Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 18,
                color: AppColors.muted,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Search',
            onPressed: () => showSearch(
              context: context,
              delegate: MobileSearchDelegate(api: _api),
            ),
            icon: const Icon(Icons.search_rounded),
          ),
          IconButton(
            tooltip: 'Alerts',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: const Text('Alerts')),
                  body: NotificationsScreen(api: _api),
                ),
              ),
            ),
            icon: const Icon(Icons.notifications_none_rounded),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: pages[_index],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border, width: 0.5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (value) => setState(() => _index = value),
          destinations: [
            NavigationDestination(
              icon: Badge(
                isLabelVisible: _unreadCount > 0,
                label: Text(_unreadCount > 99 ? '99+' : '$_unreadCount'),
                child: const Icon(Icons.chat_bubble_outline_rounded),
              ),
              selectedIcon: Badge(
                isLabelVisible: _unreadCount > 0,
                label: Text(_unreadCount > 99 ? '99+' : '$_unreadCount'),
                child: const Icon(Icons.chat_bubble_rounded),
              ),
              label: 'Inbox',
            ),
            const NavigationDestination(
              icon: Icon(Icons.call_outlined),
              selectedIcon: Icon(Icons.call_rounded),
              label: 'Calls',
            ),
            const NavigationDestination(
              icon: Icon(Icons.people_outline_rounded),
              selectedIcon: Icon(Icons.people_rounded),
              label: 'Contacts',
            ),
            const NavigationDestination(
              icon: Icon(Icons.apps_outlined),
              selectedIcon: Icon(Icons.apps_rounded),
              label: 'Tools',
            ),
            const NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Me',
            ),
          ],
        ),
      ),
    );
  }
}
