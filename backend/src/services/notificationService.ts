import { supabase } from '../config/supabase';

// Helper to notify a specific user
export const notifyUser = async (userId: string, title: string, message: string, type: string) => {
  try {
    await supabase.from('notifications').insert([{
      user_id: userId,
      title,
      message,
      type
    }]);
  } catch (error) {
    console.error('Failed to send notification to user:', error);
  }
};

// Helper to notify all admins (Security Alerts)
export const notifyAdmins = async (title: string, message: string) => {
  try {
    // 1. Get Admin role id
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'Admin').single();
    if (!role) return;

    // 2. Get all admin users
    const { data: admins } = await supabase.from('users').select('id').eq('role_id', role.id);
    if (!admins || admins.length === 0) return;

    // 3. Insert notifications
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      title,
      message,
      type: 'SecurityAlert'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

// Helper to notify subscribers of a specific system
export const notifySubscribers = async (systemId: string, title: string, message: string, excludeUserId?: string) => {
  try {
    // 1. Get all users subscribed to this system
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('system_id', systemId);
      
    if (!subscribers || subscribers.length === 0) return;

    // 2. Filter out the user who triggered the event (optional)
    const targets = excludeUserId 
      ? subscribers.filter(sub => sub.user_id !== excludeUserId) 
      : subscribers;

    if (targets.length === 0) return;

    // 3. Insert notifications
    const notifications = targets.map(target => ({
      user_id: target.user_id,
      title,
      message,
      type: 'SystemUpdate'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to notify subscribers:', error);
  }
};
