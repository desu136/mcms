import 'dart:convert';
import 'package:http/http.dart' as http;
import 'endpoints.dart';
import '../models/sync_operation.dart';

/// Typed HTTP client for interacting with the MCMS central API.
class MobileApiClient {
  final http.Client _client;
  String? _authToken;

  MobileApiClient({http.Client? client}) : _client = client ?? http.Client();

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  /// Check API Health Status
  Future<Map<String, dynamic>> checkHealth() async {
    final response =
        await _client.get(ApiEndpoints.health, headers: _buildHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception(
        'API Health check failed with status: ${response.statusCode}');
  }

  /// Push local operations to central server
  Future<Map<String, dynamic>> pushSyncOperations({
    String? cursor,
    required List<SyncOperation> operations,
  }) async {
    final body = jsonEncode({
      'cursor': cursor,
      'operations': operations.map((o) => o.toJson()).toList(),
    });

    final response = await _client.post(
      ApiEndpoints.syncPush,
      headers: _buildHeaders(),
      body: body,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Sync push failed with status: ${response.statusCode}');
  }
}
