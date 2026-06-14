part of '../../../main.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({
    super.key,
    required this.api,
    required this.session,
    required this.onSessionChanged,
    required this.onSignedOut,
  });

  final ApiClient api;
  final MobileSession session;
  final ValueChanged<MobileSession> onSessionChanged;
  final VoidCallback onSignedOut;

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  void _open(String title, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: screen,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.session.user;
    final account = widget.session.currentAccount;
    final name = user['name']?.toString() ?? 'Zyptos user';
    final email = user['email']?.toString() ?? '';
    final initial = name.trim().isEmpty
        ? 'Z'
        : name.characters.first.toUpperCase();

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        // ── Profile hero ─────────────────────────────────────────────
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.greenDarker, AppColors.greenDark],
            ),
          ),
          padding: const EdgeInsets.fromLTRB(20, 36, 20, 28),
          child: Row(
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 2),
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 28,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        fontSize: 19,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      email,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: Text(
                        account?['name']?.toString() ?? 'Workspace',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
        SectionTitle(title: 'Account'),
        _MenuTile(
          icon: Icons.person_rounded,
          title: 'Profile management',
          subtitle: 'Name, email, phone, role and timezone',
          onTap: () => _open(
            'Profile',
            ProfileManagementPanel(
              api: widget.api,
              session: widget.session,
              onSessionChanged: widget.onSessionChanged,
            ),
          ),
        ),
        _MenuTile(
          icon: Icons.business_rounded,
          title: 'Workspace management',
          subtitle: 'Workspace profile and billing address',
          onTap: () => _open(
            'Workspace',
            WorkspaceManagementPanel(
              api: widget.api,
              session: widget.session,
              onSessionChanged: widget.onSessionChanged,
            ),
          ),
        ),
        _MenuTile(
          icon: Icons.workspace_premium_rounded,
          title: 'Plan and billing',
          subtitle: 'Current plan, usage, wallet and invoices',
          onTap: () => _open('Plan', BillingManagementPanel(api: widget.api)),
        ),
        const SizedBox(height: 14),
        SectionTitle(title: 'Preferences'),
        _MenuTile(
          icon: Icons.notifications_active_rounded,
          title: 'Notification preferences',
          subtitle: 'Email, in-app, sound and quiet hours',
          onTap: () => _open(
            'Notification preferences',
            NotificationPreferencesPanel(api: widget.api),
          ),
        ),
        _MenuTile(
          icon: Icons.security_rounded,
          title: 'Security',
          subtitle: 'Password, 2FA status and mobile sessions',
          onTap: () => _open(
            'Security',
            SecurityManagementPanel(
              api: widget.api,
              session: widget.session,
              onSignedOut: widget.onSignedOut,
            ),
          ),
        ),
        const SizedBox(height: 14),
        SectionTitle(title: 'App'),
        _MenuTile(
          icon: Icons.cloud_done_rounded,
          title: 'Connected API',
          subtitle: apiBaseUrl,
        ),
        _MenuTile(
          icon: Icons.logout_rounded,
          title: 'Sign out',
          subtitle: 'Remove this mobile session from the device',
          danger: true,
          onTap: widget.onSignedOut,
        ),
            ],
          ),
        ),
        const SizedBox(height: 28),
      ],
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.danger = false,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.errorText : AppColors.greenDark;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(14, 6, 14, 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                color.withValues(alpha: 0.15),
                color.withValues(alpha: 0.07),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: danger ? AppColors.errorText : AppColors.text,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.muted, height: 1.4),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: onTap == null
            ? null
            : Icon(
                Icons.chevron_right_rounded,
                color: AppColors.mutedLight,
                size: 20,
              ),
        onTap: onTap,
      ),
    );
  }
}

// ── Shared helpers ──────────────────────────────────────────────────────────

Widget _fieldLabel(String text) => Padding(
  padding: const EdgeInsets.only(bottom: 6),
  child: Text(
    text,
    style: GoogleFonts.inter(
      fontSize: 13,
      fontWeight: FontWeight.w500,
      color: AppColors.text,
    ),
  ),
);

Widget _saveButton({
  required bool saving,
  required VoidCallback? onSave,
  String label = 'Save changes',
}) {
  return FilledButton.icon(
    onPressed: saving ? null : onSave,
    icon: saving
        ? const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: Colors.white,
            ),
          )
        : const Icon(Icons.save_rounded, size: 18),
    label: Text(label),
  );
}

// ── Profile panel ────────────────────────────────────────────────────────────

class ProfileManagementPanel extends StatefulWidget {
  const ProfileManagementPanel({
    super.key,
    required this.api,
    required this.session,
    required this.onSessionChanged,
  });
  final ApiClient api;
  final MobileSession session;
  final ValueChanged<MobileSession> onSessionChanged;

  @override
  State<ProfileManagementPanel> createState() => _ProfileManagementPanelState();
}

class _ProfileManagementPanelState extends State<ProfileManagementPanel> {
  late Future<Map<String, dynamic>> _future;
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _countryCode = TextEditingController();
  final _phone = TextEditingController();
  final _jobTitle = TextEditingController();
  final _timezone = TextEditingController();
  bool _saving = false;
  bool _seeded = false;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getJson('/api/mobile/profile');
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _countryCode.dispose();
    _phone.dispose();
    _jobTitle.dispose();
    _timezone.dispose();
    super.dispose();
  }

  void _seed(Map<String, dynamic> user) {
    if (_seeded) {
      return;
    }
    _name.text = user['name']?.toString() ?? '';
    _email.text = user['email']?.toString() ?? '';
    _countryCode.text = user['country_code']?.toString() ?? '';
    _phone.text = user['phone']?.toString() ?? '';
    _jobTitle.text = user['job_title']?.toString() ?? '';
    _timezone.text = user['timezone']?.toString() ?? '';
    _seeded = true;
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final payload = await widget.api.patchJson(
        '/api/mobile/profile',
        body: {
          'name': _name.text.trim(),
          'email': _email.text.trim(),
          'country_code': _countryCode.text.trim(),
          'phone': _phone.text.trim(),
          'job_title': _jobTitle.text.trim(),
          'timezone': _timezone.text.trim().isEmpty
              ? null
              : _timezone.text.trim(),
        },
      );
      final user = Map<String, dynamic>.from(payload['user'] as Map);
      widget.onSessionChanged(widget.session.copyWith(user: user));
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Profile updated')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.greenDark),
          );
        }
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: ErrorBanner(message: snapshot.error.toString()),
          );
        }
        final user = Map<String, dynamic>.from(
          snapshot.data?['user'] as Map? ?? {},
        );
        _seed(user);

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            // User avatar header
            Center(
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      color: AppColors.greenDark,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        (_name.text.isNotEmpty ? _name.text : 'U')
                            .characters
                            .first
                            .toUpperCase(),
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 30,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _name.text,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                  Text(
                    _email.text,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.muted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            SectionTitle(title: 'Personal info'),
            _fieldLabel('Full name'),
            TextField(
              controller: _name,
              decoration: const InputDecoration(hintText: 'Your name'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Email address'),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(hintText: 'you@example.com'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Phone'),
            Row(
              children: [
                SizedBox(
                  width: 88,
                  child: TextField(
                    controller: _countryCode,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(hintText: '+91'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _phone,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      hintText: 'Mobile number',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _fieldLabel('Job title'),
            TextField(
              controller: _jobTitle,
              decoration: const InputDecoration(hintText: 'e.g. Sales Manager'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Timezone'),
            TextField(
              controller: _timezone,
              decoration: const InputDecoration(hintText: 'Asia/Kolkata'),
            ),
            const SizedBox(height: 24),
            _saveButton(saving: _saving, onSave: _save, label: 'Save profile'),
          ],
        );
      },
    );
  }
}

// ── Workspace panel ──────────────────────────────────────────────────────────

class WorkspaceManagementPanel extends StatefulWidget {
  const WorkspaceManagementPanel({
    super.key,
    required this.api,
    required this.session,
    required this.onSessionChanged,
  });
  final ApiClient api;
  final MobileSession session;
  final ValueChanged<MobileSession> onSessionChanged;

  @override
  State<WorkspaceManagementPanel> createState() =>
      _WorkspaceManagementPanelState();
}

class _WorkspaceManagementPanelState extends State<WorkspaceManagementPanel> {
  late Future<Map<String, dynamic>> _future;
  final _name = TextEditingController();
  final _industry = TextEditingController();
  final _timezone = TextEditingController();
  final _billingName = TextEditingController();
  final _billingEmail = TextEditingController();
  final _billingGstin = TextEditingController();
  final _billingCity = TextEditingController();
  final _billingState = TextEditingController();
  final _billingCountry = TextEditingController();
  String _workspaceType = 'business';
  bool _seeded = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final workspace = await widget.api.getJson('/api/mobile/workspace');
    final workspaces = await widget.api.getJson('/api/mobile/workspaces');
    return {'workspace': workspace, 'workspaces': workspaces};
  }

  @override
  void dispose() {
    _name.dispose();
    _industry.dispose();
    _timezone.dispose();
    _billingName.dispose();
    _billingEmail.dispose();
    _billingGstin.dispose();
    _billingCity.dispose();
    _billingState.dispose();
    _billingCountry.dispose();
    super.dispose();
  }

  void _seed(Map<String, dynamic> ws) {
    if (_seeded) {
      return;
    }
    _name.text = ws['name']?.toString() ?? '';
    _industry.text = ws['industry']?.toString() ?? '';
    _timezone.text = ws['timezone']?.toString() ?? '';
    _billingName.text = ws['billing_name']?.toString() ?? '';
    _billingEmail.text = ws['billing_email']?.toString() ?? '';
    _billingGstin.text = ws['billing_gstin']?.toString() ?? '';
    _billingCity.text = ws['billing_city']?.toString() ?? '';
    _billingState.text = ws['billing_state']?.toString() ?? '';
    _billingCountry.text = ws['billing_country']?.toString() ?? 'IN';
    _workspaceType = ws['workspace_type']?.toString() ?? 'business';
    _seeded = true;
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final payload = await widget.api.patchJson(
        '/api/mobile/workspace',
        body: {
          'name': _name.text.trim(),
          'workspace_type': _workspaceType,
          'industry': _industry.text.trim(),
          'timezone': _timezone.text.trim(),
          'billing_name': _billingName.text.trim(),
          'billing_email': _billingEmail.text.trim(),
          'billing_gstin': _billingGstin.text.trim(),
          'billing_city': _billingCity.text.trim(),
          'billing_state': _billingState.text.trim(),
          'billing_country': _billingCountry.text.trim().isEmpty
              ? 'IN'
              : _billingCountry.text.trim(),
        },
      );
      final ws = Map<String, dynamic>.from(payload['workspace'] as Map);
      final accounts = widget.session.accounts
          .map((a) => a['id'] == ws['id'] ? {...a, ...ws} : a)
          .toList();
      widget.onSessionChanged(
        widget.session.copyWith(accounts: accounts, currentAccount: ws),
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Workspace updated')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.greenDark),
          );
        }
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: ErrorBanner(message: snapshot.error.toString()),
          );
        }
        final wsPayload = Map<String, dynamic>.from(
          snapshot.data?['workspace'] as Map? ?? {},
        );
        final ws = Map<String, dynamic>.from(
          wsPayload['workspace'] as Map? ?? {},
        );
        final types = Map<String, dynamic>.from(
          wsPayload['workspace_types'] as Map? ?? {},
        );
        final canUpdate = wsPayload['can_update'] == true;
        final wsList = Map<String, dynamic>.from(
          snapshot.data?['workspaces'] as Map? ?? {},
        );
        final items = List<Map<String, dynamic>>.from(
          (wsList['items'] as List? ?? []).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        _seed(ws);

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            SectionTitle(title: 'Your workspaces (${items.length})'),
            ...items.map((item) {
              final isCurrent = item['is_current'] == true;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                decoration: BoxDecoration(
                  color: isCurrent
                      ? AppColors.greenSoft.withValues(alpha: 0.5)
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCurrent
                        ? AppColors.greenDark.withValues(alpha: 0.4)
                        : AppColors.border,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: isCurrent ? AppColors.greenDark : AppColors.bg,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Icon(
                        Icons.business_rounded,
                        size: 18,
                        color: isCurrent ? Colors.white : AppColors.muted,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['name']?.toString() ?? 'Workspace',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.text,
                            ),
                          ),
                          Text(
                            [
                                  item['role']?.toString(),
                                  item['status']?.toString(),
                                ]
                                .where((v) => v != null && v.isNotEmpty)
                                .join(' · '),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.greenDark,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Current',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 24),
            SectionTitle(title: 'Workspace settings'),
            _fieldLabel('Name'),
            TextField(
              controller: _name,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: 'Workspace name'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Type'),
            DropdownButtonFormField<String>(
              initialValue: _workspaceType,
              decoration: const InputDecoration(),
              items: types.entries
                  .map(
                    (e) => DropdownMenuItem(
                      value: e.key,
                      child: Text(e.value.toString()),
                    ),
                  )
                  .toList(),
              onChanged: canUpdate
                  ? (v) => setState(() => _workspaceType = v ?? 'business')
                  : null,
            ),
            const SizedBox(height: 14),
            _fieldLabel('Industry'),
            TextField(
              controller: _industry,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: 'e.g. E-commerce'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Timezone'),
            TextField(
              controller: _timezone,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: 'Asia/Kolkata'),
            ),
            const SizedBox(height: 24),
            SectionTitle(title: 'Billing info'),
            _fieldLabel('Billing name'),
            TextField(
              controller: _billingName,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: 'Legal name'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Billing email'),
            TextField(
              controller: _billingEmail,
              enabled: canUpdate,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                hintText: 'billing@example.com',
              ),
            ),
            const SizedBox(height: 14),
            _fieldLabel('GSTIN'),
            TextField(
              controller: _billingGstin,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: '22AAAAA0000A1Z5'),
            ),
            const SizedBox(height: 14),
            _fieldLabel('City & State'),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _billingCity,
                    enabled: canUpdate,
                    decoration: const InputDecoration(hintText: 'City'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _billingState,
                    enabled: canUpdate,
                    decoration: const InputDecoration(hintText: 'State'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _fieldLabel('Country'),
            TextField(
              controller: _billingCountry,
              enabled: canUpdate,
              decoration: const InputDecoration(hintText: 'IN'),
            ),
            const SizedBox(height: 24),
            _saveButton(
              saving: _saving,
              onSave: !canUpdate ? null : _save,
              label: 'Save workspace',
            ),
          ],
        );
      },
    );
  }
}

// ── Billing panel ────────────────────────────────────────────────────────────

class BillingManagementPanel extends StatelessWidget {
  const BillingManagementPanel({super.key, required this.api});
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: api.accountId,
      loader: () => api.getJson('/api/mobile/billing'),
      builder: (data) {
        final plan = Map<String, dynamic>.from(
          data['current_plan'] as Map? ?? {},
        );
        final subscription = Map<String, dynamic>.from(
          data['subscription'] as Map? ?? {},
        );
        final wallet = Map<String, dynamic>.from(data['wallet'] as Map? ?? {});
        final usage = Map<String, dynamic>.from(data['usage'] as Map? ?? {});
        final limits = Map<String, dynamic>.from(data['limits'] as Map? ?? {});
        final plans = List<Map<String, dynamic>>.from(
          (data['plans'] as List? ?? []).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        final orders = List<Map<String, dynamic>>.from(
          (data['recent_orders'] as List? ?? []).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            InfoCard(
              title: plan['name']?.toString() ?? 'No active plan',
              icon: Icons.layers_rounded,
              accent: AppColors.greenDark,
              body: [
                subscription['status']?.toString(),
                money(
                  plan['price_monthly'],
                  plan['currency']?.toString() ?? 'INR',
                ),
                subscription['current_period_end'] == null
                    ? null
                    : 'Renews ${subscription['current_period_end']}',
              ].where((v) => v != null && v.isNotEmpty).join(' · '),
            ),
            const SizedBox(height: 10),
            InfoCard(
              title: 'Wallet credits',
              icon: Icons.account_balance_wallet_rounded,
              accent: AppColors.infoText,
              body:
                  '${money(wallet['balance_minor'], wallet['currency']?.toString() ?? 'INR')} available',
            ),
            const SizedBox(height: 24),
            SectionTitle(title: 'Usage this month'),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  UsageRow(
                    label: 'Messages',
                    used: usage['messages_sent'],
                    limit: limits['messages_monthly'],
                  ),
                  const Divider(height: 1),
                  UsageRow(
                    label: 'Templates',
                    used: usage['template_sends'],
                    limit: limits['template_sends_monthly'],
                  ),
                  const Divider(height: 1),
                  UsageRow(
                    label: 'AI credits',
                    used: usage['ai_credits_used'],
                    limit: limits['ai_credits_monthly'],
                  ),
                  const Divider(height: 1),
                  UsageRow(
                    label: 'AI requests',
                    used: usage['ai_requests'],
                    limit: null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SectionTitle(title: 'Available plans'),
            ...plans.map((item) {
              final isCurrent = item['is_current'] == true;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                decoration: BoxDecoration(
                  color: isCurrent
                      ? AppColors.greenSoft.withValues(alpha: 0.5)
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCurrent
                        ? AppColors.greenDark.withValues(alpha: 0.4)
                        : AppColors.border,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: isCurrent ? AppColors.greenDark : AppColors.bg,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Icon(
                        Icons.layers_rounded,
                        size: 18,
                        color: isCurrent ? Colors.white : AppColors.muted,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['name']?.toString() ?? 'Plan',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.text,
                            ),
                          ),
                          Text(
                            money(
                              item['price_monthly'],
                              item['currency']?.toString() ?? 'INR',
                            ),
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: AppColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.greenDark,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Current',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 24),
            SectionTitle(title: 'Recent invoices'),
            if (orders.isEmpty)
              const EmptyState(
                message: 'No invoices yet.',
                icon: Icons.receipt_long_outlined,
              ),
            ...orders.map(
              (order) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: AppColors.bg,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: const Icon(
                        Icons.receipt_long_rounded,
                        size: 18,
                        color: AppColors.muted,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            order['invoice_number']?.toString() ??
                                'Order #${order['id']}',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.text,
                            ),
                          ),
                          Text(
                            [
                                  order['status']?.toString(),
                                  money(
                                    order['amount'],
                                    order['currency']?.toString() ?? 'INR',
                                  ),
                                  order['created_at']?.toString(),
                                ]
                                .where((v) => v != null && v.isNotEmpty)
                                .join(' · '),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ── Notifications panel ──────────────────────────────────────────────────────

class NotificationPreferencesPanel extends StatefulWidget {
  const NotificationPreferencesPanel({super.key, required this.api});
  final ApiClient api;

  @override
  State<NotificationPreferencesPanel> createState() =>
      _NotificationPreferencesPanelState();
}

class _NotificationPreferencesPanelState
    extends State<NotificationPreferencesPanel> {
  late Future<Map<String, dynamic>> _future;
  Map<String, bool> _prefs = {};
  bool _seeded = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getJson('/api/mobile/profile');
  }

  void _seed(Map<String, dynamic> prefs) {
    if (_seeded) {
      return;
    }
    _prefs = {
      for (final key in _notificationKeys) key: prefs[key] != false,
      'quiet_hours_enabled': prefs['quiet_hours_enabled'] == true,
    };
    _seeded = true;
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.api.patchJson(
        '/api/mobile/profile/notifications',
        body: {..._prefs, 'quiet_hours_start': null, 'quiet_hours_end': null},
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Preferences saved')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.greenDark),
          );
        }
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: ErrorBanner(message: snapshot.error.toString()),
          );
        }
        final prefs = Map<String, dynamic>.from(
          snapshot.data?['notifications'] as Map? ?? {},
        );
        _seed(prefs);

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            SectionTitle(title: 'Notification channels'),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: _notificationLabels.entries
                    .toList()
                    .asMap()
                    .entries
                    .map((mapEntry) {
                      final i = mapEntry.key;
                      final entry = mapEntry.value;
                      return Column(
                        children: [
                          if (i > 0) const Divider(height: 1),
                          SwitchListTile(
                            value: _prefs[entry.key] ?? true,
                            title: Text(
                              entry.value,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.text,
                              ),
                            ),
                            activeThumbColor: AppColors.greenDark,
                            onChanged: (v) =>
                                setState(() => _prefs[entry.key] = v),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 2,
                            ),
                          ),
                        ],
                      );
                    })
                    .toList(),
              ),
            ),
            const SizedBox(height: 24),
            _saveButton(
              saving: _saving,
              onSave: _save,
              label: 'Save preferences',
            ),
          ],
        );
      },
    );
  }
}

// ── Security panel ───────────────────────────────────────────────────────────

class SecurityManagementPanel extends StatefulWidget {
  const SecurityManagementPanel({
    super.key,
    required this.api,
    required this.session,
    required this.onSignedOut,
  });
  final ApiClient api;
  final MobileSession session;
  final VoidCallback onSignedOut;

  @override
  State<SecurityManagementPanel> createState() =>
      _SecurityManagementPanelState();
}

class _SecurityManagementPanelState extends State<SecurityManagementPanel> {
  late Future<Map<String, dynamic>> _future;
  final _currentPassword = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getJson('/api/mobile/profile');
  }

  @override
  void dispose() {
    _currentPassword.dispose();
    _password.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  Future<void> _updatePassword() async {
    setState(() => _saving = true);
    try {
      await widget.api.patchJson(
        '/api/mobile/profile/password',
        body: {
          'current_password': _currentPassword.text,
          'password': _password.text,
          'password_confirmation': _confirmation.text,
        },
      );
      _currentPassword.clear();
      _password.clear();
      _confirmation.clear();
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Password updated')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.greenDark),
          );
        }
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: ErrorBanner(message: snapshot.error.toString()),
          );
        }
        final security = Map<String, dynamic>.from(
          snapshot.data?['security'] as Map? ?? {},
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            InfoCard(
              title: 'Security status',
              icon: security['two_factor_enabled'] == true
                  ? Icons.verified_user_rounded
                  : Icons.shield_outlined,
              accent: security['two_factor_enabled'] == true
                  ? AppColors.greenDark
                  : AppColors.warningText,
              body: [
                security['two_factor_enabled'] == true
                    ? '2FA enabled'
                    : '2FA disabled',
                '${security['active_mobile_sessions'] ?? 1} active sessions',
              ].join(' · '),
            ),
            const SizedBox(height: 24),
            SectionTitle(title: 'Change password'),
            _fieldLabel('Current password'),
            TextField(
              controller: _currentPassword,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Your current password',
              ),
            ),
            const SizedBox(height: 14),
            _fieldLabel('New password'),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'At least 8 characters',
              ),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Confirm new password'),
            TextField(
              controller: _confirmation,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Repeat new password',
              ),
            ),
            const SizedBox(height: 24),
            _saveButton(
              saving: _saving,
              onSave: _updatePassword,
              label: 'Update password',
            ),
            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: widget.onSignedOut,
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.errorBorder),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.logout_rounded,
                      color: AppColors.errorText,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Sign out',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.errorText,
                      ),
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.errorText,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
