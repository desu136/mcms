/// Sync Operation model matching OpenAPI SyncOperation schema.
class SyncOperation {
  final String operationId;
  final String entityType;
  final String entityId;
  final String operation; // CREATE, UPDATE, DELETE
  final Map<String, dynamic>? payload;
  final String clientTimestamp;
  final int baseVersion;

  const SyncOperation({
    required this.operationId,
    required this.entityType,
    required this.entityId,
    required this.operation,
    this.payload,
    required this.clientTimestamp,
    required this.baseVersion,
  });

  Map<String, dynamic> toJson() => {
        'operationId': operationId,
        'entityType': entityType,
        'entityId': entityId,
        'operation': operation,
        'payload': payload,
        'clientTimestamp': clientTimestamp,
        'baseVersion': baseVersion,
      };

  factory SyncOperation.fromJson(Map<String, dynamic> json) => SyncOperation(
        operationId: json['operationId'] as String,
        entityType: json['entityType'] as String,
        entityId: json['entityId'] as String,
        operation: json['operation'] as String,
        payload: json['payload'] != null
            ? json['payload'] as Map<String, dynamic>
            : null,
        clientTimestamp: json['clientTimestamp'] as String,
        baseVersion: json['baseVersion'] as int,
      );
}

/// Server acknowledgement for an operation.
class SyncAcknowledgement {
  final String operationId;
  final String status; // ACCEPTED, REJECTED, CONFLICT, DUPLICATE
  final String? newCursor;
  final int? serverVersion;

  const SyncAcknowledgement({
    required this.operationId,
    required this.status,
    this.newCursor,
    this.serverVersion,
  });

  factory SyncAcknowledgement.fromJson(Map<String, dynamic> json) =>
      SyncAcknowledgement(
        operationId: json['operationId'] as String,
        status: json['status'] as String,
        newCursor: json['newCursor'] as String?,
        serverVersion: json['serverVersion'] as int?,
      );
}
