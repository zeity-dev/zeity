# @zeity/database

Database schemas and utilities for Zeity using Drizzle ORM.

## Overview

This package contains all database table definitions, types, and utilities for the Zeity application. It uses Drizzle ORM with PostgreSQL.

## Usage

This is an internal workspace package. It's automatically available to all apps in the monorepo.

```typescript
import { users } from '@zeity/database/user';
import { eq, useDrizzle } from '@zeity/database';
```

### Importing Tables

```typescript
// Import specific tables
import { users } from '@zeity/database/user';
import { organisations } from '@zeity/database/organisation';
import { times } from '@zeity/database/time';

// Import all from schema
import * as schema from '@zeity/database/schema';
```

## Common Patterns

### Timestamp Columns

All tables use the `timestampColumns` helper:

```typescript
import { timestampColumns } from '@zeity/database/common';

export const myTable = pgTable('my_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  // ... other fields
  ...timestampColumns(),  // Adds createdAt and updatedAt
});
```

## Development

### Adding New Tables

1. Create new file in `src/`: `src/my-table.ts`
2. Define table schema using Drizzle
3. Export types
4. Add to `src/schema.ts`
5. Generate migration

### Modifying Tables

1. Edit table definition in `src/`
2. Generate migration: `pnpm db:generate`
3. Review migration in migrations folder
4. Migrations will be applied automatically

## Schema Export

All tables are re-exported from `src/schema.ts` for convenience:

```typescript
import * as schema from '@zeity/database/schema';

// Access any table
schema.users
schema.organisations
schema.times
// etc.
```

## Schema Diagram



```mermaid
erDiagram
    user {
        uuid id PK
        text name
        text email UK
        timestamp email_verified
        text image
        timestamp created_at
        timestamp updated_at
    }

    user_account {
        uuid id PK
        uuid user_id FK
        text account_id
        text provider_id
        text scope
        timestamp created_at
        timestamp updated_at
    }

    user_credential {
        text id PK
        uuid user_id PK,FK
        text public_key
        integer counter
        boolean backed_up
        jsonb transports
    }

    auth_challenge {
        text id PK
        text challenge
        timestamp created_at
    }

    auth_otp {
        serial id PK
        text code
        timestamp expires_at
        uuid user_id FK
        timestamp created_at
    }

    organisation {
        uuid id PK
        varchar name
        text image
        jsonb quota
        timestamp created_at
        timestamp updated_at
    }

    organisation_member {
        uuid id PK
        varchar role
        uuid user_id FK
        uuid organisation_id FK
        timestamp created_at
        timestamp updated_at
    }

    organisation_team {
        uuid id PK
        varchar name
        text description
        jsonb permissions
        uuid organisation_id FK
        timestamp created_at
        timestamp updated_at
    }

    organisation_team_member {
        uuid team_id PK,FK
        uuid member_id PK,FK
        timestamp created_at
    }

    organisation_invite {
        uuid id PK
        uuid organisation_id FK
        text email
        timestamp created_at
    }

    project {
        uuid id PK
        varchar name
        text status
        text notes
        uuid organisation_id FK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }

    time {
        uuid id PK
        varchar type
        timestamp start
        integer duration
        text notes
        uuid project_id FK
        uuid organisation_id FK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }

    user ||--o{ user_account : "has"
    user ||--o{ user_credential : "has"
    user ||--o{ auth_otp : "has"
    user ||--o{ organisation_member : "belongs to"
    user ||--o{ project : "creates"
    user ||--o{ time : "tracks"

    organisation ||--o{ organisation_member : "has"
    organisation ||--o{ organisation_team : "has"
    organisation ||--o{ organisation_invite : "has"
    organisation ||--o{ project : "contains"
    organisation ||--o{ time : "contains"

    organisation_team ||--o{ organisation_team_member : "has"
    organisation_member ||--o{ organisation_team_member : "belongs to"

    project ||--o{ time : "has"
```

