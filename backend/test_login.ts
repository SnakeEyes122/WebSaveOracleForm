import { supabase } from './src/config/supabase';
import bcrypt from 'bcrypt';

async function test() {
  console.log('Testing Supabase Connection...');
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
    .eq('username', 'admin')
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    
    // Fallback test
    console.log('Testing alternative query without roles:role_id...');
    const res2 = await supabase.from('users').select('*').eq('username', 'admin').single();
    console.log('Result 2:', res2.error || res2.data);
    return;
  }
  console.log('User found:', user);
  const isMatch = await bcrypt.compare('password123', user.password_hash);
  console.log('Password match:', isMatch);
}

test();
