-- Email Triggers for Reservations
-- This file sets up database triggers that automatically call the Edge Function
-- when reservations are created or updated

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Function to call the Edge Function via HTTP
CREATE OR REPLACE FUNCTION notify_reservation_email()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  function_url TEXT;
BEGIN
  -- Get the Edge Function URL from environment or use default
  -- In production, this should be: https://<project-ref>.supabase.co/functions/v1/send-reservation-email
  -- For local development, use: http://localhost:54321/functions/v1/send-reservation-email
  function_url := current_setting('app.settings.edge_function_url', true);
  
  -- If not set, try to construct from Supabase URL
  IF function_url IS NULL OR function_url = '' THEN
    -- Try to get from Supabase project URL
    -- This will be set via: ALTER DATABASE postgres SET app.settings.edge_function_url = 'https://...';
    function_url := 'https://XYZ.supabase.co/functions/v1/send-reservation-email';
  END IF;

  -- Build payload based on trigger operation
  IF TG_OP = 'INSERT' THEN
    payload := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload := jsonb_build_object(
      'type', 'UPDATE',
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW),
      'old_record', to_jsonb(OLD)
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object(
      'type', 'DELETE',
      'table', TG_TABLE_NAME,
      'record', to_jsonb(OLD)
    );
  END IF;

  -- Call the Edge Function asynchronously using pg_net
  -- Note: This requires the pg_net extension to be enabled
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload::text
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error calling email function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on reservations table
DROP TRIGGER IF EXISTS trigger_reservation_email_insert ON reservations;
CREATE TRIGGER trigger_reservation_email_insert
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_reservation_email();

DROP TRIGGER IF EXISTS trigger_reservation_email_update ON reservations;
CREATE TRIGGER trigger_reservation_email_update
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.total_price IS DISTINCT FROM NEW.total_price)
  EXECUTE FUNCTION notify_reservation_email();
