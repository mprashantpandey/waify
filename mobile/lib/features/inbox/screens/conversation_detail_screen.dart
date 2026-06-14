part of '../../../main.dart';

class ConversationDetailScreen extends StatefulWidget {
  const ConversationDetailScreen({
    super.key,
    required this.api,
    required this.conversationId,
    required this.title,
  });

  final ApiClient api;
  final int conversationId;
  final String title;

  @override
  State<ConversationDetailScreen> createState() =>
      _ConversationDetailScreenState();
}

class _ConversationDetailScreenState extends State<ConversationDetailScreen> {
  late Future<Map<String, dynamic>> _future;
  final _controller = TextEditingController();
  final _messageSearch = TextEditingController();
  final _scrollController = ScrollController();
  Map<String, dynamic>? _conversationSnapshot;
  List<Map<String, dynamic>> _agentsSnapshot = [];
  bool _sending = false;
  bool _uploading = false;
  bool _searching = false;
  bool _nearBottom = true;
  String _messageQuery = '';

  @override
  void initState() {
    super.initState();
    _future = _load();
    _restoreDraft();
    _scrollController.addListener(_handleScroll);
  }

  @override
  void dispose() {
    _controller.dispose();
    _messageSearch.dispose();
    _scrollController.removeListener(_handleScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _handleScroll() {
    if (!_scrollController.hasClients) {
      return;
    }
    final distance =
        _scrollController.position.maxScrollExtent - _scrollController.offset;
    final near = distance < 120;
    if (near != _nearBottom && mounted) {
      setState(() => _nearBottom = near);
    }
  }

  Future<Map<String, dynamic>> _load() async {
    final data = await widget.api.getJson(
      '/api/mobile/inbox/${widget.conversationId}',
    );
    final conversation = data['conversation'];
    final agents = data['agents'];
    if (mounted && conversation is Map) {
      setState(() {
        _conversationSnapshot = Map<String, dynamic>.from(conversation);
        _agentsSnapshot = agents is List
            ? agents
                  .whereType<Map>()
                  .map((agent) => Map<String, dynamic>.from(agent))
                  .toList()
            : <Map<String, dynamic>>[];
      });
    }
    return data;
  }

  Future<void> _restoreDraft() async {
    final draft = await DraftStore.load(widget.conversationId);
    if (!mounted || draft.isEmpty || _controller.text.isNotEmpty) {
      return;
    }
    _controller.text = draft;
  }

  Future<void> _send(String text) async {
    final body = text.trim();
    if (body.isEmpty || _sending) {
      return;
    }
    setState(() => _sending = true);
    try {
      await widget.api.postJson(
        '/api/mobile/inbox/${widget.conversationId}/quick-reply',
        body: {'message': body},
      );
      _controller.clear();
      await DraftStore.clear(widget.conversationId);
      setState(() {
        _future = _load();
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _sending = false);
      }
    }
  }

  void _insertReply(String text) {
    if (text.trim().isEmpty) {
      return;
    }
    _controller.text = text;
    _controller.selection = TextSelection.collapsed(
      offset: _controller.text.length,
    );
    DraftStore.save(widget.conversationId, _controller.text);
  }

  Future<void> _markRead() async {
    await widget.api.postJson(
      '/api/mobile/inbox/${widget.conversationId}/read',
    );
    setState(() {
      _future = _load();
    });
  }

  Future<void> _setStatus(String status) async {
    await widget.api.patchJson(
      '/api/mobile/inbox/${widget.conversationId}',
      body: {'status': status},
    );
    setState(() {
      _future = _load();
    });
  }

  Future<void> _setPriority(String priority) async {
    await widget.api.patchJson(
      '/api/mobile/inbox/${widget.conversationId}',
      body: {'priority': priority},
    );
    setState(() {
      _future = _load();
    });
  }

  Future<void> _setBotPaused(bool paused) async {
    await widget.api.postJson(
      '/api/mobile/inbox/${widget.conversationId}/bot',
      body: {
        'paused': paused,
        'reason': paused ? 'Paused by mobile agent' : null,
        'assign_to_me': paused,
      },
    );
    setState(() {
      _future = _load();
    });
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) {
      return;
    }
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
    );
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _startWhatsAppCall(Map<String, dynamic> conversation) async {
    try {
      final payload = await widget.api.postJson(
        '/api/mobile/inbox/${widget.conversationId}/call',
      );
      if (mounted) {
        _showSnack(payload['message']?.toString() ?? 'WhatsApp call queued.');
      }
    } catch (error) {
      if (mounted) {
        _showSnack(error.toString());
      }
    }
  }

  Future<void> _sendCurrentLocation() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        _showSnack('Location permission is required to send a location pin.');
        return;
      }
      final enabled = await Geolocator.isLocationServiceEnabled();
      if (!enabled) {
        _showSnack('Turn on device location services first.');
        return;
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      await widget.api.postJson(
        '/api/mobile/inbox/${widget.conversationId}/location',
        body: {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'name': 'Current location',
        },
      );
      if (mounted) {
        _showSnack('Location sent');
        setState(() {
          _future = _load();
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    } catch (error) {
      if (mounted) {
        _showSnack(error.toString());
      }
    }
  }

  void _showContactSheet(Map<String, dynamic> conversation) {
    final phone = conversation['contact_phone']?.toString() ?? '';
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.surface,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.greenDark,
                    child: Text(
                      widget.title.characters.first.toUpperCase(),
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: GoogleFonts.inter(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: AppColors.text,
                          ),
                        ),
                        Text(
                          phone.isEmpty ? 'No phone number' : phone,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: phone.isEmpty
                          ? null
                          : () => openExternalUri(
                              context,
                              Uri(scheme: 'tel', path: phone),
                            ),
                      icon: const Icon(Icons.call_rounded),
                      label: const Text('Call'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: phone.isEmpty
                          ? null
                          : () => openExternalUri(
                              context,
                              Uri.parse(
                                'https://wa.me/${phone.replaceAll(RegExp(r'[^0-9]'), '')}',
                              ),
                            ),
                      icon: const Icon(Icons.chat_bubble_rounded),
                      label: const Text('WhatsApp'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              InfoCard(
                title: 'Conversation',
                body:
                    [
                          conversation['status']?.toString(),
                          conversation['priority']?.toString(),
                          conversation['connection_name']?.toString(),
                        ]
                        .where((value) => value != null && value.isNotEmpty)
                        .join(' · '),
              ),
              if (conversation['contact_id'] != null) ...[
                const SizedBox(height: 10),
                FilledButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      showDragHandle: true,
                      builder: (_) => ContactEditSheet(
                        api: widget.api,
                        item: {
                          'id': conversation['contact_id'],
                          'name': conversation['contact_name'],
                          'phone': conversation['contact_phone'],
                          'email': conversation['contact_email'],
                          'company': conversation['contact_company'],
                          'notes': conversation['contact_notes'],
                          'status': conversation['contact_status'],
                        },
                      ),
                    ).whenComplete(() {
                      if (!mounted) {
                        return;
                      }
                      setState(() {
                        _future = _load();
                      });
                    });
                  },
                  icon: const Icon(Icons.edit_rounded),
                  label: const Text('Edit contact'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showMessageActions(Map<String, dynamic> message, String body) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.copy_rounded),
              title: const Text('Copy message'),
              onTap: () async {
                Navigator.pop(context);
                await Clipboard.setData(ClipboardData(text: body));
                if (mounted) {
                  _showSnack('Message copied');
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.info_outline_rounded),
              title: const Text('Message details'),
              subtitle: Text(
                [
                      message['type']?.toString(),
                      message['status']?.toString(),
                      message['created_at']?.toString(),
                    ]
                    .where((value) => value != null && value.isNotEmpty)
                    .join(' · '),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAttachmentMenu() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Wrap(
            runSpacing: 8,
            children: [
              _AttachmentOption(
                icon: Icons.image_rounded,
                label: 'Image',
                onTap: () => _pickAndSendMedia('image'),
              ),
              _AttachmentOption(
                icon: Icons.description_rounded,
                label: 'Document',
                onTap: () => _pickAndSendMedia('document'),
              ),
              _AttachmentOption(
                icon: Icons.videocam_rounded,
                label: 'Video',
                onTap: () => _pickAndSendMedia('video'),
              ),
              _AttachmentOption(
                icon: Icons.mic_rounded,
                label: 'Audio',
                onTap: () => _pickAndSendMedia('audio'),
              ),
              _AttachmentOption(
                icon: Icons.location_on_rounded,
                label: 'Location',
                onTap: _sendCurrentLocation,
              ),
              _AttachmentOption(
                icon: Icons.person_pin_circle_rounded,
                label: 'Contact',
                onTap: _showContactCardDialog,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickAndSendMedia(String type) async {
    final pickerType = switch (type) {
      'image' => FileType.image,
      'video' => FileType.video,
      'audio' => FileType.audio,
      _ => FileType.custom,
    };
    final result = await FilePicker.pickFiles(
      type: pickerType,
      allowedExtensions: type == 'document'
          ? ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']
          : null,
      withData: false,
    );
    final file = result?.files.single;
    if (file == null || file.path == null) {
      return;
    }

    if (!mounted) {
      return;
    }

    final caption = type == 'image' || type == 'video' || type == 'document'
        ? await _askCaption(file.name)
        : null;
    if (!mounted || (caption == null && type != 'audio')) {
      return;
    }
    await _sendMedia(
      type: type,
      filePath: file.path!,
      filename: file.name,
      caption: caption,
    );
  }

  Future<void> _showContactCardDialog() async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final email = TextEditingController();
    final company = TextEditingController();

    try {
      final payload = await showDialog<Map<String, String>>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Send contact card'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: name,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email optional',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: company,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Company optional',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final card = {
                  'formatted_name': name.text.trim(),
                  'phone': phone.text.trim(),
                  if (email.text.trim().isNotEmpty) 'email': email.text.trim(),
                  if (company.text.trim().isNotEmpty)
                    'company': company.text.trim(),
                };
                if (card['formatted_name']!.isEmpty || card['phone']!.isEmpty) {
                  return;
                }
                Navigator.pop(context, card);
              },
              child: const Text('Send'),
            ),
          ],
        ),
      );

      if (payload == null || !mounted) {
        return;
      }

      await widget.api.postJson(
        '/api/mobile/inbox/${widget.conversationId}/contact-card',
        body: payload,
      );
      if (mounted) {
        _showSnack('Contact card sent');
        setState(() {
          _future = _load();
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    } catch (error) {
      if (mounted) {
        _showSnack(error.toString());
      }
    } finally {
      name.dispose();
      phone.dispose();
      email.dispose();
      company.dispose();
    }
  }

  Future<String?> _askCaption(String filename) async {
    final caption = TextEditingController();
    try {
      return showDialog<String>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Send $filename'),
          content: TextField(
            controller: caption,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Caption',
              hintText: 'Optional caption',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, caption.text.trim()),
              child: const Text('Send'),
            ),
          ],
        ),
      );
    } finally {
      caption.dispose();
    }
  }

  Future<void> _sendMedia({
    required String type,
    required String filePath,
    required String filename,
    String? caption,
  }) async {
    if (_uploading) {
      return;
    }
    setState(() => _uploading = true);
    try {
      await widget.api.postMultipart(
        '/api/mobile/inbox/${widget.conversationId}/media',
        fileField: 'attachment',
        filePath: filePath,
        filename: filename,
        fields: {
          'type': type,
          if (caption != null && caption.isNotEmpty) 'caption': caption,
        },
      );
      if (mounted) {
        _showSnack('Media sent');
        setState(() {
          _future = _load();
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    } catch (error) {
      if (mounted) {
        _showSnack(error.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _uploading = false);
      }
    }
  }

  void _showAssignSheet() {
    final conversation = _conversationSnapshot;
    if (conversation == null) {
      _showSnack('Conversation is still loading.');
      return;
    }
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          children: [
            SectionTitle(title: 'Assign agent'),
            ListTile(
              leading: const CircleAvatar(
                child: Icon(Icons.person_off_rounded),
              ),
              title: const Text('Unassigned'),
              onTap: () => _assignAgent(null),
            ),
            ..._agentsSnapshot.map(
              (agent) => ListTile(
                leading: CircleAvatar(
                  child: Text(
                    (agent['name']?.toString() ?? 'A').characters.first
                        .toUpperCase(),
                  ),
                ),
                title: Text(agent['name']?.toString() ?? 'Agent'),
                subtitle: Text(
                  agent['email']?.toString() ?? agent['role']?.toString() ?? '',
                ),
                trailing: conversation['assigned_to'] == agent['id']
                    ? const Icon(
                        Icons.check_rounded,
                        color: AppColors.greenDark,
                      )
                    : null,
                onTap: () => _assignAgent(agent['id']),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _assignAgent(dynamic agentId) async {
    Navigator.pop(context);
    try {
      await widget.api.patchJson(
        '/api/mobile/inbox/${widget.conversationId}',
        body: {'assigned_to': agentId},
      );
      if (mounted) {
        _showSnack('Assignment updated');
        setState(() {
          _future = _load();
        });
      }
    } catch (error) {
      if (mounted) {
        _showSnack(error.toString());
      }
    }
  }

  void _showChatMenu() {
    final conversation = _conversationSnapshot;
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.person_rounded),
              title: const Text('Contact details'),
              onTap: conversation == null
                  ? null
                  : () {
                      Navigator.pop(context);
                      _showContactSheet(conversation);
                    },
            ),
            ListTile(
              leading: const Icon(Icons.assignment_ind_rounded),
              title: const Text('Assign agent'),
              onTap: () {
                Navigator.pop(context);
                _showAssignSheet();
              },
            ),
            ListTile(
              leading: const Icon(Icons.call_rounded),
              title: const Text('Start WhatsApp AI call'),
              onTap: conversation == null
                  ? null
                  : () {
                      Navigator.pop(context);
                      _startWhatsAppCall(conversation);
                    },
            ),
            ListTile(
              leading: const Icon(Icons.my_location_rounded),
              title: const Text('Send current location'),
              onTap: () {
                Navigator.pop(context);
                _sendCurrentLocation();
              },
            ),
            ListTile(
              leading: const Icon(Icons.done_all_rounded),
              title: const Text('Mark read'),
              onTap: () {
                Navigator.pop(context);
                _markRead();
              },
            ),
          ],
        ),
      ),
    );
  }

  bool _shouldShowDate(
    Map<String, dynamic>? previous,
    Map<String, dynamic> current,
  ) {
    final currentDate = DateTime.tryParse(
      current['created_at']?.toString() ?? '',
    )?.toLocal();
    if (currentDate == null) {
      return false;
    }
    final previousDate = DateTime.tryParse(
      previous?['created_at']?.toString() ?? '',
    )?.toLocal();
    if (previousDate == null) {
      return true;
    }
    return currentDate.year != previousDate.year ||
        currentDate.month != previousDate.month ||
        currentDate.day != previousDate.day;
  }

  @override
  Widget build(BuildContext context) {
    final title =
        (_conversationSnapshot?['contact_name']?.toString().trim().isNotEmpty ??
            false)
        ? _conversationSnapshot!['contact_name'].toString()
        : widget.title;
    final titleInitial = title.characters.isEmpty
        ? '?'
        : title.characters.first.toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.chatBg,
      appBar: AppBar(
        backgroundColor: AppColors.greenDarker,
        foregroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  titleInitial,
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Builder(
                    builder: (context) {
                      final phone = _conversationSnapshot?['contact_phone']
                          ?.toString();
                      final botPaused =
                          _conversationSnapshot?['bot_paused'] == true;
                      final subtitleParts = [
                        if (phone != null && phone.isNotEmpty) phone,
                        if (botPaused) 'Bot paused',
                      ];
                      if (subtitleParts.isEmpty) return const SizedBox.shrink();
                      return Text(
                        subtitleParts.join(' · '),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: Colors.white.withValues(alpha: 0.75),
                          fontWeight: FontWeight.w400,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
        titleTextStyle: GoogleFonts.inter(fontSize: 15, color: Colors.white),
        iconTheme: const IconThemeData(color: Colors.white),
        actionsIconTheme: const IconThemeData(color: Colors.white),
        shape: null,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        actions: [
          IconButton(
            tooltip: _searching ? 'Close search' : 'Search messages',
            icon: Icon(_searching ? Icons.close_rounded : Icons.search_rounded),
            onPressed: () {
              setState(() {
                _searching = !_searching;
                if (!_searching) {
                  _messageSearch.clear();
                  _messageQuery = '';
                }
              });
            },
          ),
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              setState(() {
                _future = _load();
              });
            },
          ),
          IconButton(
            tooltip: 'Chat menu',
            icon: const Icon(Icons.more_vert_rounded),
            onPressed: _showChatMenu,
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
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

          final data = snapshot.data ?? {};
          final conversation = Map<String, dynamic>.from(
            data['conversation'] as Map,
          );
          final messages = List<Map<String, dynamic>>.from(
            (data['messages'] as List).map(
              (e) => Map<String, dynamic>.from(e as Map),
            ),
          );
          final replies = List<Map<String, dynamic>>.from(
            (data['quick_replies'] as List).map(
              (e) => Map<String, dynamic>.from(e as Map),
            ),
          );
          final agents = List<Map<String, dynamic>>.from(
            (data['agents'] as List? ?? []).map(
              (e) => Map<String, dynamic>.from(e as Map),
            ),
          );
          _conversationSnapshot = conversation;
          _agentsSnapshot = agents;
          final visibleMessages = _messageQuery.trim().isEmpty
              ? messages
              : messages.where((message) {
                  final text = [
                    message['text_body'],
                    message['type'],
                    message['status'],
                  ].whereType<Object>().join(' ').toLowerCase();
                  return text.contains(_messageQuery.trim().toLowerCase());
                }).toList();
          final isClosed = conversation['status'] == 'closed';
          final botPaused = conversation['bot_paused'] == true;

          return Column(
            children: [
              if (_searching)
                Container(
                  color: AppColors.surface,
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  child: TextField(
                    controller: _messageSearch,
                    autofocus: true,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search_rounded),
                      hintText: 'Search messages',
                    ),
                    onChanged: (value) => setState(() => _messageQuery = value),
                  ),
                ),
              // ── Action toolbar ─────────────────────────────────────────
              Container(
                color: AppColors.surface,
                child: Column(
                  children: [
                    // Meta info row
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                      child: Row(
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  if ((conversation['assigned_agent_name']?.toString() ?? '').isNotEmpty)
                                    _MetaPill(
                                      icon: Icons.assignment_ind_rounded,
                                      label: conversation['assigned_agent_name'].toString(),
                                      accent: AppColors.greenDark,
                                    ),
                                  if ((conversation['assigned_agent_name']?.toString() ?? '').isNotEmpty)
                                    const SizedBox(width: 6),
                                  _MetaPill(
                                    icon: Icons.phone_outlined,
                                    label: conversation['contact_phone']?.toString() ?? 'No phone',
                                  ),
                                  const SizedBox(width: 6),
                                  _MetaPill(
                                    icon: Icons.hub_outlined,
                                    label: conversation['connection_name']?.toString() ?? 'No channel',
                                  ),
                                ],
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () => _showContactSheet(conversation),
                            icon: const Icon(Icons.info_outline_rounded, size: 20, color: AppColors.muted),
                            padding: const EdgeInsets.all(6),
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                    ),

                    if (_uploading) ...[
                      const SizedBox(height: 6),
                      const LinearProgressIndicator(minHeight: 2, color: AppColors.greenDark),
                    ],
                    if (botPaused || isClosed) ...[
                      Padding(
                        padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                        child: _ConversationBanner(
                          icon: isClosed
                              ? Icons.lock_outline_rounded
                              : Icons.pause_circle_outline_rounded,
                          text: isClosed
                              ? 'Conversation is closed. Reopen it before replying.'
                              : 'Bot is paused. Human replies can continue.',
                          color: isClosed ? AppColors.errorText : AppColors.warningText,
                        ),
                      ),
                    ],

                    // Action chips row
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 8, 14, 10),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _ActionChipButton(
                              icon: Icons.done_all_rounded,
                              label: 'Read',
                              onPressed: _markRead,
                            ),
                            const SizedBox(width: 7),
                            _ActionChipButton(
                              icon: conversation['bot_paused'] == true
                                  ? Icons.smart_toy_rounded
                                  : Icons.pause_circle_outline_rounded,
                              label: conversation['bot_paused'] == true ? 'Resume bot' : 'Pause bot',
                              onPressed: () => _setBotPaused(conversation['bot_paused'] != true),
                              active: conversation['bot_paused'] == true,
                            ),
                            const SizedBox(width: 7),
                            _ActionChipButton(
                              icon: conversation['status'] == 'closed'
                                  ? Icons.lock_open_rounded
                                  : Icons.lock_outline_rounded,
                              label: conversation['status'] == 'closed' ? 'Reopen' : 'Close',
                              onPressed: () => _setStatus(
                                conversation['status'] == 'closed' ? 'open' : 'closed',
                              ),
                              danger: conversation['status'] != 'closed',
                            ),
                            const SizedBox(width: 7),
                            _ActionChipButton(
                              icon: Icons.assignment_ind_rounded,
                              label: 'Assign',
                              onPressed: _showAssignSheet,
                            ),
                            const SizedBox(width: 7),
                            _ActionChipButton(
                              icon: Icons.call_rounded,
                              label: 'WA call',
                              active: conversation['calling_enabled'] == true,
                              onPressed: () => _startWhatsAppCall(conversation),
                            ),
                            const SizedBox(width: 7),
                            PopupMenuButton<String>(
                              tooltip: 'Priority',
                              onSelected: _setPriority,
                              itemBuilder: (_) => const [
                                PopupMenuItem(value: 'low', child: Text('Low')),
                                PopupMenuItem(value: 'normal', child: Text('Normal')),
                                PopupMenuItem(value: 'high', child: Text('High')),
                                PopupMenuItem(value: 'urgent', child: Text('🔥 Urgent')),
                              ],
                              child: _ActionChipButton(
                                icon: Icons.flag_outlined,
                                label: conversation['priority']?.toString() ?? 'normal',
                                onPressed: () {},
                                trailing: const Icon(Icons.arrow_drop_down, size: 14, color: AppColors.muted),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Divider(height: 1),
                  ],
                ),
              ),

              // Messages list
              Expanded(
                child: Stack(
                  children: [
                    visibleMessages.isEmpty
                        ? Center(
                            child: EmptyState(
                              message: _messageQuery.trim().isEmpty
                                  ? 'No messages loaded.'
                                  : 'No messages match your search.',
                              icon: Icons.chat_bubble_outline_rounded,
                            ),
                          )
                        : ListView.builder(
                            controller: _scrollController,
                            padding: const EdgeInsets.fromLTRB(12, 12, 12, 76),
                            itemCount: visibleMessages.length,
                            itemBuilder: (context, i) {
                              final msg = visibleMessages[i];
                              final previous = i > 0
                                  ? visibleMessages[i - 1]
                                  : null;
                              final outbound = msg['direction'] == 'outbound';
                              final payload = msg['payload'] is Map
                                  ? Map<String, dynamic>.from(
                                      msg['payload'] as Map,
                                    )
                                  : <String, dynamic>{};
                              final isCallTranscript =
                                  payload['source'] == 'voice_bridge' ||
                                  payload['voice_session_id'] != null;
                              final body =
                                  msg['text_body']?.toString() ??
                                  msg['type']?.toString() ??
                                  'Message';

                              final showDate = _shouldShowDate(previous, msg);

                              return Column(
                                children: [
                                  if (showDate)
                                    _DateSeparator(
                                      value: msg['created_at']?.toString(),
                                    ),
                                  Align(
                                    alignment: outbound
                                        ? Alignment.centerRight
                                        : Alignment.centerLeft,
                                    child: GestureDetector(
                                      onLongPress: () =>
                                          _showMessageActions(msg, body),
                                      child: Container(
                                        margin: const EdgeInsets.only(
                                          bottom: 6,
                                        ),
                                        constraints: BoxConstraints(
                                          maxWidth:
                                              MediaQuery.of(
                                                context,
                                              ).size.width *
                                              0.78,
                                        ),
                                        decoration: BoxDecoration(
                                          color: outbound
                                              ? AppColors.bubbleSent
                                              : AppColors.bubbleRecv,
                                          borderRadius: BorderRadius.only(
                                            topLeft: const Radius.circular(12),
                                            topRight: const Radius.circular(12),
                                            bottomLeft: Radius.circular(
                                              outbound ? 12 : 3,
                                            ),
                                            bottomRight: Radius.circular(
                                              outbound ? 3 : 12,
                                            ),
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(
                                                alpha: 0.06,
                                              ),
                                              blurRadius: 3,
                                              offset: const Offset(0, 1),
                                            ),
                                          ],
                                        ),
                                        padding: const EdgeInsets.fromLTRB(
                                          10,
                                          8,
                                          10,
                                          6,
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            if (isCallTranscript)
                                              Container(
                                                margin: const EdgeInsets.only(
                                                  bottom: 5,
                                                ),
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 3,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: AppColors.greenSoft,
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                ),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    const Icon(
                                                      Icons.call_rounded,
                                                      size: 12,
                                                      color:
                                                          AppColors.greenDark,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Flexible(
                                                      child: Text(
                                                        'Call transcript · ${outbound ? 'Agent' : 'Caller'}',
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style:
                                                            GoogleFonts.inter(
                                                              fontSize: 11,
                                                              color: AppColors
                                                                  .greenDarker,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                            ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            _MessageContent(
                                              message: msg,
                                              body: body,
                                              payload: payload,
                                            ),
                                            const SizedBox(height: 3),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    relativeTime(
                                                      msg['created_at']
                                                          ?.toString(),
                                                    ),
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: GoogleFonts.inter(
                                                      fontSize: 10,
                                                      color:
                                                          AppColors.chatMuted,
                                                    ),
                                                  ),
                                                ),
                                                if (outbound) ...[
                                                  const SizedBox(width: 3),
                                                  _MessageStatusIcon(
                                                    status: msg['status']
                                                        ?.toString(),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                    if (!_nearBottom && visibleMessages.isNotEmpty)
                      Positioned(
                        right: 14,
                        bottom: 14,
                        child: FloatingActionButton.small(
                          heroTag:
                              'chat-scroll-bottom-${widget.conversationId}',
                          backgroundColor: AppColors.greenDark,
                          foregroundColor: Colors.white,
                          onPressed: _scrollToBottom,
                          child: const Icon(Icons.keyboard_arrow_down_rounded),
                        ),
                      ),
                  ],
                ),
              ),

              // ── Reply input bar ─────────────────────────────────────────
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.07),
                      blurRadius: 12,
                      offset: const Offset(0, -3),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  minimum: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Quick reply suggestion pills
                      if (replies.isNotEmpty) ...[
                        SizedBox(
                          height: 34,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: replies.length,
                            separatorBuilder: (context, i) => const SizedBox(width: 7),
                            itemBuilder: (context, i) {
                              final reply = replies[i];
                              return GestureDetector(
                                onTap: () => _insertReply(reply['text']?.toString() ?? ''),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.greenSoft,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: AppColors.greenDark.withValues(alpha: 0.25),
                                    ),
                                  ),
                                  child: Text(
                                    reply['label']?.toString() ?? 'Reply',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.greenDarker,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 8),
                      ],
                      // Text field row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          // Attach button
                          _InputIconButton(
                            icon: Icons.add_rounded,
                            onPressed: _showAttachmentMenu,
                          ),
                          const SizedBox(width: 6),
                          // Quick replies button
                          _InputIconButton(
                            icon: Icons.bolt_rounded,
                            onPressed: isClosed
                                ? null
                                : () => showModalBottomSheet<void>(
                                    context: context,
                                    showDragHandle: true,
                                    isScrollControlled: true,
                                    builder: (_) => QuickReplySheet(
                                      replies: replies,
                                      onSelected: _insertReply,
                                    ),
                                  ),
                          ),
                          const SizedBox(width: 8),
                          // Message field
                          Expanded(
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.bg,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: TextField(
                                controller: _controller,
                                enabled: !isClosed,
                                minLines: 1,
                                maxLines: 5,
                                onChanged: (v) => DraftStore.save(widget.conversationId, v),
                                style: GoogleFonts.inter(fontSize: 14, color: AppColors.text),
                                decoration: InputDecoration(
                                  hintText: isClosed ? 'Conversation closed…' : 'Message…',
                                  hintStyle: GoogleFonts.inter(color: AppColors.mutedLight, fontSize: 14),
                                  filled: false,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Send button with gradient
                          GestureDetector(
                            onTap: _sending
                                ? null
                                : isClosed
                                ? () => _showSnack('Reopen the conversation before replying.')
                                : () => _send(_controller.text),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [AppColors.greenDark, AppColors.greenDarker],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.greenDark.withValues(alpha: 0.35),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: _sending
                                  ? const Padding(
                                      padding: EdgeInsets.all(12),
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ActionChipButton extends StatelessWidget {
  const _ActionChipButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    this.active = false,
    this.danger = false,
    this.trailing,
  });

  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final bool active;
  final bool danger;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final Color bg;
    final Color iconColor;
    final Color textColor;
    final Color borderColor;

    if (active) {
      bg = AppColors.warningSurface;
      iconColor = AppColors.warningText;
      textColor = AppColors.warningText;
      borderColor = AppColors.warningText.withValues(alpha: 0.4);
    } else if (danger) {
      bg = AppColors.errorSurface;
      iconColor = AppColors.errorText;
      textColor = AppColors.errorText;
      borderColor = AppColors.errorBorder;
    } else {
      bg = AppColors.bg;
      iconColor = AppColors.muted;
      textColor = AppColors.textSecondary;
      borderColor = AppColors.border;
    }

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: iconColor),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
            if (trailing != null) ...[const SizedBox(width: 2), trailing!],
          ],
        ),
      ),
    );
  }
}

class _ConversationBanner extends StatelessWidget {
  const _ConversationBanner({
    required this.icon,
    required this.text,
    required this.color,
  });

  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.22)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({required this.icon, required this.label, this.accent});

  final IconData icon;
  final String label;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final color = accent;
    return Container(
      constraints: const BoxConstraints(maxWidth: 190),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: color != null ? color.withValues(alpha: 0.08) : AppColors.bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color != null ? color.withValues(alpha: 0.3) : AppColors.border,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color ?? AppColors.muted),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: color ?? AppColors.muted,
                fontWeight: color != null ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DateSeparator extends StatelessWidget {
  const _DateSeparator({required this.value});

  final String? value;

  String _label(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final d = DateTime(date.year, date.month, date.day);
    final diff = today.difference(d).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    if (diff < 7) {
      const weekdays = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      return weekdays[date.weekday - 1];
    }
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    final month = months[date.month - 1];
    if (date.year == now.year) {
      return '$month ${date.day}';
    }
    return '$month ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(value ?? '')?.toLocal();
    if (date == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.75),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            _label(date),
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.chatMuted,
            ),
          ),
        ),
      ),
    );
  }
}

class _MessageContent extends StatelessWidget {
  const _MessageContent({
    required this.message,
    required this.body,
    required this.payload,
  });

  final Map<String, dynamic> message;
  final String body;
  final Map<String, dynamic> payload;

  @override
  Widget build(BuildContext context) {
    final type = message['type']?.toString().toLowerCase() ?? 'text';
    final mediaUrl = _mediaUrl();
    final contactName = _contactCardName();
    if ((type == 'contacts' || type == 'contact') && contactName != null) {
      final contactPhone = _contactCardPhone();
      return _AttachmentCard(
        icon: Icons.person_pin_circle_rounded,
        label: contactName,
        body: contactPhone == null
            ? 'Contact card'
            : '$contactName\n$contactPhone',
      );
    }

    final location = _location();
    if (type == 'location' && location != null) {
      final lat = location.$1;
      final lon = location.$2;
      final title = payload['name']?.toString() ?? body;
      final address = payload['address']?.toString();
      return InkWell(
        onTap: () => openExternalUri(
          context,
          Uri.parse('https://maps.google.com/?q=$lat,$lon'),
        ),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.location_on_rounded,
                color: AppColors.greenDark,
                size: 22,
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title.isEmpty ? 'Location shared' : title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                    Text(
                      address?.isNotEmpty == true
                          ? address!
                          : '${lat.toStringAsFixed(5)}, ${lon.toStringAsFixed(5)}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              const Icon(
                Icons.open_in_new_rounded,
                size: 14,
                color: AppColors.muted,
              ),
            ],
          ),
        ),
      );
    }

    if (mediaUrl != null && mediaUrl.isNotEmpty) {
      final icon = switch (type) {
        'image' => Icons.image_rounded,
        'video' => Icons.videocam_rounded,
        'audio' || 'voice' => Icons.mic_rounded,
        'document' => Icons.description_rounded,
        _ => Icons.attach_file_rounded,
      };
      final label = _mediaLabel(type);
      if (type == 'image') {
        return InkWell(
          onTap: () => openExternalUri(context, Uri.parse(mediaUrl)),
          borderRadius: BorderRadius.circular(10),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: 260,
                    maxHeight: 220,
                  ),
                  child: Image.network(
                    mediaUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        _AttachmentCard(icon: icon, label: label, body: body),
                  ),
                ),
                if (body.isNotEmpty && body != type)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      body,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.text,
                        height: 1.35,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      }

      return InkWell(
        onTap: () => openExternalUri(context, Uri.parse(mediaUrl)),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Icon(icon, color: AppColors.greenDark, size: 20),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  body == type || body.isEmpty ? label : body,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              const Icon(
                Icons.open_in_new_rounded,
                size: 14,
                color: AppColors.muted,
              ),
            ],
          ),
        ),
      );
    }

    return SelectableText(
      body,
      style: GoogleFonts.inter(
        fontSize: 14,
        color: AppColors.text,
        height: 1.4,
      ),
    );
  }

  String? _mediaUrl() {
    for (final key in ['media_url', 'url', 'link', 'file_url', 'local_url']) {
      final value = payload[key]?.toString();
      if (value != null && value.startsWith('http')) {
        return value;
      }
    }
    final nested = payload['media'];
    if (nested is Map) {
      final value = nested['url']?.toString() ?? nested['link']?.toString();
      if (value != null && value.startsWith('http')) {
        return value;
      }
    }
    return null;
  }

  (double, double)? _location() {
    final lat = double.tryParse(
      (payload['latitude'] ?? payload['lat'] ?? '').toString(),
    );
    final lon = double.tryParse(
      (payload['longitude'] ?? payload['lng'] ?? payload['lon'] ?? '')
          .toString(),
    );
    if (lat == null || lon == null) {
      return null;
    }
    return (lat, lon);
  }

  String _mediaLabel(String type) {
    final filename = payload['filename']?.toString();
    if (filename != null && filename.trim().isNotEmpty) {
      return filename;
    }
    return switch (type) {
      'video' => 'Open video',
      'audio' || 'voice' => 'Open audio',
      'document' => 'Open document',
      _ => 'Open attachment',
    };
  }

  String? _contactCardName() {
    final contacts = payload['contacts'];
    if (contacts is List && contacts.isNotEmpty && contacts.first is Map) {
      final contact = Map<String, dynamic>.from(contacts.first as Map);
      final name = contact['name'];
      if (name is Map) {
        final formatted = name['formatted_name']?.toString();
        if (formatted != null && formatted.trim().isNotEmpty) {
          return formatted;
        }
      }
    }
    return null;
  }

  String? _contactCardPhone() {
    final contacts = payload['contacts'];
    if (contacts is List && contacts.isNotEmpty && contacts.first is Map) {
      final contact = Map<String, dynamic>.from(contacts.first as Map);
      final phones = contact['phones'];
      if (phones is List && phones.isNotEmpty && phones.first is Map) {
        final phone = (phones.first as Map)['phone']?.toString();
        if (phone != null && phone.trim().isNotEmpty) {
          return phone;
        }
      }
    }
    return null;
  }
}

class _AttachmentCard extends StatelessWidget {
  const _AttachmentCard({
    required this.icon,
    required this.label,
    required this.body,
  });

  final IconData icon;
  final String label;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.greenDark, size: 20),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              body.isEmpty ? label : body,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 6),
          const Icon(
            Icons.open_in_new_rounded,
            size: 14,
            color: AppColors.muted,
          ),
        ],
      ),
    );
  }
}

class _InputIconButton extends StatelessWidget {
  const _InputIconButton({required this.icon, this.onPressed});

  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: enabled ? AppColors.bg : AppColors.bg.withValues(alpha: 0.5),
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.border),
        ),
        child: Icon(
          icon,
          size: 20,
          color: enabled ? AppColors.muted : AppColors.mutedLight,
        ),
      ),
    );
  }
}

class _MessageStatusIcon extends StatelessWidget {
  const _MessageStatusIcon({required this.status});

  final String? status;

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case 'read':
        return const Icon(Icons.done_all, size: 13, color: AppColors.greenDark);
      case 'delivered':
        return const Icon(
          Icons.done_all,
          size: 13,
          color: AppColors.chatMuted,
        );
      case 'failed':
        return const Icon(
          Icons.error_outline_rounded,
          size: 13,
          color: AppColors.errorText,
        );
      default: // sent, pending, etc.
        return const Icon(Icons.done, size: 13, color: AppColors.chatMuted);
    }
  }
}

class _AttachmentOption extends StatelessWidget {
  const _AttachmentOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width / 2 - 24,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.greenSoft,
          child: Icon(icon, color: AppColors.greenDark),
        ),
        title: Text(
          label,
          style: GoogleFonts.inter(fontWeight: FontWeight.w700),
        ),
        onTap: () {
          Navigator.pop(context);
          onTap();
        },
      ),
    );
  }
}
