import '../../config/env.dart';

/// API endpoints matching NestJS route structure.
class ApiEndpoints {
  ApiEndpoints._();

  static Uri get health => Uri.parse('${AppEnv.apiBaseUrl}/health');
  static Uri get login => Uri.parse('${AppEnv.apiBaseUrl}/auth/login');
  static Uri get refresh => Uri.parse('${AppEnv.apiBaseUrl}/auth/refresh');
  static Uri get syncPush => Uri.parse('${AppEnv.apiBaseUrl}/sync/push');
  static Uri get syncPull => Uri.parse('${AppEnv.apiBaseUrl}/sync/pull');

  // ─── Clinic Admin & Management endpoints ───────────────────────────────────
  static Uri get clinicAdminDashboard =>
      Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/dashboard');
  static Uri get clinicAdminDepartments =>
      Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/departments');
  static Uri get clinicAdminDoctors =>
      Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/doctors');
  static Uri get clinicAdminRooms =>
      Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/rooms');
  static Uri get branches => Uri.parse('${AppEnv.apiBaseUrl}/branches');
  static Uri get users => Uri.parse('${AppEnv.apiBaseUrl}/users');

  // ─── Patients ─────────────────────────────────────────────────────────────
  static Uri patients([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/patients');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri patientById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/patients/${Uri.encodeComponent(id)}');

  // ─── Appointments ─────────────────────────────────────────────────────────
  static Uri appointments([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/appointments');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri appointmentById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/appointments/${Uri.encodeComponent(id)}');

  // ─── Queue ────────────────────────────────────────────────────────────────
  static Uri queue([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/queue');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri queueEntryById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/queue/${Uri.encodeComponent(id)}');

  // ─── Clinical: Vitals ─────────────────────────────────────────────────────
  static Uri patientVitals(String patientId, [Map<String, String>? queryParams]) {
    final base = Uri.parse(
        '${AppEnv.apiBaseUrl}/patients/${Uri.encodeComponent(patientId)}/vitals');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri get vitals => Uri.parse('${AppEnv.apiBaseUrl}/vitals');

  // ─── Clinical: Prescriptions ──────────────────────────────────────────────
  static Uri prescriptions([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/prescriptions');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri prescriptionById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/prescriptions/${Uri.encodeComponent(id)}');

  // ─── Clinical: Medications (eMAR) ─────────────────────────────────────────
  static Uri medications([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/medications');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri administerMedication(String id) => Uri.parse(
      '${AppEnv.apiBaseUrl}/medications/${Uri.encodeComponent(id)}/administer');

  // ─── Clinical: Nursing Tasks ──────────────────────────────────────────────
  static Uri nursingTasks([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/nursing-tasks');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri nursingTaskById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/nursing-tasks/${Uri.encodeComponent(id)}');

  // ─── Clinical: Lab Orders ─────────────────────────────────────────────────
  static Uri labOrders([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/lab-orders');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri labOrderById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/lab-orders/${Uri.encodeComponent(id)}');

  // ─── Clinical: Admissions ─────────────────────────────────────────────────
  static Uri admissions([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/admissions');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri admissionById(String id) =>
      Uri.parse('${AppEnv.apiBaseUrl}/admissions/${Uri.encodeComponent(id)}');

  static Uri dischargeAdmission(String id) => Uri.parse(
      '${AppEnv.apiBaseUrl}/admissions/${Uri.encodeComponent(id)}/discharge');

  // ─── Clinic Admin: Staff & Departments ────────────────────────────────────
  static Uri doctors([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/doctors');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }

  static Uri departments([Map<String, String>? queryParams]) {
    final base = Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/departments');
    return queryParams != null && queryParams.isNotEmpty
        ? base.replace(queryParameters: queryParams)
        : base;
  }
}
