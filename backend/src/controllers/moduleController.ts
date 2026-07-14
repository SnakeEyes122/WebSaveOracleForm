import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createAuditLog } from '../services/auditService';

export const getModules = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('modules')
    .select('*, projects(name)')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const { project_id, name, description } = req.body;
    const { data, error } = await supabase
      .from('modules')
      .insert([{ project_id, name, description }])
      .select()
      .single();

    if (error) throw error;
    
    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Create Module', entityType: 'Module', entityId: data.id });
    }

    res.status(201).json({ message: 'Module created', module: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { project_id, name, description } = req.body;
    
    const { data, error } = await supabase
      .from('modules')
      .update({ project_id, name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Update Module', entityType: 'Module', entityId: data.id });
    }

    res.status(200).json({ message: 'Module updated', module: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('modules').delete().eq('id', id);

    if (error) throw error;

    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Delete Module', entityType: 'Module', entityId: id as string });
    }

    res.status(200).json({ message: 'Module deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
