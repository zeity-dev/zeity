# @zeity/types

Shared TypeScript type definitions for Zeity.

## Overview

This package contains all shared TypeScript types and constants used across the Zeity application. It provides type safety and consistency throughout the codebase.

## Usage

This is an internal workspace package. It's automatically available to all apps in the monorepo.

```typescript
import { TIME_TYPE_MANUAL, TIME_TYPES } from '@zeity/types/time';
import type { Time, DraftTime } from '@zeity/types/time';
import { PROJECT_STATUS_ACTIVE } from '@zeity/types/project';
import { ORGANISATION_MEMBER_ROLE_OWNER } from '@zeity/types/organisation';
```

## Adding New Types

### Creating a New Type Module

1. Create a new file in `src/`: `src/my-type.ts`

```typescript
// src/my-type.ts
export const MY_STATUS_ACTIVE = 'active';
export const MY_STATUS_INACTIVE = 'inactive';

export const MY_STATUSES = [
  MY_STATUS_ACTIVE,
  MY_STATUS_INACTIVE
] as const;

export type MyStatus = typeof MY_STATUSES[number];

export interface MyEntity {
  id: string;
  name: string;
  status: MyStatus;
}

export interface NewMyEntity {
  name: string;
  status?: MyStatus;
}
```

2. Export from `src/index.ts`:

```typescript
export * from './my-type';
```

### Type Naming Conventions

- **Interfaces**: PascalCase (e.g., `User`, `Project`, `Time`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `PROJECT_STATUS_ACTIVE`)
- **Type Aliases**: PascalCase (e.g., `ProjectStatus`, `TimeType`)
- **Prefixes**:
  - `New*`: For creation (e.g., `NewUser`, `NewProject`)
  - `Draft*`: For incomplete/in-progress (e.g., `DraftTime`)
  - `*Response`: For API responses
  - `*Request`: For API requests

## Best Practices

1. **Use const assertions** for arrays of constants:
   ```typescript
   export const STATUSES = ['active', 'inactive'] as const;
   ```

2. **Export both values and types**:
   ```typescript
   export const MY_CONSTANT = 'value';
   export type MyType = typeof MY_CONSTANT;
   ```

3. **Use discriminated unions** for complex types:
   ```typescript
   type Event = 
     | { type: 'click'; x: number; y: number }
     | { type: 'keypress'; key: string };
   ```

4. **Keep types DRY** - reuse base types:
   ```typescript
   interface BaseEntity {
     id: string;
     createdAt: Date;
     updatedAt: Date;
   }
   
   interface User extends BaseEntity {
     name: string;
     email: string;
   }
   ```

5. **Use utility types**:
   ```typescript
   type PartialUser = Partial<User>;
   type UserWithoutId = Omit<User, 'id'>;
   type UserEmail = Pick<User, 'email'>;
   ```

6. **Avoid Typescript Enums** - prefer union of string literals for better tree-shaking and type safety.

