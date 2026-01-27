# Zeity

Zeity is a time tracking app with a focus on UX.

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Running the Application

To start the development server, run:

```sh
pnpm dev
```

### Building the Application

To build the application for production, run:

```sh
pnpm build
```

### Linting

To lint the code, run:

```sh
pnpm lint
```

### Testing

To run the tests, run:

```sh
pnpm test
```

## Running via Docker

To run Zeity using the official Docker image, make sure you have Docker and Docker Compose installed.

The provided `docker-compose.yml` is preconfigured to use the image `ghcr.io/zeity-dev/zeity-edge:main` from Docker Hub.

To start the application, run:

```sh
docker compose up
```

To stop the running Docker containers, run:

```sh
docker compose down
```

Once the application is running, you can access it at `http://localhost:3000`.

### Environment Variables

```env
# Database Configuration
ZEITY_DATABASE_URL=
# Mailer Configuration
ZEITY_MAILER_SMTP_HOST=
ZEITY_MAILER_SMTP_PORT=
ZEITY_MAILER_SMTP_USER=
ZEITY_MAILER_SMTP_PASSWORD=
ZEITY_MAILER_FROM_EMAIL=
ZEITY_MAILER_FROM_NAME=
# S3 Configuration
ZEITY_S3_END_POINT=
ZEITY_S3_ACCESS_KEY=
ZEITY_S3_SECRET_KEY=
ZEITY_S3_BUCKET=
ZEITY_S3_REGION=
# Security
ZEITY_SESSION_PASSWORD= // 32 character long password
ZEITY_JWT_SECRET=
```

#### Optional Variables:

```env
# Google OAuth
ZEITY_OAUTH_GOOGLE_CLIENT_ID=
ZEITY_OAUTH_GOOGLE_CLIENT_SECRET=
# Apple OAuth
ZEITY_OAUTH_APPLE_CLIENT_ID=
ZEITY_OAUTH_APPLE_CLIENT_SECRET=
# Microsoft OAuth
ZEITY_OAUTH_MICROSOFT_CLIENT_ID=
ZEITY_OAUTH_MICROSOFT_CLIENT_SECRET=
```
