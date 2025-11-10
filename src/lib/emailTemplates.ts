// Email templates for reservation notifications

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function generateAdminNotificationEmail(reservation: any): EmailTemplate {
  const subject = `New Reservation: ${reservation.reservationId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Reservation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; }
        .value { margin-left: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Reservation Received</h1>
          <p>Reservation ID: ${reservation.reservationId}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Customer Information</h2>
            <p><span class="label">Name:</span><span class="value">${reservation.customerFirstName} ${reservation.customerLastName}</span></p>
            <p><span class="label">Email:</span><span class="value">${reservation.customerEmail}</span></p>
            <p><span class="label">Phone:</span><span class="value">${reservation.customerPhone}</span></p>
          </div>
          
          <div class="section">
            <h2>Trip Details</h2>
            <p><span class="label">Date:</span><span class="value">${reservation.pickupDate}</span></p>
            <p><span class="label">Time:</span><span class="value">${reservation.pickupTime}</span></p>
            <p><span class="label">From:</span><span class="value">${reservation.pickupLocation}</span></p>
            ${reservation.destinationLocation ? `<p><span class="label">To:</span><span class="value">${reservation.destinationLocation}</span></p>` : ''}
            <p><span class="label">Passengers:</span><span class="value">${reservation.passengers}</span></p>
          </div>
          
          <div class="section">
            <h2>Vehicle & Service</h2>
            <p><span class="label">Vehicle Type:</span><span class="value">${reservation.vehicleTypeName || reservation.vehicleName || 'N/A'}</span></p>
            <p><span class="label">Service:</span><span class="value">${reservation.serviceName}</span></p>
            <p><span class="label">Total Price:</span><span class="value">€${reservation.totalPrice}</span></p>
          </div>
          
          <div class="section">
            <h2>Additional Services</h2>
            <p><span class="label">Baby Seats:</span><span class="value">${reservation.babySeats}</span></p>
            <p><span class="label">Booster Seats:</span><span class="value">${reservation.boosterSeats}</span></p>
            <p><span class="label">Meet & Greet:</span><span class="value">${reservation.meetAndGreet ? 'Yes' : 'No'}</span></p>
          </div>
          
          ${reservation.notes ? `
          <div class="section">
            <h2>Special Requests</h2>
            <p>${reservation.notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reservations" class="button">View in Admin Panel</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically from Paris Transfer reservation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Reservation: ${reservation.reservationId}

Customer Information:
- Name: ${reservation.customerFirstName} ${reservation.customerLastName}
- Email: ${reservation.customerEmail}
- Phone: ${reservation.customerPhone}

Trip Details:
- Date: ${reservation.pickupDate}
- Time: ${reservation.pickupTime}
- From: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ''}
- Passengers: ${reservation.passengers}

Category & Service:
- Vehicle Type: ${reservation.vehicleTypeName || reservation.vehicleType?.name || reservation.vehicleName || 'N/A'}
- Service: ${reservation.serviceName}
- Total Price: €${reservation.totalPrice}

Additional Services:
- Baby Seats: ${reservation.babySeats}
- Booster Seats: ${reservation.boosterSeats}
- Meet & Greet: ${reservation.meetAndGreet ? 'Yes' : 'No'}

${reservation.notes ? `Special Requests: ${reservation.notes}` : ''}

Please log into the admin panel to approve or reject this reservation.
  `.trim();
  
  return { subject, html, text };
}

export function generateCustomerConfirmationEmail(reservation: any, status: 'confirmed' | 'cancelled' | 'pending'): EmailTemplate {
  const isConfirmed = status === 'confirmed';
  const isPending = status === 'pending';
  const subject = `Reservation ${isPending ? 'Received' : isConfirmed ? 'Confirmed' : 'Cancelled'}: ${reservation.reservationId || reservation.id}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation ${isConfirmed ? 'Confirmed' : 'Cancelled'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isConfirmed ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; }
        .value { margin-left: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .status-message { background: ${isConfirmed ? '#d1fae5' : '#fee2e2'}; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reservation ${isPending ? 'Received' : isConfirmed ? 'Confirmed' : 'Cancelled'}</h1>
          <p>Reservation ID: ${reservation.reservationId || reservation.id}</p>
        </div>
        
        <div class="content">
          <div class="status-message">
            <h2>${isPending ? '📋 Your reservation has been received!' : isConfirmed ? '✅ Your reservation has been confirmed!' : '❌ Your reservation has been cancelled'}</h2>
            <p>${isPending ? 
              'Thank you for choosing Paris Transfer! We have received your reservation and will review it shortly. You will receive another email once it has been confirmed.' :
              isConfirmed ? 
              'We are excited to provide you with our premium transfer service. Please review the details below and contact us if you have any questions.' :
              'We apologize, but your reservation has been cancelled. Please contact us for alternative options.'
            }</p>
          </div>
          
          <div class="section">
            <h2>Trip Details</h2>
            <p><span class="label">Date:</span><span class="value">${reservation.pickupDate}</span></p>
            <p><span class="label">Time:</span><span class="value">${reservation.pickupTime}</span></p>
            <p><span class="label">From:</span><span class="value">${reservation.pickupLocation}</span></p>
            ${reservation.destinationLocation ? `<p><span class="label">To:</span><span class="value">${reservation.destinationLocation}</span></p>` : ''}
            <p><span class="label">Passengers:</span><span class="value">${reservation.passengers}</span></p>
          </div>
          
          <div class="section">
            <h2>Vehicle & Service</h2>
            <p><span class="label">Vehicle Type:</span><span class="value">${reservation.vehicleTypeName || reservation.vehicleName || 'N/A'}</span></p>
            <p><span class="label">Service:</span><span class="value">${reservation.serviceName}</span></p>
            <p><span class="label">Total Price:</span><span class="value">€${reservation.totalPrice}</span></p>
          </div>
          
          ${isConfirmed ? `
          <div class="section">
            <h2>Important Information</h2>
            <ul>
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Our driver will contact you 30 minutes before pickup</li>
              <li>Keep this confirmation email as proof of booking</li>
              <li>Contact us immediately if you need to make changes</li>
            </ul>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:info@paristransfer.com" class="button">Contact Us</a>
            ${isConfirmed ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}/confirmation?download=${reservation.reservationId || reservation.id}" class="button">Download PDF</a>` : ''}
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Paris Transfer!</p>
          <p>Email: info@paristransfer.com | Phone: +33 1 23 45 67 89</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Reservation ${isPending ? 'Received' : isConfirmed ? 'Confirmed' : 'Cancelled'}: ${reservation.reservationId || reservation.id}

${isPending ? 
  '📋 Your reservation has been received! Thank you for choosing Paris Transfer! We have received your reservation and will review it shortly. You will receive another email once it has been confirmed.' :
  isConfirmed ? 
  '✅ Your reservation has been confirmed! We are excited to provide you with our premium transfer service.' :
  '❌ Your reservation has been cancelled. We apologize, but we are unable to fulfill your request at this time.'
}

Trip Details:
- Date: ${reservation.pickupDate}
- Time: ${reservation.pickupTime}
- From: ${reservation.pickupLocation}
${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ''}
- Passengers: ${reservation.passengers}

Category & Service:
- Vehicle Type: ${reservation.vehicleTypeName || reservation.vehicleType?.name || reservation.vehicleName || 'N/A'}
- Service: ${reservation.serviceName}
- Total Price: €${reservation.totalPrice}

${isConfirmed ? `
Important Information:
- Please arrive 10 minutes before your scheduled pickup time
- Our driver will contact you 30 minutes before pickup
- Keep this confirmation email as proof of booking
- Contact us immediately if you need to make changes
` : ''}

Contact us at info@paristransfer.com or +33 1 23 45 67 89

Thank you for choosing Paris Transfer!
  `.trim();
  
  return { subject, html, text };
}
