part of '../main.dart';

class ApiListView extends StatefulWidget {
  const ApiListView({
    super.key,
    required this.loader,
    required this.builder,
    this.reloadKey,
  });

  final Future<Map<String, dynamic>> Function() loader;
  final Widget Function(Map<String, dynamic> data) builder;
  final Object? reloadKey;

  @override
  State<ApiListView> createState() => _ApiListViewState();
}

class _ApiListViewState extends State<ApiListView> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.loader();
  }

  @override
  void didUpdateWidget(covariant ApiListView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.reloadKey != widget.reloadKey) {
      _refresh();
    }
  }

  Future<void> _refresh() async {
    final future = widget.loader();
    setState(() {
      _future = future;
    });
    await future;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
            child: CircularProgressIndicator(
              color: AppColors.greenDark,
              strokeWidth: 2.5,
            ),
          );
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: AppColors.errorSurface,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.wifi_off_rounded,
                      color: AppColors.errorText,
                      size: 26,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    snapshot.error.toString(),
                    style: GoogleFonts.inter(
                      color: AppColors.muted,
                      fontSize: 13,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _refresh,
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: _refresh,
          color: AppColors.greenDark,
          child: widget.builder(snapshot.data ?? {}),
        );
      },
    );
  }
}
