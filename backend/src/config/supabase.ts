import { createClient } from '@supabase/supabase-js';
import { config } from './env';

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn('Missing Supabase URL or Key. Please check your .env file.');
}

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseKey || 'placeholder-key'
);
