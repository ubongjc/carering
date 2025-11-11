# CareRing Web

CareRing is a shared command center for home care, providing medication management, meal planning, vital tracking, task coordination, AI triage, rotating schedules, and respite matching.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 16 + Prisma 5
- **Authentication**: Clerk (Passkeys/WebAuthn-first)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Error Tracking**: Sentry
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16
- Clerk account (for authentication)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: Clerk API keys
- `STRIPE_SECRET_KEY`: Stripe secret key
- `R2_*`: Cloudflare R2 credentials
- `SENTRY_DSN`: Sentry error tracking DSN

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
carering_web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── health/       # Health check endpoint
│   │   └── circle/       # Circle management API
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Authentication helpers
│   ├── api-response.ts   # API response utilities
│   └── validations.ts    # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── components/           # React components
```

## Key Features

### Authentication

- Passkey/WebAuthn-first authentication via Clerk
- Magic link fallback
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/circle` - List user's circles
- `POST /api/circle` - Create new circle
- `GET /api/circle/[id]` - Get circle details
- `PATCH /api/circle/[id]` - Update circle
- `DELETE /api/circle/[id]` - Delete circle

### Data Models

- **Circle**: Care circles with members
- **CarePlan**: Care plans with goals and tasks
- **Medication**: Medication schedules with logging
- **VitalReading**: Vital signs tracking
- **Task**: Task management
- **User**: User profiles
- **AuditLog**: Audit trail for compliance

### Security Features

- Client-side encryption for sensitive data
- HIPAA/PHIPA-ready architecture
- Audit trails for all actions
- Emergency access with consent
- Secure file storage with object lock

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Type Generation

```bash
# Generate Prisma Client types
npx prisma generate
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

Proprietary - All rights reserved

## Support

For support, email support@carering.app
