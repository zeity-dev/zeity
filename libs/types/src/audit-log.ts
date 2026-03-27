export const AUDIT_ACTION_CREATE = 'create' as const;
export const AUDIT_ACTION_UPDATE = 'update' as const;
export const AUDIT_ACTION_DELETE = 'delete' as const;

export const AUDIT_ACTIONS = [AUDIT_ACTION_CREATE, AUDIT_ACTION_UPDATE, AUDIT_ACTION_DELETE];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TIME = 'time' as const;

export const AUDIT_ENTITY_TYPES = [AUDIT_ENTITY_TIME];
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
