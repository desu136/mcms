import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'endpoints.dart';
import '../models/sync_operation.dart';
import '../auth/auth_provider.dart';

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

  // ─── Health & Sync ─────────────────────────────────────────────────────────

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

  // ─── Patients ───────────────────────────────────────────────────────────────

  /// Fetch patients list with optional search and pagination
  Future<Map<String, dynamic>> getPatients({
    String? search,
    int? page,
    int? limit,
  }) async {
    final q = <String, String>{};
    if (search != null && search.isNotEmpty) q['search'] = search;
    if (page != null) q['page'] = page.toString();
    if (limit != null) q['limit'] = limit.toString();

    final response = await _client.get(
      ApiEndpoints.patients(q),
      headers: _buildHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to fetch patients: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> getPatientById(String id) async {
    final response = await _client.get(
      ApiEndpoints.patientById(id),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to fetch patient $id: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createPatient(Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.patients(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create patient: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> updatePatient(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.patientById(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update patient: ${response.statusCode}');
  }

  // ─── Appointments ──────────────────────────────────────────────────────────

  Future<List<dynamic>> getAppointments({
    String? date,
    String? doctorId,
    String? patientId,
  }) async {
    final q = <String, String>{};
    if (date != null) q['date'] = date;
    if (doctorId != null) q['doctorId'] = doctorId;
    if (patientId != null) q['patientId'] = patientId;

    final response = await _client.get(
      ApiEndpoints.appointments(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch appointments: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createAppointment(
      Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.appointments(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create appointment: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> updateAppointment(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.appointmentById(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update appointment: ${response.statusCode}');
  }

  // ─── Queue ─────────────────────────────────────────────────────────────────

  Future<List<dynamic>> getQueue({
    String? status,
    String? doctorId,
    String? departmentId,
  }) async {
    final q = <String, String>{};
    if (status != null) q['status'] = status;
    if (doctorId != null) q['doctorId'] = doctorId;
    if (departmentId != null) q['departmentId'] = departmentId;

    final response = await _client.get(
      ApiEndpoints.queue(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch queue: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> addToQueue(Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.queue(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to add to queue: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> updateQueueEntry(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.queueEntryById(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update queue entry: ${response.statusCode}');
  }

  // ─── Vitals ────────────────────────────────────────────────────────────────

  Future<List<dynamic>> getPatientVitals(String patientId,
      {int limit = 20}) async {
    final response = await _client.get(
      ApiEndpoints.patientVitals(patientId, {'limit': limit.toString()}),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch vitals: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> recordVitals(Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.vitals,
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to record vitals: ${response.statusCode}');
  }

  // ─── Prescriptions ─────────────────────────────────────────────────────────

  Future<List<dynamic>> getPrescriptions({
    String? patientId,
    String? status,
  }) async {
    final q = <String, String>{};
    if (patientId != null) q['patientId'] = patientId;
    if (status != null) q['status'] = status;

    final response = await _client.get(
      ApiEndpoints.prescriptions(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch prescriptions: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createPrescription(
      Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.prescriptions(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create prescription: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> updatePrescription(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.prescriptionById(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update prescription: ${response.statusCode}');
  }

  // ─── Medications / eMAR ────────────────────────────────────────────────────

  Future<List<dynamic>> getMedications({
    String? patientId,
    String? admissionId,
    String? status,
  }) async {
    final q = <String, String>{};
    if (patientId != null) q['patientId'] = patientId;
    if (admissionId != null) q['admissionId'] = admissionId;
    if (status != null) q['status'] = status;

    final response = await _client.get(
      ApiEndpoints.medications(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch medications: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> administerMedication(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.administerMedication(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to administer medication: ${response.statusCode}');
  }

  // ─── Nursing Tasks ─────────────────────────────────────────────────────────

  Future<List<dynamic>> getNursingTasks({
    String? status,
    String? assignedToId,
    String? patientId,
  }) async {
    final q = <String, String>{};
    if (status != null) q['status'] = status;
    if (assignedToId != null) q['assignedToId'] = assignedToId;
    if (patientId != null) q['patientId'] = patientId;

    final response = await _client.get(
      ApiEndpoints.nursingTasks(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch nursing tasks: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createNursingTask(
      Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.nursingTasks(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create nursing task: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> updateNursingTask(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.nursingTaskById(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update nursing task: ${response.statusCode}');
  }

  // ─── Lab Orders ────────────────────────────────────────────────────────────

  Future<List<dynamic>> getLabOrders({
    String? patientId,
    String? status,
  }) async {
    final q = <String, String>{};
    if (patientId != null) q['patientId'] = patientId;
    if (status != null) q['status'] = status;

    final response = await _client.get(
      ApiEndpoints.labOrders(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch lab orders: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createLabOrder(Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.labOrders(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create lab order: ${response.statusCode}');
  }

  // ─── Admissions ────────────────────────────────────────────────────────────

  Future<List<dynamic>> getAdmissions({
    String? patientId,
    String? status,
  }) async {
    final q = <String, String>{};
    if (patientId != null) q['patientId'] = patientId;
    if (status != null) q['status'] = status;

    final response = await _client.get(
      ApiEndpoints.admissions(q),
      headers: _buildHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to fetch admissions: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> createAdmission(
      Map<String, dynamic> data) async {
    final response = await _client.post(
      ApiEndpoints.admissions(),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create admission: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> dischargeAdmission(
      String id, Map<String, dynamic> data) async {
    final response = await _client.patch(
      ApiEndpoints.dischargeAdmission(id),
      headers: _buildHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to discharge admission: ${response.statusCode}');
  }
}

// ─── Riverpod Provider ───────────────────────────────────────────────────────

final apiClientProvider = Provider<MobileApiClient>((ref) {
  final authService = ref.watch(authServiceProvider);
  final client = MobileApiClient();
  if (authService.accessToken != null) {
    client.setAuthToken(authService.accessToken!);
  }
  return client;
});
