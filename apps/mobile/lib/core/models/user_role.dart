/// Shared User Roles matching OpenAPI / packages/domain definitions.
enum UserRole {
  superAdmin('SUPER_ADMIN'),
  clinicAdmin('CLINIC_ADMIN'),
  doctor('DOCTOR'),
  nurse('NURSE'),
  receptionist('RECEPTIONIST'),
  patient('PATIENT');

  final String value;
  const UserRole(this.value);

  static UserRole fromString(String role) {
    return UserRole.values.firstWhere(
      (r) => r.value == role,
      orElse: () => UserRole.patient,
    );
  }
}
