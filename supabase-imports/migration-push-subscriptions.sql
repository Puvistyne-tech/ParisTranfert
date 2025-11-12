-- Migration: Create push_subscriptions table for PWA push notifications

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON push_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
    ON push_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
    ON push_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
    ON push_subscriptions
    FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all subscriptions (for sending notifications)
-- Note: This assumes you have an admin check function. Adjust based on your auth setup.
-- For now, we'll allow service role to access all subscriptions via API

-- Add comment
COMMENT ON TABLE push_subscriptions IS 'Stores push notification subscriptions for PWA web push notifications';

