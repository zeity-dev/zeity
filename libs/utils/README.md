# @zeity/utils

Shared utility functions for Zeity.

## Overview

This package contains reusable utility functions used across the Zeity application. It includes utilities for date manipulation, formatting, CSV/XLSX export, string operations, and object manipulation.

## Usage

This is an internal workspace package. It's automatically available to all apps in the monorepo.

```typescript
import { formatDuration, timeDiff } from '@zeity/utils/date';
import { pick, omit } from '@zeity/utils/object';
import { padLeft, capitalize } from '@zeity/utils/string';
```

## Modules

### Date Utilities

Utilities for date and time manipulation.

```typescript
import {
  isDate,
  parseDate,
  parseTime,
  toStartOfDay,
  timeDiff,
  dayDiff,
  calculateDiffSum,
  millisecondsToDuration,
  formatDuration,
  formatTime,
  formatDate,
  formatNumericDate,
  formatRelativeDate,
  formatRelativeDateDiff,
  sortDatesAscending,
  sortDatesDescending,
} from '@zeity/utils/date';

// Format as HH:MM:SS
formatDuration(3665000);  // "01:01:05"
formatDuration(60000);     // "00:01:00"

```
### Object Utilities

Utilities for object manipulation.

```typescript
import { pick, omit } from '@zeity/utils/object';

const user = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
  password: 'secret'
};

// Pick specific properties
const publicUser = pick(user, ['id', 'name', 'email']);
// { id: '123', name: 'John', email: 'john@example.com' }

// Omit specific properties
const safeUser = omit(user, ['password']);
// { id: '123', name: 'John', email: 'john@example.com' }
```

### String Utilities

Utilities for string manipulation.

```typescript
import { 
  padLeft,
  capitalize,
} from '@zeity/utils/string';

// Pad left with zeros
padLeft('5', 2, '0');  // "05"
padLeft('123', 5, '0');  // "00123"

// Capitalize first letter
capitalize('hello');  // "Hello"
```

## Development

### Adding New Utilities

1. Create a new file in the appropriate directory:
   - `src/date/` for date utilities
   - `src/formatter/` for formatters
   - `src/string/` for string utilities
   - `src/object/` for object utilities
   - `src/csv/` for CSV utilities
   - `src/xlsx/` for XLSX utilities

2. Export from the index file

3. Add tests in co-located `.test.ts` file

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Writing Tests

```typescript
// src/string/capitalize.test.ts
import { describe, it, expect } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
  
  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
  
  it('should not change already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});
```

## Best Practices

1. **Pure Functions**: Keep utilities pure (no side effects)
2. **Type Safety**: Use TypeScript types and generics
3. **Error Handling**: Handle edge cases gracefully
4. **Testing**: Write tests for all utilities
5. **Performance**: Consider performance for frequently used utilities

## Dependencies

- `date-fns`: Date manipulation and formatting
- Other dependencies are minimal to keep bundle size small

## Resources

- [date-fns Documentation](https://date-fns.org/)
- [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
