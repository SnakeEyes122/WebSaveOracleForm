import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createAuditLog } from '../services/auditService';

export const getProjects = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    
    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Create Project', entityType: 'Project', entityId: data.id });
    }

    res.status(201).json({ message: 'Project created', project: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Update Project', entityType: 'Project', entityId: data.id });
    }

    res.status(200).json({ message: 'Project updated', project: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;

    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'Delete Project', entityType: 'Project', entityId: id as string });
    }

    res.status(200).json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
