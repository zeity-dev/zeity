# Zeity - Main Application

The main Zeity time tracking application built with Nuxt 4.

## Overview

This is the core application that provides the time tracking interface and API. It includes:

## Project Structure

```
zeity/
├── app/                 # Frontend application
│   ├── components/      # Vue components
│   ├── composables/     # Composition functions
│   ├── layouts/         # Page layouts
│   ├── middleware/      # Route middleware
│   ├── pages/           # File-based routing
│   ├── plugins/         # Nuxt plugins
│   ├── schemas/         # Zod validation schemas
│   ├── stores/          # Pinia stores
│   └── utils/           # Frontend utilities
├── server/              # Backend API
│   ├── api/             # API endpoints
│   ├── database/        # Database migrations
│   ├── mail/            # Email templates
│   ├── plugins/         # Server plugins
│   ├── routes/          # Server routes
│   ├── tasks/           # Background tasks
│   └── utils/           # Server utilities
├── service-worker/      # PWA service worker
├── shared/              # Shared utilities
├── i18n/                # Translations
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL 16+

### Environment Variables

Create a `.env` file in this directory with:

```env
# Database
ZEITY_DATABASE_URL=postgresql://user:password@localhost:5432/zeity

# Security
ZEITY_SESSION_PASSWORD=your-32-character-session-password
ZEITY_JWT_SECRET=your-jwt-secret

# Email
ZEITY_MAILER_SMTP_HOST=smtp.example.com
ZEITY_MAILER_SMTP_PORT=587
ZEITY_MAILER_SMTP_USER=user@example.com
ZEITY_MAILER_SMTP_PASSWORD=password
ZEITY_MAILER_FROM_EMAIL=noreply@example.com
ZEITY_MAILER_FROM_NAME=Zeity

# S3 Storage
ZEITY_S3_END_POINT=https://s3.example.com
ZEITY_S3_ACCESS_KEY=your-access-key
ZEITY_S3_SECRET_KEY=your-secret-key
ZEITY_S3_BUCKET=zeity-uploads
ZEITY_S3_REGION=auto

# Feature Flags (Optional)
ZEITY_ALLOW_ORGANISATION_CREATE=true

# OAuth (Optional)
ZEITY_OAUTH_GOOGLE_CLIENT_ID=
ZEITY_OAUTH_GOOGLE_CLIENT_SECRET=
ZEITY_OAUTH_APPLE_CLIENT_ID=
ZEITY_OAUTH_APPLE_CLIENT_SECRET=
ZEITY_OAUTH_MICROSOFT_CLIENT_ID=
ZEITY_OAUTH_MICROSOFT_CLIENT_SECRET=
```

### Installation

From the root directory:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start:zeity
```

The application will be available at http://localhost:3000

## Development

### Available Scripts

```bash
# Development
pnpm dev                # Start development server

# Database
pnpm db:generate        # Generate migration from schema changes

# Build
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # Lint code
pnpm lint --fix         # Fix linting issues
pnpm test               # Run tests
pnpm test --watch       # Run tests in watch mode
```

### Key Technologies

- **Framework**: Nuxt 4
- **UI**: Nuxt UI (Tailwind CSS)
- **State**: Pinia
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: nuxt-auth-utils
- **i18n**: @nuxtjs/i18n
- **PWA**: @vite-pwa/nuxt
- **Validation**: Zod
- **Testing**: Vitest

See [API Documentation](../../docs/API.md) for complete reference.

## Database

### Migrations

Migrations are stored in `server/database/migrations/`.

Generate a new migration:

```bash
pnpm db:generate
```

Migrations will be applied automatically on server start.
