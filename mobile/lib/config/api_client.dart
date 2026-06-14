part of '../main.dart';

class ApiClient {
  ApiClient({required this.baseUrl, this.token, this.accountId});

  final String baseUrl;
  final String? token;
  final int? accountId;

  ApiClient copyWith({String? token, int? accountId}) {
    return ApiClient(
      baseUrl: baseUrl,
      token: token ?? this.token,
      accountId: accountId ?? this.accountId,
    );
  }

  Future<Map<String, dynamic>> getJson(String path) async {
    final response = await http.get(_uri(path), headers: _headers());
    return _decode(response);
  }

  Future<Map<String, dynamic>> postJson(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await http.post(
      _uri(path),
      headers: _headers(),
      body: jsonEncode(body ?? {}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> patchJson(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await http.patch(
      _uri(path),
      headers: _headers(),
      body: jsonEncode(body ?? {}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> postMultipart(
    String path, {
    required String fileField,
    required String filePath,
    required String filename,
    Map<String, String>? fields,
  }) async {
    final request = http.MultipartRequest('POST', _uri(path));
    request.headers.addAll(_headers(contentType: null));
    request.fields.addAll(fields ?? {});
    request.files.add(
      await http.MultipartFile.fromPath(
        fileField,
        filePath,
        filename: filename,
      ),
    );

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _decode(response);
  }

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, String> _headers({String? contentType = 'application/json'}) {
    final headers = <String, String>{'Accept': 'application/json'};
    final resolvedContentType = contentType;
    final resolvedToken = token;
    final resolvedAccountId = accountId;
    if (resolvedContentType != null) {
      headers['Content-Type'] = resolvedContentType;
    }
    if (resolvedToken != null) {
      headers['Authorization'] = 'Bearer $resolvedToken';
    }
    if (resolvedAccountId != null) {
      headers['X-Zyptos-Account'] = '$resolvedAccountId';
    }
    return headers;
  }

  Map<String, dynamic> _decode(http.Response response) {
    final data = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        data['message']?.toString() ?? 'Request failed',
        response.statusCode,
      );
    }

    return data;
  }
}

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);

  final String message;
  final int statusCode;

  @override
  String toString() => message;
}

Future<void> openExternalUri(BuildContext context, Uri uri) async {
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Could not open ${uri.toString()}')));
  }
}
