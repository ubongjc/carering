# CareRing

Shared command center for home care: medications, meals, vitals, tasks, AI triage, rotating schedules, respite matching.

## Overview

CareRing is a comprehensive care coordination platform designed to help families and caregivers manage home care more effectively. The platform includes:

- **Care Circles**: Organize family members and caregivers
- **Medication Management**: Track medications and adherence
- **Vital Signs**: Monitor health metrics
- **Task Coordination**: Assign and track care tasks
- **Schedule Management**: Coordinate care shifts and respite
- **AI Triage**: Smart health insights (planned)
- **Respite Matching**: Connect with relief caregivers (planned)

## Architecture

This repository contains both web and iOS applications:

### Web Application (`carering_web/`)

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma
- **Authentication**: Clerk (Passkeys/WebAuthn)
- **Storage**: Cloudflare R2
- **Deployment**: Vercel/self-hosted

See [carering_web/README.md](./carering_web/README.md) for details.

### iOS Application (`carering_ios/`)

- **Framework**: SwiftUI
- **Platform**: iOS 17+
- **Authentication**: AuthenticationServices
- **Encryption**: CryptoKit
- **Deployment**: App Store

See [carering_ios/README.md](./carering_ios/README.md) for details.

## Getting Started

### Web Application

```bash
cd carering_web
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### iOS Application

```bash
cd carering_ios
open CareRing.xcodeproj
# Build and run in Xcode
```

## Key Features

### Multi-Platform

- Web application for desktop and mobile browsers
- Native iOS app with offline capabilities
- Shared API backend

### Security & Privacy

- Client-side encryption for sensitive data
- Passkey/WebAuthn authentication
- HIPAA/PHIPA-ready architecture
- Audit trails for compliance

### Care Coordination

- Role-based access control (Owner, Admin, Caregiver, Family, Viewer)
- Real-time updates and notifications
- Medication schedules with safety checks
- Device integrations (BP monitors, glucose meters via HealthKit)

### Monetization

- Family plans
- Agency dashboards
- Premium features (AI triage, respite matching)

## Technology Stack

### Backend

- Next.js 15 API Routes
- PostgreSQL 16 + Prisma 5
- OpenAPI documentation
- Sentry error tracking

### Frontend Web

- React 18 + TypeScript 5
- Tailwind CSS + shadcn/ui
- Next.js App Router
- WebSockets/SSE for realtime

### Frontend iOS

- SwiftUI + Combine
- async/await networking
- HealthKit integration
- CryptoKit encryption

### Infrastructure

- Cloudflare R2 for file storage
- Stripe for payments
- Clerk for authentication
- OpenTelemetry for observability

## Project Status

This is an initial scaffold of the CareRing platform. Current implementation includes:

✅ **Completed**:
- Project structure for web and iOS
- Database schema with core models
- Authentication setup (Clerk + Passkeys)
- Circle management API
- iOS networking layer
- Client-side encryption
- Basic UI flows

🚧 **In Progress**:
- Care plan management
- Medication tracking
- Vital signs monitoring
- Task management

📋 **Planned**:
- AI triage system
- Respite matching
- WebRTC video calls
- Advanced analytics
- Agency features

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- Xcode 15+ (for iOS development)
- Clerk account
- Stripe account (for payments)

### Running Locally

1. **Set up the database**:
   ```bash
   # Create PostgreSQL database
   createdb carering
   ```

2. **Start the web app**:
   ```bash
   cd carering_web
   npm install
   cp .env.example .env
   # Configure .env
   npx prisma db push
   npm run dev
   ```

3. **Open the iOS app**:
   ```bash
   cd carering_ios
   open CareRing.xcodeproj
   ```

## Contributing

This is a proprietary project. Contribution guidelines will be provided to team members.

## License

Proprietary - All rights reserved

## Support

For questions or support, contact: support@carering.app

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed feature roadmap (coming soon).
