part of '../../../main.dart';

class MobileSearchDelegate extends SearchDelegate<void> {
  MobileSearchDelegate({required this.api});
  final ApiClient api;

  @override
  ThemeData appBarTheme(BuildContext context) {
    return Theme.of(context).copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.text,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        hintStyle: GoogleFonts.inter(color: AppColors.mutedLight),
        border: InputBorder.none,
      ),
    );
  }

  @override
  List<Widget>? buildActions(BuildContext context) => [
    if (query.isNotEmpty)
      IconButton(
        tooltip: 'Clear',
        icon: const Icon(Icons.close_rounded),
        onPressed: () => query = '',
      ),
  ];

  @override
  Widget? buildLeading(BuildContext context) => IconButton(
    tooltip: 'Back',
    icon: const Icon(Icons.arrow_back_rounded),
    onPressed: () => close(context, null),
  );

  @override
  Widget buildResults(BuildContext context) =>
      _SearchResults(api: api, query: query);

  @override
  Widget buildSuggestions(BuildContext context) =>
      _SearchResults(api: api, query: query);
}

class _SearchResults extends StatelessWidget {
  const _SearchResults({required this.api, required this.query});
  final ApiClient api;
  final String query;

  @override
  Widget build(BuildContext context) {
    final search = query.trim();
    if (search.length < 2) {
      return const EmptyState(
        message: 'Type at least 2 characters to search.',
        icon: Icons.search_rounded,
      );
    }
    return ApiListView(
      reloadKey: '${api.accountId}:$search',
      loader: () => api.getJson(
        '/api/mobile/contacts?search=${Uri.encodeQueryComponent(search)}&limit=20',
      ),
      builder: (data) {
        final items = List<Map<String, dynamic>>.from(
          (data['items'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
        if (items.isEmpty) {
          return const EmptyState(
            message: 'No matching contacts found.',
            icon: Icons.people_outline_rounded,
          );
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: items
              .map(
                (item) => ContactTile(
                  api: api,
                  item: item,
                  name: item['name']?.toString() ?? 'Contact',
                  phone: item['phone']?.toString() ?? '',
                  tag:
                      item['source']?.toString() ??
                      item['status']?.toString() ??
                      'contact',
                ),
              )
              .toList(),
        );
      },
    );
  }
}
