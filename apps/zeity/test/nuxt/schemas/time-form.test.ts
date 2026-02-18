import { describe, expect, it } from 'vitest';
import { parseAbsolute } from '@internationalized/date';
import { timeSchema } from '../../../app/schemas/time-form';

describe('time form schema', () => {
  it('should parse time with default values', () => {
    const result = timeSchema.parse({
      start: parseAbsolute('2024-01-01T12:00:00Z', 'UTC'),
      end: parseAbsolute('2024-01-01T13:00:00Z', 'UTC'),
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('type', 'manual');
    expect(result).toHaveProperty('notes', '');
    expect(result).not.toHaveProperty('projectId');
  });

  it('should parse time with all values provided', () => {
    const result = timeSchema.parse({
      id: 'custom-id',
      start: parseAbsolute('2024-01-01T12:00:00Z', 'UTC'),
      end: parseAbsolute('2024-01-01T13:00:00Z', 'UTC'),
      notes: 'Meeting with team',
      projectId: 'project-123',
    });

    expect(result).toEqual({
      id: 'custom-id',
      type: 'manual',
      start: parseAbsolute('2024-01-01T12:00:00Z', 'UTC'),
      end: parseAbsolute('2024-01-01T13:00:00Z', 'UTC'),
      notes: 'Meeting with team',
      projectId: 'project-123',
    });
  });
});
