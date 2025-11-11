/**
 * Email Service for Admin Operations
 * Integrates with the existing Supabase Edge Function for sending emails
 */

import type { Reservation } from "@/components/models/reservations";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Supabase Edge Function
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-reservation-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ""),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send quote email to customer
 */
export async function sendQuoteEmail(
  reservation: Reservation,
  clientEmail: string,
  quotePrice?: number,
): Promise<void> {
  const price = quotePrice || reservation.totalPrice;
  const subject = `Your Quote from Paris Transfer - Reservation ${reservation.id.slice(0, 8)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .quote-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .price { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quote is Ready!</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Thank you for your interest in our services. We have prepared a personalized quote for your transfer request.</p>
          
          <div class="quote-box">
            <h3>Reservation Details</h3>
            <p><strong>Date:</strong> ${reservation.date}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Pickup:</strong> ${reservation.pickupLocation}</p>
            ${reservation.destinationLocation ? `<p><strong>Destination:</strong> ${reservation.destinationLocation}</p>` : ""}
            <p><strong>Passengers:</strong> ${reservation.passengers}</p>
            
            <div class="price">€${price.toFixed(2)}</div>
          </div>
          
          <p>If you would like to proceed with this reservation, please reply to this email or contact us directly.</p>
          
          <a href="#" class="button">Accept Quote</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: clientEmail,
    subject,
    html,
  });
}

/**
 * Send status update email to customer
 */
export async function sendStatusUpdateEmail(
  reservation: Reservation,
  clientEmail: string,
  status: string,
  message?: string,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    confirmed: "Your reservation has been confirmed!",
    cancelled: "Your reservation has been cancelled.",
    completed:
      "Your reservation has been completed. Thank you for choosing us!",
    quote_sent: "A quote has been sent for your reservation.",
    quote_accepted:
      "Your quote has been accepted and your reservation is now confirmed!",
  };

  const subject = `Reservation Update - ${reservation.id.slice(0, 8)}`;
  const statusMessage =
    message ||
    statusMessages[status] ||
    "Your reservation status has been updated.";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reservation Update</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <div class="status-box">
            <h3>${statusMessage}</h3>
            <p><strong>Reservation ID:</strong> ${reservation.id.slice(0, 8)}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: clientEmail,
    subject,
    html,
  });
}

/**
 * Send admin reply email to customer
 */
export async function sendAdminReplyEmail(
  reservation: Reservation,
  clientEmail: string,
  adminMessage: string,
): Promise<void> {
  const subject = `Reply to your reservation - ${reservation.id.slice(0, 8)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Message from Paris Transfer</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <div class="message-box">
            <p>${adminMessage.replace(/\n/g, "<br>")}</p>
          </div>
          <p>Best regards,<br>Paris Transfer Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: clientEmail,
    subject,
    html,
  });
}
