import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function check() {
  // Insert a Project
  const { data: project, error: pError } = await supabase
    .from('projects')
    .insert([{ name: 'ERP System', description: 'Main ERP Platform' }])
    .select()
    .single();
    
  if (pError) console.error("Project error:", pError);

  if (project) {
    // Insert a Module
    const { data: module, error: mError } = await supabase
      .from('modules')
      .insert([{ project_id: project.id, name: 'HR Module', description: 'Human Resources' }])
      .select();
      
    if (mError) console.error("Module error:", mError);
    console.log("Seeded project and module.");
  }
}
check();
