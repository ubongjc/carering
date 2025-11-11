# CareRing iOS

Native iOS application for CareRing, built with SwiftUI and modern iOS technologies.

## Tech Stack

- **Framework**: SwiftUI
- **Language**: Swift 5.9+
- **Architecture**: MVVM
- **Networking**: URLSession with async/await
- **Authentication**: AuthenticationServices (Passkeys/WebAuthn)
- **Encryption**: CryptoKit (AES-GCM)
- **Device Integration**: HealthKit, AVFoundation, Vision

## Requirements

- iOS 17.0+
- Xcode 15.0+
- macOS 13.0+ (for development)

## Getting Started

### Installation

1. Open the project in Xcode:

```bash
cd carering_ios
open CareRing.xcodeproj
```

2. Configure the app:

- Update the bundle identifier in the project settings
- Configure code signing with your Apple Developer account
- Update `Configuration.swift` with your API endpoints

3. Build and run:

- Select your target device or simulator
- Press `Cmd + R` to build and run

## Project Structure

```
CareRing/
├── App/                           # App entry point
│   ├── CareRingApp.swift         # Main app file
│   └── ContentView.swift         # Root view
├── Features/                      # Feature modules
│   ├── Authentication/           # Auth flows
│   │   ├── AuthenticationManager.swift
│   │   └── SignInView.swift
│   ├── Circles/                  # Circle management
│   │   ├── CircleListView.swift
│   │   ├── CircleDetailView.swift
│   │   └── CreateCircleView.swift
│   ├── Vitals/                   # Vital tracking
│   ├── Tasks/                    # Task management
│   └── Settings/                 # App settings
├── Networking/                    # Network layer
│   ├── NetworkManager.swift      # Core networking
│   ├── APIEndpoint.swift         # API endpoints
│   └── CircleService.swift       # API services
├── Crypto/                        # Encryption
│   └── EncryptionManager.swift   # AES-GCM encryption
├── Models/                        # Data models
│   ├── Circle.swift
│   ├── CarePlan.swift
│   ├── User.swift
│   └── VitalReading.swift
└── Utilities/                     # Helpers
    └── Configuration.swift        # App configuration
```

## Key Features

### Authentication

- Passkey/WebAuthn-first authentication
- Biometric authentication (Face ID/Touch ID)
- Secure token storage in Keychain

### Circle Management

- Create and manage care circles
- View circle members and roles
- Manage care plans
- Real-time updates

### Client-Side Encryption

- AES-GCM encryption for sensitive data
- PBKDF2 key derivation
- Secure file encryption before upload
- CryptoKit integration

### Networking

- Type-safe API client
- Automatic retry logic
- Error handling
- Codable-based JSON serialization

## Architecture

### MVVM Pattern

The app follows the Model-View-ViewModel (MVVM) architecture:

- **Models**: Data structures (`Circle`, `User`, etc.)
- **Views**: SwiftUI views (`CircleListView`, etc.)
- **ViewModels**: Business logic (`CircleListViewModel`, etc.)

### Managers

Singleton managers handle cross-cutting concerns:

- `AuthenticationManager`: User authentication and session
- `NetworkManager`: API communication
- `EncryptionManager`: Data encryption

### Services

Service classes handle specific API operations:

- `CircleService`: Circle-related API calls
- Future: `VitalService`, `TaskService`, etc.

## Security

### Data Protection

- Client-side encryption for sensitive files
- Secure Keychain storage for tokens
- Certificate pinning (production)
- Jailbreak detection (production)

### Privacy

- HealthKit data stays on device by default
- User consent for data sharing
- Transparent data handling

## Development

### Building for Development

```bash
# Build
xcodebuild -project CareRing.xcodeproj -scheme CareRing -configuration Debug

# Run tests
xcodebuild test -project CareRing.xcodeproj -scheme CareRing -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Code Style

- Follow Swift API Design Guidelines
- Use SwiftLint for code linting
- Document public APIs with doc comments

### Testing

- Unit tests for ViewModels and Services
- UI tests for critical user flows
- Snapshot tests for complex views

## Configuration

### Development vs Production

The app uses different configurations for development and production:

**Development**:
- API: `http://localhost:3000`
- Debug logging enabled
- Development sign-in available

**Production**:
- API: `https://api.carering.app`
- Debug logging disabled
- Production authentication only

Edit `Configuration.swift` to update settings.

## Deployment

### TestFlight

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for TestFlight review
4. Distribute to testers

### App Store

1. Complete App Store metadata
2. Submit for App Store review
3. Follow Apple's review guidelines
4. Publish to App Store

## HealthKit Integration

The app integrates with HealthKit to:

- Read vital signs (heart rate, blood pressure, etc.)
- Write activity data
- Sync with Apple Health

Enable HealthKit capability in Xcode and configure `Info.plist` with usage descriptions.

## Known Issues

- Passkey authentication requires backend implementation
- Some features are marked "Coming Soon"
- HealthKit integration pending

## Roadmap

- [ ] Complete passkey authentication
- [ ] Implement HealthKit integration
- [ ] Add medication reminders
- [ ] Implement push notifications
- [ ] Add offline support
- [ ] Implement WebSocket for real-time updates

## License

Proprietary - All rights reserved

## Support

For support, email support@carering.app
