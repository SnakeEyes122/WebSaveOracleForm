import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, is_active, created_at, roles(id, name)');

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role_id, full_name } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password_hash, role_id, full_name }])
      .select('id, username, full_name, is_active')
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'User created successfully', user: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_id, full_name, is_active, password } = req.body;
    
    const updateData: any = { role_id, full_name, is_active };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, full_name, is_active')
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'User updated successfully', user: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('roles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
