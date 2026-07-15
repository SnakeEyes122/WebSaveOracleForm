import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Create a new file type (Admin, Developer)
export const createFileType = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data, error } = await supabase
      .from('file_types')
      .insert([{ name: name.toLowerCase(), description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Get all file types (All roles)
export const getFileTypes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('file_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Update a file type (Admin only)
export const updateFileType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('file_types')
      .update({ name: name ? name.toLowerCase() : undefined, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a file type (Admin only)
export const deleteFileType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('file_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
