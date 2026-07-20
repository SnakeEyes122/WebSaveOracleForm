-- ==============================================================================
-- Notification & Subscription System Schema
-- ==============================================================================

-- 1. Create Subscriptions Table
-- Links a user to a specific System
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, system_id) -- A user can only subscribe to a system once
);

-- 2. Create Notifications Table
-- Stores individual alerts for users
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g. 'SystemUpdate', 'SecurityAlert'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_system_id ON subscriptions(system_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Grant Permissions (if using Row Level Security, adjust accordingly)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
