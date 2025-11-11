// // Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "jsr:@supabase/supabase-js@2";

// const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
// const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://etsuopxjlgtjggzemeoy.supabase.co';
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0c3VvcHhqbGd0amdnemVtZW95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3ODM4MCwiZXhwIjoyMDc2NTU0MzgwfQ.ev5Nccj3AHOZ5QoH8ULK88Ql0Y6uTikPSqrtdOiBwyM';
// const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@paristransfer.com';
// const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@paristransfer.com';
// const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://paristransfer.com';

// // Initialize Supabase client with service role key for admin access
// const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// interface ReservationData {
//   id: string;
//   client_id: string;
//   service_id: string;
//   vehicle_type_id: string;
//   date: string;
//   time: string;
//   pickup_location: string;
//   destination_location: string | null;
//   passengers: number;
//   baby_seats: number;
//   booster_seats: number;
//   meet_and_greet: boolean;
//   service_sub_data: any;
//   notes: string | null;
//   total_price: number;
//   status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
//   created_at: string;
//   updated_at: string;
// }

// interface ClientData {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

// interface ServiceData {
//   id: string;
//   name: string;
// }

// interface VehicleTypeData {
//   id: string;
//   name: string;
// }

// interface WebhookPayload {
//   type: 'INSERT' | 'UPDATE' | 'DELETE';
//   table: string;
//   record: ReservationData;
//   old_record?: ReservationData;
// }

// // Email template functions (adapted for Deno)
// function generateAdminNotificationEmail(reservation: any): { subject: string; html: string; text: string } {
//   const subject = `New Reservation: ${reservation.reservationId || reservation.id}`;

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>New Reservation</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background: #f9fafb; }
//         .section { margin-bottom: 20px; }
//         .label { font-weight: bold; color: #374151; }
//         .value { margin-left: 10px; }
//         .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
//         .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>New Reservation Received</h1>
//           <p>Reservation ID: ${reservation.reservationId || reservation.id}</p>
//         </div>

//         <div class="content">
//           <div class="section">
//             <h2>Customer Information</h2>
//             <p><span class="label">Name:</span><span class="value">${reservation.customerFirstName} ${reservation.customerLastName}</span></p>
//             <p><span class="label">Email:</span><span class="value">${reservation.customerEmail}</span></p>
//             <p><span class="label">Phone:</span><span class="value">${reservation.customerPhone}</span></p>
//           </div>

//           <div class="section">
//             <h2>Trip Details</h2>
//             <p><span class="label">Date:</span><span class="value">${reservation.pickupDate}</span></p>
//             <p><span class="label">Time:</span><span class="value">${reservation.pickupTime}</span></p>
//             <p><span class="label">From:</span><span class="value">${reservation.pickupLocation}</span></p>
//             ${reservation.destinationLocation ? `<p><span class="label">To:</span><span class="value">${reservation.destinationLocation}</span></p>` : ''}
//             <p><span class="label">Passengers:</span><span class="value">${reservation.passengers}</span></p>
//           </div>

//           <div class="section">
//             <h2>Vehicle & Service</h2>
//             <p><span class="label">Vehicle Type:</span><span class="value">${reservation.vehicleTypeName || 'N/A'}</span></p>
//             <p><span class="label">Service:</span><span class="value">${reservation.serviceName}</span></p>
//             <p><span class="label">Total Price:</span><span class="value">€${reservation.totalPrice}</span></p>
//           </div>

//           <div class="section">
//             <h2>Additional Services</h2>
//             <p><span class="label">Baby Seats:</span><span class="value">${reservation.babySeats || 0}</span></p>
//             <p><span class="label">Booster Seats:</span><span class="value">${reservation.boosterSeats || 0}</span></p>
//             <p><span class="label">Meet & Greet:</span><span class="value">${reservation.meetAndGreet ? 'Yes' : 'No'}</span></p>
//           </div>

//           ${reservation.notes ? `
//           <div class="section">
//             <h2>Special Requests</h2>
//             <p>${reservation.notes}</p>
//           </div>
//           ` : ''}

//           <div style="text-align: center; margin-top: 30px;">
//             <a href="${APP_URL}/admin/reservations" class="button">View in Admin Panel</a>
//           </div>
//         </div>

//         <div class="footer">
//           <p>This email was sent automatically from Paris Transfer reservation system.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   const text = `
// New Reservation: ${reservation.reservationId || reservation.id}

// Customer Information:
// - Name: ${reservation.customerFirstName} ${reservation.customerLastName}
// - Email: ${reservation.customerEmail}
// - Phone: ${reservation.customerPhone}

// Trip Details:
// - Date: ${reservation.pickupDate}
// - Time: ${reservation.pickupTime}
// - From: ${reservation.pickupLocation}
// ${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ''}
// - Passengers: ${reservation.passengers}

// Vehicle & Service:
// - Vehicle Type: ${reservation.vehicleTypeName || 'N/A'}
// - Service: ${reservation.serviceName}
// - Total Price: €${reservation.totalPrice}

// Additional Services:
// - Baby Seats: ${reservation.babySeats || 0}
// - Booster Seats: ${reservation.boosterSeats || 0}
// - Meet & Greet: ${reservation.meetAndGreet ? 'Yes' : 'No'}

// ${reservation.notes ? `Special Requests: ${reservation.notes}` : ''}

// Please log into the admin panel to approve or reject this reservation.
//   `.trim();

//   return { subject, html, text };
// }

// function generateCustomerConfirmationEmail(reservation: any, status: 'confirmed' | 'cancelled' | 'pending' | 'quote_requested' | 'quote_sent' | 'quote_accepted'): { subject: string; html: string; text: string } {
//   const isConfirmed = status === 'confirmed' || status === 'quote_accepted';
//   const isPending = status === 'pending' || status === 'quote_requested';
//   const isQuoteSent = status === 'quote_sent';
//   const isCancelled = status === 'cancelled';

//   let subject = '';
//   let headerColor = '#2563eb';
//   let statusMessage = '';
//   let statusDescription = '';

//   if (status === 'quote_requested') {
//     subject = `Quote Request Received: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#2563eb';
//     statusMessage = '📋 Your quote request has been received!';
//     statusDescription = 'Thank you for choosing Paris Transfer! We have received your quote request and will send you a detailed quote shortly.';
//   } else if (status === 'quote_sent') {
//     subject = `Your Quote from Paris Transfer: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#10b981';
//     statusMessage = '💰 Your personalized quote is ready!';
//     statusDescription = `We have prepared a quote for your transfer. Total price: €${reservation.totalPrice}. Please review the details below and let us know if you'd like to proceed.`;
//   } else if (status === 'quote_accepted') {
//     subject = `Quote Accepted: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#10b981';
//     statusMessage = '✅ Your quote has been accepted!';
//     statusDescription = 'Thank you for accepting our quote! Your reservation is now confirmed. We are excited to provide you with our premium transfer service.';
//   } else if (isPending) {
//     subject = `Reservation Received: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#2563eb';
//     statusMessage = '📋 Your reservation has been received!';
//     statusDescription = 'Thank you for choosing Paris Transfer! We have received your reservation and will review it shortly. You will receive another email once it has been confirmed.';
//   } else if (isConfirmed) {
//     subject = `Reservation Confirmed: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#10b981';
//     statusMessage = '✅ Your reservation has been confirmed!';
//     statusDescription = 'We are excited to provide you with our premium transfer service. Please review the details below and contact us if you have any questions.';
//   } else {
//     subject = `Reservation Cancelled: ${reservation.reservationId || reservation.id}`;
//     headerColor = '#ef4444';
//     statusMessage = '❌ Your reservation has been cancelled';
//     statusDescription = 'We apologize, but your reservation has been cancelled. Please contact us for alternative options.';
//   }

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>${subject}</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background: #f9fafb; }
//         .section { margin-bottom: 20px; }
//         .label { font-weight: bold; color: #374151; }
//         .value { margin-left: 10px; }
//         .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
//         .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
//         .status-message { background: ${isConfirmed || isQuoteSent ? '#d1fae5' : isCancelled ? '#fee2e2' : '#dbeafe'}; padding: 15px; border-radius: 6px; margin: 20px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>${status === 'quote_requested' ? 'Quote Request Received' : status === 'quote_sent' ? 'Your Quote' : status === 'quote_accepted' ? 'Quote Accepted' : isPending ? 'Reservation Received' : isConfirmed ? 'Reservation Confirmed' : 'Reservation Cancelled'}</h1>
//           <p>Reservation ID: ${reservation.reservationId || reservation.id}</p>
//         </div>

//         <div class="content">
//           <div class="status-message">
//             <h2>${statusMessage}</h2>
//             <p>${statusDescription}</p>
//           </div>

//           <div class="section">
//             <h2>Trip Details</h2>
//             <p><span class="label">Date:</span><span class="value">${reservation.pickupDate}</span></p>
//             <p><span class="label">Time:</span><span class="value">${reservation.pickupTime}</span></p>
//             <p><span class="label">From:</span><span class="value">${reservation.pickupLocation}</span></p>
//             ${reservation.destinationLocation ? `<p><span class="label">To:</span><span class="value">${reservation.destinationLocation}</span></p>` : ''}
//             <p><span class="label">Passengers:</span><span class="value">${reservation.passengers}</span></p>
//           </div>

//           <div class="section">
//             <h2>Vehicle & Service</h2>
//             <p><span class="label">Vehicle Type:</span><span class="value">${reservation.vehicleTypeName || 'N/A'}</span></p>
//             <p><span class="label">Service:</span><span class="value">${reservation.serviceName}</span></p>
//             <p><span class="label">Total Price:</span><span class="value">€${reservation.totalPrice}</span></p>
//           </div>

//           ${(isConfirmed || status === 'quote_accepted') ? `
//           <div class="section">
//             <h2>Important Information</h2>
//             <ul>
//               <li>Please arrive 10 minutes before your scheduled pickup time</li>
//               <li>Our driver will contact you 30 minutes before pickup</li>
//               <li>Keep this confirmation email as proof of booking</li>
//               <li>Contact us immediately if you need to make changes</li>
//             </ul>
//           </div>
//           ` : ''}

//           <div style="text-align: center; margin-top: 30px;">
//             <a href="mailto:info@paristransfer.com" class="button">Contact Us</a>
//             ${(isConfirmed || status === 'quote_accepted') ? `<a href="${APP_URL}/confirmation?download=${reservation.reservationId || reservation.id}" class="button">Download PDF</a>` : ''}
//           </div>
//         </div>

//         <div class="footer">
//           <p>Thank you for choosing Paris Transfer!</p>
//           <p>Email: info@paristransfer.com | Phone: +33 1 23 45 67 89</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   const text = `${subject}

// ${statusMessage}
// ${statusDescription}

// Trip Details:
// - Date: ${reservation.pickupDate}
// - Time: ${reservation.pickupTime}
// - From: ${reservation.pickupLocation}
// ${reservation.destinationLocation ? `- To: ${reservation.destinationLocation}` : ''}
// - Passengers: ${reservation.passengers}

// Vehicle & Service:
// - Vehicle Type: ${reservation.vehicleTypeName || 'N/A'}
// - Service: ${reservation.serviceName}
// - Total Price: €${reservation.totalPrice}

// ${(isConfirmed || status === 'quote_accepted') ? `
// Important Information:
// - Please arrive 10 minutes before your scheduled pickup time
// - Our driver will contact you 30 minutes before pickup
// - Keep this confirmation email as proof of booking
// - Contact us immediately if you need to make changes
// ` : ''}

// Contact us at info@paristransfer.com or +33 1 23 45 67 89

// Thank you for choosing Paris Transfer!
//   `.trim();

//   return { subject, html, text };
// }

// // Send email via Resend
// async function sendEmail(to: string, subject: string, html: string, text: string) {
//   const res = await fetch('https://api.resend.com/emails', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${RESEND_API_KEY}`,
//     },
//     body: JSON.stringify({
//       from: FROM_EMAIL,
//       to,
//       subject,
//       html,
//       text,
//     }),
//   });

//   if (!res.ok) {
//     const error = await res.text();
//     throw new Error(`Resend API error: ${res.status} ${error}`);
//   }

//   return await res.json();
// }

// // Fetch full reservation data with related information
// async function fetchReservationData(reservationId: string) {
//   const { data: reservation, error: reservationError } = await supabase
//     .from('reservations')
//     .select('*')
//     .eq('id', reservationId)
//     .single();

//   if (reservationError || !reservation) {
//     throw new Error(`Failed to fetch reservation: ${reservationError?.message}`);
//   }

//   // Fetch related data
//   const [clientResult, serviceResult, vehicleTypeResult] = await Promise.all([
//     supabase.from('clients').select('*').eq('id', reservation.client_id).single(),
//     supabase.from('services').select('*').eq('id', reservation.service_id).single(),
//     supabase.from('vehicle_types').select('*').eq('id', reservation.vehicle_type_id).single(),
//   ]);

//   if (clientResult.error || !clientResult.data) {
//     throw new Error(`Failed to fetch client: ${clientResult.error?.message}`);
//   }
//   if (serviceResult.error || !serviceResult.data) {
//     throw new Error(`Failed to fetch service: ${serviceResult.error?.message}`);
//   }
//   if (vehicleTypeResult.error || !vehicleTypeResult.data) {
//     throw new Error(`Failed to fetch vehicle type: ${vehicleTypeResult.error?.message}`);
//   }

//   return {
//     reservation: reservation as ReservationData,
//     client: clientResult.data as ClientData,
//     service: serviceResult.data as ServiceData,
//     vehicleType: vehicleTypeResult.data as VehicleTypeData,
//   };
// }

// // Format reservation data for email templates
// function formatReservationForEmail(data: {
//   reservation: ReservationData;
//   client: ClientData;
//   service: ServiceData;
//   vehicleType: VehicleTypeData;
// }) {
//   return {
//     reservationId: data.reservation.id,
//     id: data.reservation.id,
//     customerFirstName: data.client.first_name,
//     customerLastName: data.client.last_name,
//     customerEmail: data.client.email,
//     customerPhone: data.client.phone,
//     pickupDate: data.reservation.date,
//     pickupTime: data.reservation.time,
//     pickupLocation: data.reservation.pickup_location,
//     destinationLocation: data.reservation.destination_location,
//     passengers: data.reservation.passengers,
//     babySeats: data.reservation.baby_seats,
//     boosterSeats: data.reservation.booster_seats,
//     meetAndGreet: data.reservation.meet_and_greet,
//     vehicleTypeName: data.vehicleType.name,
//     serviceName: data.service.name,
//     totalPrice: Number(data.reservation.total_price).toFixed(2),
//     notes: data.reservation.notes,
//   };
// }

// Deno.serve(async (req) => {
//   try {
//     // Parse webhook payload
//     const payload: WebhookPayload = await req.json();

//     console.log('Received webhook:', JSON.stringify(payload, null, 2));

//     // Only process INSERT and UPDATE operations
//     if (payload.type !== 'INSERT' && payload.type !== 'UPDATE') {
//       return new Response(JSON.stringify({ message: 'Ignored: not INSERT or UPDATE' }), {
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const reservation = payload.record;
//     const oldReservation = payload.old_record;

//     // Fetch full reservation data with related information
//     const fullData = await fetchReservationData(reservation.id);
//     const formattedReservation = formatReservationForEmail(fullData);

//     // Determine email scenarios
//     if (payload.type === 'INSERT') {
//       // New reservation/quote created
//       if (reservation.status === 'pending') {
//         // Send customer "reservation/quote received" email
//         const customerEmail = generateCustomerConfirmationEmail(formattedReservation, 'pending');
//         await sendEmail(
//           fullData.client.email,
//           customerEmail.subject,
//           customerEmail.html,
//           customerEmail.text
//         );

//         // Send admin notification email
//         const adminEmail = generateAdminNotificationEmail(formattedReservation);
//         await sendEmail(
//           ADMIN_EMAIL,
//           adminEmail.subject,
//           adminEmail.html,
//           adminEmail.text
//         );

//         return new Response(JSON.stringify({
//           success: true,
//           message: 'Emails sent: customer pending confirmation + admin notification'
//         }), {
//           headers: { 'Content-Type': 'application/json' },
//         });
//       }
//     } else if (payload.type === 'UPDATE') {
//       // Status changed
//       const oldStatus = oldReservation?.status;
//       const newStatus = reservation.status;

//       if (oldStatus === newStatus) {
//         // Status didn't change, might be other field update
//         return new Response(JSON.stringify({ message: 'No status change, skipping emails' }), {
//           headers: { 'Content-Type': 'application/json' },
//         });
//       }

//       if (newStatus === 'confirmed') {
//         // Reservation confirmed or quote accepted
//         const customerEmail = generateCustomerConfirmationEmail(formattedReservation, 'confirmed');
//         await sendEmail(
//           fullData.client.email,
//           customerEmail.subject,
//           customerEmail.html,
//           customerEmail.text
//         );

//         return new Response(JSON.stringify({
//           success: true,
//           message: 'Email sent: customer confirmation'
//         }), {
//           headers: { 'Content-Type': 'application/json' },
//         });
//       } else if (newStatus === 'cancelled') {
//         // Reservation cancelled
//         const customerEmail = generateCustomerConfirmationEmail(formattedReservation, 'cancelled');
//         await sendEmail(
//           fullData.client.email,
//           customerEmail.subject,
//           customerEmail.html,
//           customerEmail.text
//         );

//         return new Response(JSON.stringify({
//           success: true,
//           message: 'Email sent: customer cancellation notice'
//         }), {
//           headers: { 'Content-Type': 'application/json' },
//         });
//       }
//     }

//     return new Response(JSON.stringify({ message: 'No emails sent: condition not met' }), {
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return new Response(
//       JSON.stringify({
//         error: 'Internal server error',
//         message: error instanceof Error ? error.message : 'Unknown error'
//       }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// });
