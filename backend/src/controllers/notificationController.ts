import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Get latest 50

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false); // Only update unread ones

    if (error) throw error;
    res.status(200).json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('subscriptions')
      .select('system_id')
      .eq('user_id', userId);

    if (error) throw error;
    res.status(200).json(data.map(sub => sub.system_id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { system_id } = req.body;
    if (!system_id) return res.status(400).json({ error: 'System ID is required' });

    // Check if subscription exists
    const { data: existing, error: checkError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('system_id', system_id)
      .single();

    if (existing) {
      // Unsubscribe
      await supabase.from('subscriptions').delete().eq('id', existing.id);
      res.status(200).json({ message: 'Unsubscribed', subscribed: false });
    } else {
      // Subscribe
      await supabase.from('subscriptions').insert([{ user_id: userId, system_id }]);
      res.status(200).json({ message: 'Subscribed', subscribed: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
