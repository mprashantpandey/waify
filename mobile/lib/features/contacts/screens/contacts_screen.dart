part of '../../../main.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key, required this.api});
  final ApiClient api;

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  String _search = '';
  String _status = 'all';

  @override
  Widget build(BuildContext context) {
    return ApiListView(
      reloadKey: '${widget.api.accountId}:${_search.trim()}',
      loader: () => widget.api.getJson(
        '/api/mobile/contacts${_search.trim().isEmpty ? '' : '?search=${Uri.encodeQueryComponent(_search.trim())}'}',
      ),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        final filtered = items.where((item) {
          if (_status == 'all') {
            return true;
          }
          return (item['status']?.toString() ?? 'active') == _status;
        }).toList();

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          children: [
            SearchBox(
              label: 'Search contacts…',
              onChanged: (v) => setState(() => _search = v),
              onSubmitted: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            FilterChips(
              value: _status,
              options: const {
                'all': 'All',
                'active': 'Active',
                'lead': 'Lead',
                'customer': 'Customer',
                'blocked': 'Blocked',
              },
              onChanged: (v) => setState(() => _status = v),
            ),
            const SizedBox(height: 20),
            SectionTitle(title: 'Contacts (${filtered.length})'),
            if (filtered.isEmpty)
              const EmptyState(
                message: 'No contacts found.',
                icon: Icons.people_outline_rounded,
              ),
            ...filtered.map(
              (item) => ContactTile(
                api: widget.api,
                item: item,
                name: item['name']?.toString() ?? 'Contact',
                phone: item['phone']?.toString() ?? '',
                tag:
                    item['source']?.toString() ??
                    item['status']?.toString() ??
                    'contact',
              ),
            ),
          ],
        );
      },
    );
  }
}

class ContactTile extends StatelessWidget {
  const ContactTile({
    super.key,
    required this.api,
    required this.item,
    required this.name,
    required this.phone,
    required this.tag,
  });
  final ApiClient api;
  final Map<String, dynamic> item;
  final String name;
  final String phone;
  final String tag;

  Color _avatarColor() {
    final palette = AppColors.avatarPalette;
    return name.isEmpty ? palette[0] : palette[name.codeUnitAt(0) % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    final avatarColor = _avatarColor();
    final initial = name.trim().isEmpty ? '?' : name.characters.first.toUpperCase();

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
        contentPadding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [avatarColor, avatarColor.withValues(alpha: 0.7)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              initial,
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 19,
              ),
            ),
          ),
        ),
        title: Text(
          name,
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.text),
        ),
        subtitle: Text(
          [phone, item['email']?.toString(), item['company']?.toString()]
              .where((v) => v != null && v.isNotEmpty)
              .join(' · '),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(fontSize: 13, color: AppColors.muted),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.bg,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            tag,
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.muted),
          ),
        ),
        onTap: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          showDragHandle: true,
          builder: (_) => ContactEditSheet(api: api, item: item),
        ),
      ),
    );
  }
}

class ContactEditSheet extends StatefulWidget {
  const ContactEditSheet({super.key, required this.api, required this.item});
  final ApiClient api;
  final Map<String, dynamic> item;

  @override
  State<ContactEditSheet> createState() => _ContactEditSheetState();
}

class _ContactEditSheetState extends State<ContactEditSheet> {
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late final TextEditingController _company;
  late final TextEditingController _notes;
  String _status = 'active';
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.item['name']?.toString() ?? '');
    _phone = TextEditingController(
      text: widget.item['phone']?.toString() ?? '',
    );
    _email = TextEditingController(
      text: widget.item['email']?.toString() ?? '',
    );
    _company = TextEditingController(
      text: widget.item['company']?.toString() ?? '',
    );
    _notes = TextEditingController(
      text: widget.item['notes']?.toString() ?? '',
    );
    _status = widget.item['status']?.toString() ?? 'active';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _company.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.api.patchJson(
        '/api/mobile/contacts/${widget.item['id']}',
        body: {
          'name': _name.text.trim(),
          'phone': _phone.text.trim(),
          'email': _email.text.trim(),
          'company': _company.text.trim(),
          'notes': _notes.text.trim(),
          'status': _status,
        },
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Contact updated')));
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
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SectionTitle(title: 'Edit contact'),
            // Quick action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _phone.text.trim().isEmpty
                        ? null
                        : () => openExternalUri(
                            context,
                            Uri(scheme: 'tel', path: _phone.text.trim()),
                          ),
                    icon: const Icon(Icons.call_rounded, size: 16),
                    label: const Text('Call'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _email.text.trim().isEmpty
                        ? null
                        : () => openExternalUri(
                            context,
                            Uri(scheme: 'mailto', path: _email.text.trim()),
                          ),
                    icon: const Icon(Icons.mail_outline_rounded, size: 16),
                    label: const Text('Email'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _phone.text.trim().isEmpty
                        ? null
                        : () => openExternalUri(
                            context,
                            Uri.parse(
                              'https://wa.me/${_phone.text.replaceAll(RegExp(r'[^0-9]'), '')}',
                            ),
                          ),
                    icon: const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 16,
                    ),
                    label: const Text('WA'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _label('Name'), const SizedBox(height: 6),
            TextField(
              controller: _name,
              decoration: const InputDecoration(hintText: 'Full name'),
            ),
            const SizedBox(height: 12),
            _label('Phone'), const SizedBox(height: 6),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(hintText: '+91 9876543210'),
            ),
            const SizedBox(height: 12),
            _label('Email'), const SizedBox(height: 6),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(hintText: 'email@example.com'),
            ),
            const SizedBox(height: 12),
            _label('Company'), const SizedBox(height: 6),
            TextField(
              controller: _company,
              decoration: const InputDecoration(hintText: 'Company name'),
            ),
            const SizedBox(height: 12),
            _label('Status'), const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _status,
              decoration: const InputDecoration(),
              items: const [
                DropdownMenuItem(value: 'active', child: Text('Active')),
                DropdownMenuItem(value: 'lead', child: Text('Lead')),
                DropdownMenuItem(value: 'customer', child: Text('Customer')),
                DropdownMenuItem(value: 'blocked', child: Text('Blocked')),
              ],
              onChanged: (v) => setState(() => _status = v ?? 'active'),
            ),
            const SizedBox(height: 12),
            _label('Notes'), const SizedBox(height: 6),
            TextField(
              controller: _notes,
              minLines: 3,
              maxLines: 5,
              decoration: const InputDecoration(hintText: 'Any notes…'),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.save_rounded, size: 18),
              label: const Text('Save contact'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Text(
    text,
    style: GoogleFonts.inter(
      fontSize: 13,
      fontWeight: FontWeight.w500,
      color: AppColors.text,
    ),
  );
}
