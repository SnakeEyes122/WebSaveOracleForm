import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

export const loginUser = async (username: string, passwordString: string) => {
  // Fetch user from Supabase (including role)
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      password_hash,
      full_name,
      is_active,
      roles:role_id (name)
    `)
    .eq('username', username)
    .single();

  if (error || !user) {
    throw new Error('Invalid username or password');
  }

  if (!user.is_active) {
    throw new Error('User account is deactivated');
  }

  // Compare password
  const isMatch = await bcrypt.compare(passwordString, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  // Generate Token
  // @ts-ignore - Supabase returns array or single object for joined table, in our schema role is 1:1
  const roleName = user.roles ? (Array.isArray(user.roles) ? user.roles[0].name : user.roles.name) : 'Viewer';
  
  const token = generateToken({
    id: user.id,
    username: user.username,
    role: roleName,
  });

  return { user, token };
};
