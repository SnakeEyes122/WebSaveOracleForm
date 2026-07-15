import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const action = typeof req.query.action === 'string' ? req.query.action.trim() : '';
    const from = typeof req.query.from === 'string' ? req.query.from : '';
    const to = typeof req.query.to === 'string' ? req.query.to : '';
    let query = supabase.from('audit_logs').select('*, users(full_name, username)', { count: 'exact' }).order('created_at', { ascending: false });
    if (action) query = query.eq('action', action);
    if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`);
    if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`);
    if (search) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
    const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    res.status(200).json({ data: data || [], total: count || 0, page, limit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
