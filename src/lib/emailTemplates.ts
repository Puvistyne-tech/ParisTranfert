/**
 * Email Templates for Reservation Notifications
 * Beautiful, modern, professional templates for Brevo
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://prestigeparistransfert.com";
const GOOGLE_REVIEW_LINK = "https://share.google/po2hRWFXQxB9JsrsA";

/**
 * Base email template styles
 */
const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
    .header p { font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { font-weight: 600; color: #6b7280; }
    .info-value { color: #111827; text-align: right; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .price-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .price-amount { font-size: 32px; font-weight: 700; color: #0ea5e9; margin: 10px 0; }
    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; text-align: center; }
    .button-secondary { background: #6b7280; }
    .button-success { background: #10b981; }
    .button-danger { background: #ef4444; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 5px 0; }
    .highlight-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
`;

/**
 * Generate reservation detail URL
 * @param reservationId - The reservation ID
 * @param locale - The locale to use (defaults to "en" for admin emails)
 */
function getReservationUrl(reservationId: string, locale: string = "en"): string {
  return `${APP_URL}/${locale}/reservation/${reservationId}`;
}

/**
 * QUOTE_REQUESTED - Customer receives confirmation with quote request details
 */
export function generateQuoteRequestedEmail(
  reservation: any,
  customerName: string,
  locale: string = "en",
): EmailTemplate {
  const subject = `Quote Request Received - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Quote Request Received</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Thank you for your interest!</p>
            <p>We have received your quote request and will prepare a personalized quote for your transfer. Our team will review your request and send you a detailed quote shortly.</p>
          </div>

          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Service Information</div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${reservation.serviceName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehicle Type:</span>
              <span class="info-value">${reservation.vehicleTypeName || "N/A"}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button">View Reservation</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Quote Request Received - Reservation ${reservation.id}

Dear ${customerName},

Thank you for your interest! We have received your quote request and will prepare a personalized quote for your transfer. Our team will review your request and send you a detailed quote shortly.

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}

Service Information:
- Service: ${reservation.serviceName || "N/A"}
- Vehicle Type: ${reservation.vehicleTypeName || "N/A"}

View your reservation: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * QUOTE_SENT - Admin sends quote to customer
 */
export function generateQuoteSentEmail(
  reservation: any,
  customerName: string,
  quotePrice: number,
  locale: string = "en",
): EmailTemplate {
  const subject = `Your Quote is Ready - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Your Quote is Ready!</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Dear ${customerName},</p>
            <p>We have prepared a personalized quote for your transfer request. Please review the details below.</p>
          </div>

          <div class="price-box">
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Total Price</p>
              <div class="price-amount">€${quotePrice.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Service Information</div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${reservation.serviceName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehicle Type:</span>
              <span class="info-value">${reservation.vehicleTypeName || "N/A"}</span>
            </div>
          </div>
          
          <div class="highlight-box">
            <p style="font-weight: 600; margin-bottom: 10px;">Next Steps:</p>
            <p>If you would like to proceed with this reservation, please visit the link below to accept the quote. You can also contact us directly if you have any questions.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button button-success">Accept Quote & View Details</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Quote is Ready - Reservation ${reservation.id}

Dear ${customerName},

We have prepared a personalized quote for your transfer request. Please review the details below.

Total Price: €${quotePrice.toFixed(2)}

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}

Service Information:
- Service: ${reservation.serviceName || "N/A"}
- Vehicle Type: ${reservation.vehicleTypeName || "N/A"}

Next Steps:
If you would like to proceed with this reservation, please visit the link below to accept the quote. You can also contact us directly if you have any questions.

View and accept quote: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * QUOTE_ACCEPTED - Customer accepts quote
 */
export function generateQuoteAcceptedEmail(
  reservation: any,
  customerName: string,
  locale: string = "en",
): EmailTemplate {
  const subject = `Quote Accepted - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Quote Accepted!</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Thank you for accepting our quote!</p>
            <p>Your reservation is now confirmed. We are excited to provide you with our premium transfer service.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #0ea5e9;">€${reservation.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div class="info-box">
            <p style="font-weight: 600; margin-bottom: 10px;">Important Information:</p>
            <ul style="margin-left: 20px; line-height: 2;">
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Our driver will contact you 30 minutes before pickup</li>
              <li>Keep this confirmation email as proof of booking</li>
              <li>Contact us immediately if you need to make changes</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button">View Reservation Details</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Quote Accepted - Reservation ${reservation.id}

Dear ${customerName},

Thank you for accepting our quote! Your reservation is now confirmed. We are excited to provide you with our premium transfer service.

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}
- Total Price: €${reservation.totalPrice.toFixed(2)}

Important Information:
- Please arrive 10 minutes before your scheduled pickup time
- Our driver will contact you 30 minutes before pickup
- Keep this confirmation email as proof of booking
- Contact us immediately if you need to make changes

View reservation: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * PENDING - Reservation confirmation (when price > 0)
 */
export function generatePendingEmail(
  reservation: any,
  customerName: string,
  locale: string = "en",
): EmailTemplate {
  const subject = `Reservation Received - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Reservation Received</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Thank you for choosing Paris Transfer!</p>
            <p>We have received your reservation and will review it shortly. You will receive another email once it has been confirmed.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #0ea5e9;">€${reservation.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button">View Reservation Status</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reservation Received - Reservation ${reservation.id}

Dear ${customerName},

Thank you for choosing Paris Transfer! We have received your reservation and will review it shortly. You will receive another email once it has been confirmed.

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}
- Total Price: €${reservation.totalPrice.toFixed(2)}

View reservation: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * CONFIRMED - Reservation confirmed by admin
 */
export function generateConfirmedEmail(
  reservation: any,
  customerName: string,
  locale: string = "en",
): EmailTemplate {
  const subject = `Reservation Confirmed - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h1>Reservation Confirmed!</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Your reservation has been confirmed!</p>
            <p>We are excited to provide you with our premium transfer service. Please review the details below and contact us if you have any questions.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #10b981; font-size: 18px;">€${reservation.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div class="info-box">
            <p style="font-weight: 600; margin-bottom: 10px;">Important Information:</p>
            <ul style="margin-left: 20px; line-height: 2;">
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Our driver will contact you 30 minutes before pickup</li>
              <li>Keep this confirmation email as proof of booking</li>
              <li>Contact us immediately if you need to make changes</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button button-success">View Reservation Details</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reservation Confirmed - Reservation ${reservation.id}

Dear ${customerName},

Your reservation has been confirmed! We are excited to provide you with our premium transfer service.

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}
- Total Price: €${reservation.totalPrice.toFixed(2)}

Important Information:
- Please arrive 10 minutes before your scheduled pickup time
- Our driver will contact you 30 minutes before pickup
- Keep this confirmation email as proof of booking
- Contact us immediately if you need to make changes

View reservation: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * CANCELLED - Reservation cancelled
 */
export function generateCancelledEmail(
  reservation: any,
  customerName: string,
  locale: string = "en",
): EmailTemplate {
  const subject = `Reservation Cancelled - Reservation ${reservation.id}`;
  const reservationUrl = getReservationUrl(reservation.id, locale);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>Reservation Cancelled</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="error-box">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Your reservation has been cancelled</p>
            <p>We apologize, but your reservation has been cancelled. Please contact us for alternative options or to make a new reservation.</p>
          </div>

          <div class="section">
            <div class="section-title">Cancelled Reservation Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${reservationUrl}" class="button">View Details</a>
            <a href="mailto:support@prestigeshuttlegroup.com" class="button button-secondary">Contact Us</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reservation Cancelled - Reservation ${reservation.id}

Dear ${customerName},

We apologize, but your reservation has been cancelled. Please contact us for alternative options or to make a new reservation.

Cancelled Reservation Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}

View details: ${reservationUrl}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

We hope to serve you in the future.
  `.trim();

  return { subject, html, text };
}

/**
 * COMPLETED - Thank you email with Google review link
 */
export function generateCompletedEmail(
  reservation: any,
  customerName: string,
): EmailTemplate {
  const subject = `Thank You - Reservation ${reservation.id} Completed`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
          <h1>Thank You!</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">Thank you for choosing Paris Transfer. We hope you had a wonderful experience with our service.</p>
          </div>

          <div class="highlight-box" style="text-align: center; padding: 40px 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b;">
            <p style="font-size: 24px; font-weight: 700; margin-bottom: 15px; color: #92400e;">We'd Love Your Feedback!</p>
            <p style="font-size: 16px; margin-bottom: 30px; color: #78350f;">Your opinion matters to us. Please take a moment to share your experience and help us improve our services.</p>
            <a href="${GOOGLE_REVIEW_LINK}" class="button" style="font-size: 18px; padding: 18px 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: inline-block; text-decoration: none; border-radius: 8px; font-weight: 700;">Leave a Google Review</a>
          </div>

          <div class="section" style="margin-top: 30px;">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.time}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer</strong></p>
          <p>Email: support@prestigeshuttlegroup.com | Phone: +33 6 19 97 51 36</p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank You - Reservation ${reservation.id} Completed

Dear ${customerName},

Thank you for choosing Paris Transfer. We hope you had a wonderful experience with our service.

We'd Love Your Feedback!
Your opinion matters to us. Please take a moment to share your experience and help us improve our services.

Leave a Google Review: ${GOOGLE_REVIEW_LINK}

Trip Details:
- Date: ${reservation.date}
- Time: ${reservation.time}
- Pickup: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- Destination: ${reservation.destinationLocation}` : ""}

Contact us:
Email: support@prestigeshuttlegroup.com
Phone: +33 6 19 97 51 36

Thank you for choosing Paris Transfer!
  `.trim();

  return { subject, html, text };
}

/**
 * Admin notification email (when new reservation is created)
 */
export function generateAdminNotificationEmail(
  reservation: any,
): EmailTemplate {
  const subject = `New Reservation: ${reservation.id}`;
  // Admin emails always use "en" locale
  const adminUrl = getReservationUrl(reservation.id, "en");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>New Reservation Received</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">A new reservation has been submitted and requires your attention.</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${reservation.customerFirstName} ${reservation.customerLastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${reservation.customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${reservation.customerPhone}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.pickupDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.pickupTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">To:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Service & Pricing</div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${reservation.serviceName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehicle Type:</span>
              <span class="info-value">${reservation.vehicleTypeName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #0ea5e9;">€${reservation.totalPrice}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge" style="background: ${reservation.status === 'quote_requested' ? '#fef3c7' : '#dbeafe'}; color: ${reservation.status === 'quote_requested' ? '#92400e' : '#1e40af'};">
                  ${reservation.status === 'quote_requested' ? 'Quote Requested' : reservation.status}
                </span>
              </span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${adminUrl}" class="button">View in Admin Panel</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer Admin</strong></p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically from the reservation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Reservation: ${reservation.id}

A new reservation has been submitted and requires your attention.

Customer Information:
- Name: ${reservation.customerFirstName} ${reservation.customerLastName}
- Email: ${reservation.customerEmail}
- Phone: ${reservation.customerPhone}

Trip Details:
- Date: ${reservation.pickupDate}
- Time: ${reservation.pickupTime}
- From: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}

Service & Pricing:
- Service: ${reservation.serviceName}
- Vehicle Type: ${reservation.vehicleTypeName || "N/A"}
- Total Price: €${reservation.totalPrice}
- Status: ${reservation.status === 'quote_requested' ? 'Quote Requested' : reservation.status}

View in Admin Panel: ${adminUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Admin notification email (when client accepts a quote)
 */
export function generateAdminQuoteAcceptedEmail(
  reservation: any,
): EmailTemplate {
  const subject = `Quote Accepted - Reservation ${reservation.id}`;
  // Admin emails always use "en" locale
  const adminUrl = getReservationUrl(reservation.id, "en");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h1>Quote Accepted</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">The client has accepted your quote!</p>
            <p>Please review the reservation and confirm it to proceed with the booking.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${reservation.customerFirstName} ${reservation.customerLastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${reservation.customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${reservation.customerPhone}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.pickupDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.pickupTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">To:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Service & Pricing</div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${reservation.serviceName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehicle Type:</span>
              <span class="info-value">${reservation.vehicleTypeName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #10b981;">€${reservation.totalPrice}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge" style="background: #d1fae5; color: #166534;">
                  Quote Accepted
                </span>
              </span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${adminUrl}" class="button">View & Confirm Reservation</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Paris Transfer Admin</strong></p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically from the reservation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Quote Accepted - Reservation ${reservation.id}

The client has accepted your quote! Please review the reservation and confirm it to proceed with the booking.

Customer Information:
- Name: ${reservation.customerFirstName} ${reservation.customerLastName}
- Email: ${reservation.customerEmail}
- Phone: ${reservation.customerPhone}

Trip Details:
- Date: ${reservation.pickupDate}
- Time: ${reservation.pickupTime}
- From: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}

Service & Pricing:
- Service: ${reservation.serviceName}
- Vehicle Type: ${reservation.vehicleTypeName || "N/A"}
- Total Price: €${reservation.totalPrice}
- Status: Quote Accepted

View & Confirm Reservation: ${adminUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Admin notification email (when client declines a quote)
 */
export function generateAdminQuoteDeclinedEmail(
  reservation: any,
): EmailTemplate {
  const subject = `Quote Declined - Reservation ${reservation.id}`;
  // Admin emails always use "en" locale
  const adminUrl = getReservationUrl(reservation.id, "en");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>Quote Declined</h1>
          <p>Reservation ID: ${reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="error-box">
            <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">The client has declined your quote.</p>
            <p>The reservation has been cancelled. You may want to follow up with the client or adjust your pricing strategy.</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${reservation.customerFirstName} ${reservation.customerLastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${reservation.customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${reservation.customerPhone}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Trip Details</div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${reservation.pickupDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${reservation.pickupTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${reservation.pickupLocation}</span>
            </div>
            ${reservation.destinationLocation ? `
            <div class="info-row">
              <span class="info-label">To:</span>
              <span class="info-value">${reservation.destinationLocation}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Passengers:</span>
              <span class="info-value">${reservation.passengers}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Service & Pricing</div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${reservation.serviceName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehicle Type:</span>
              <span class="info-value">${reservation.vehicleTypeName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value" style="font-weight: 700; color: #ef4444;">€${reservation.totalPrice}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge" style="background: #fee2e2; color: #991b1b;">
                  Cancelled
                </span>
              </span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${adminUrl}" class="button">View Reservation</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Paris Transfer Admin</strong></p>
          <p style="margin-top: 15px; font-size: 12px;">This email was sent automatically from the reservation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Quote Declined - Reservation ${reservation.id}

The client has declined your quote. The reservation has been cancelled.

Customer Information:
- Name: ${reservation.customerFirstName} ${reservation.customerLastName}
- Email: ${reservation.customerEmail}
- Phone: ${reservation.customerPhone}

Trip Details:
- Date: ${reservation.pickupDate}
- Time: ${reservation.pickupTime}
- From: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ""}
- Passengers: ${reservation.passengers}

Service & Pricing:
- Service: ${reservation.serviceName}
- Vehicle Type: ${reservation.vehicleTypeName || "N/A"}
- Total Price: €${reservation.totalPrice}
- Status: Cancelled

View Reservation: ${adminUrl}
  `.trim();

  return { subject, html, text };
}
