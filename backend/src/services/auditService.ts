import { supabase } from '../config/supabase';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export const createAuditLog = async (entry: AuditLogEntry) => {
  try {
    await supabase.from('audit_logs').insert([
      {
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details,
        ip_address: entry.ipAddress,
      }
    ]);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
