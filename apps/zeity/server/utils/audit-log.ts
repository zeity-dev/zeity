import { auditLogs, type NewAuditLogRecord } from '@zeity/database/audit-log';

export function logAuditEvent({ tx, event }: { tx?: unknown; event: NewAuditLogRecord }) {
  const db = (tx ?? useDrizzle()) as ReturnType<typeof useDrizzle>;
  return db.insert(auditLogs).values(event);
}

export function logAuditEvents({ tx, events }: { tx?: unknown; events: NewAuditLogRecord[] }) {
  const db = (tx ?? useDrizzle()) as ReturnType<typeof useDrizzle>;
  return db.insert(auditLogs).values(events);
}
