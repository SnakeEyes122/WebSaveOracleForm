import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating role name from Developer to User...');
  const { data, error } = await supabase
    .from('roles')
    .update({ name: 'User' })
    .eq('name', 'Developer')
    .select();
    
  if (error) {
    console.error('Error updating role:', error);
  } else {
    console.log('Role updated successfully:', data);
  }
}

run();
