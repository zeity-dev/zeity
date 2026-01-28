# Zeity

<div align="center">
   <img src="https://raw.githubusercontent.com/zeity-dev/zeity/main/apps/zeity/public/icons/logo-192.png" alt="Zeity Logo" width="200" />
  <h3>Modern Time Tracking Application</h3>
  <p>A full-featured time tracking app with excellent user experience</p>
</div>

## 📋 Overview

Zeity is a modern, full-stack time tracking application built with Nuxt 4 and focused on delivering an exceptional user experience. It provides comprehensive time tracking, project management, organization management, and team collaboration features.

### Key Features

- ⏱️ **Time Tracking**: Manual and automatic time tracking with project association
- 🏢 **Organization Management**: Multi-organization support with role-based access control
- 👥 **Team Collaboration**: Team management and member invitations
- 📊 **Project Management**: Create and manage projects with status tracking
- 📤 **Data Export**: Export time entries to CSV and XLSX formats
- 🔐 **Authentication**: Passkeys and OAuth
- 🌐 **i18n Support**: Multi-language support
- 📱 **PWA Ready**: Progressive Web App with offline capabilities
- 🎨 **Modern UI**: Built with Nuxt UI for a polished user experience

## 🏗️ Architecture

Zeity is a monorepo built with the following structure:

- **apps/zeity**: Main application (Nuxt 4)
- **apps/docs**: Documentation site
- **libs/database**: Drizzle ORM schema and database utilities
- **libs/types**: Shared TypeScript type definitions
- **libs/utils**: Shared utility functions

### Tech Stack

- **Framework**: Nuxt 4 (Vue 3, TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: nuxt-auth-utils
- **UI**: Nuxt UI (Tailwind CSS)
- **State Management**: Pinia
- **i18n**: @nuxtjs/i18n
- **Security**: nuxt-security
- **PWA**: @vite-pwa/nuxt
- **Testing**: Vitest
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 24+ 
- pnpm
- PostgreSQL 16+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/zeity-dev/zeity.git
   cd zeity
   ```

2. **Install dependencies**:
   ```sh
   pnpm install
   ```

3. **Configure environment variables**:
   Copy the example environment file and configure it:
   ```sh
   cp apps/zeity/.env.example apps/zeity/.env
   ```
   See [Environment Variables](#environment-variables) section below.

4. **Run database migrations**:
   ```sh
   pnpm --filter ./apps/zeity run db:migrate
   ```

### Running the Application

**Development mode**:
```sh
pnpm dev                # Start all apps
pnpm start:zeity        # Start only the main app
pnpm start:docs         # Start only the docs
```

**Production build**:
```sh
pnpm build
```

### Development Scripts

```sh
pnpm lint               # Lint all projects
pnpm test               # Run tests
```

## 🐳 Running via Docker

Zeity can be run using the official Docker image.

### Using Docker Compose

The provided `docker-compose.yml` is preconfigured to use the image `ghcr.io/zeity-dev/zeity-edge:main`.

**Start the application**:
```sh
docker compose up -d
```

**Stop the application**:
```sh
docker compose down
```

**View logs**:
```sh
docker compose logs -f
```

Once the application is running, access it at `http://localhost:3000`.

### Building Custom Docker Image

```sh
cd apps/zeity
docker build -t zeity:custom .
```

## ⚙️ Environment Variables

### Required Variables

```env
# Database Configuration
ZEITY_DATABASE_URL=postgresql://user:password@localhost:5432/zeity

# Security (IMPORTANT: Use strong, random values in production)
ZEITY_SESSION_PASSWORD=<32-character-random-string>
ZEITY_JWT_SECRET=<random-secret-string>

# Mailer Configuration
ZEITY_MAILER_SMTP_HOST=smtp.example.com
ZEITY_MAILER_SMTP_PORT=587
ZEITY_MAILER_SMTP_USER=your-email@example.com
ZEITY_MAILER_SMTP_PASSWORD=your-smtp-password
ZEITY_MAILER_FROM_EMAIL=noreply@example.com
ZEITY_MAILER_FROM_NAME=Zeity

# S3 Configuration (for file uploads)
ZEITY_S3_END_POINT=https://your-s3-endpoint.com
ZEITY_S3_ACCESS_KEY=your-access-key
ZEITY_S3_SECRET_KEY=your-secret-key
ZEITY_S3_BUCKET=zeity-uploads
ZEITY_S3_REGION=auto
```

### Optional OAuth Variables

```env
# Google OAuth
ZEITY_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
ZEITY_OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
ZEITY_OAUTH_APPLE_CLIENT_ID=your-apple-client-id
ZEITY_OAUTH_APPLE_CLIENT_SECRET=your-apple-client-secret

# Microsoft OAuth
ZEITY_OAUTH_MICROSOFT_CLIENT_ID=your-microsoft-client-id
ZEITY_OAUTH_MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### Application Configuration

```env
# Feature Flags
ZEITY_ALLOW_ORGANISATION_CREATE=true  # Allow users to create organizations
```

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nuxt 4](https://nuxt.com/)
- UI components from [Nuxt UI](https://ui.nuxt.com/)
- Database management with [Drizzle ORM](https://orm.drizzle.team/)
