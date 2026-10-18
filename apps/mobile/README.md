# MCMS Mobile Application

Flutter mobile client for the Clinic Management System (MCMS).

## Architecture Rules & Compatibility

1. **No direct TypeScript imports**: Flutter does not and must not import TypeScript workspace packages.
2. **OpenAPI as the Single Source of Truth**: All API endpoints, request/response models, and sync protocols are specified in `packages/contracts/openapi.yaml`.
3. **Repository / Data-Source Pattern**: Mobile uses local SQLite (`sqflite`) for all offline mutations and queries.
4. **No Direct Central DB Access**: Mobile clients must never connect directly to the central PostgreSQL database. All synchronization goes through the NestJS REST API (`/api/v1/sync/*`).

## Flutter Commands

### Dependency Management
```bash
flutter pub get
```

### Static Analysis
```bash
flutter analyze
```

### Code Formatting
```bash
# Check format
dart format --output=none --set-exit-if-changed .

# Auto-format
dart format .
```

### Running Tests
```bash
flutter test
```

### Running Locally
```bash
# Android Emulator (ensure API_BASE_URL points to 10.0.2.2:3001)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api/v1

# iOS Simulator / macOS / Chrome
flutter run -d chrome
```

### Building Platform Artifacts
```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS (requires macOS)
flutter build ipa --release
```
