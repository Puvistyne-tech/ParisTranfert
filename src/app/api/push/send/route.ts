import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      payload: PushNotificationPayload;
      userId?: string;
      all?: boolean;
    };

    // Validate VAPID configuration
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@prestigeparistransfert.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'VAPID keys not configured',
        },
        { status: 500 }
      );
    }

    // Configure web-push
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*');

    if (body.userId) {
      query = query.eq('user_id', body.userId);
    } else if (!body.all) {
      // Default: send to all subscriptions
      query = query.select('*');
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        sent: 0,
      });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: body.payload.title,
      body: body.payload.body,
      icon: body.payload.icon || '/web-app-manifest-192x192.png',
      badge: body.payload.badge || '/web-app-manifest-192x192.png',
      tag: body.payload.tag || 'notification',
      data: {
        url: body.payload.url || '/',
        ...body.payload.data,
      },
    });

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          // If subscription is invalid, remove it
          if (
            error instanceof Error &&
            (error.message.includes('410') || error.message.includes('Gone'))
          ) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }
          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('[Push] Error sending notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

