const { Resend } = require('resend');

const sendBookingConfirmationEmail = async (booking) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not found. skipping email.');
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const { contactName, contactEmail, packageName, tripDate, totalPrice, _id } = booking;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const BACKEND_URL = process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const downloadLink = `${BACKEND_URL}/api/bookings/${_id}/invoice`;
  // Note: Direct download from backend for better user experience.

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 20px; color: #334155;">
        <p>Dear <strong>${contactName}</strong>,</p>
        <p>Thank you for booking with <strong>Jagannath Darshan Yatra</strong>. Your payment has been successfully processed and your trip is confirmed!</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f97316;">Booking Summary</h3>
          <p style="margin: 5px 0;"><strong>Package:</strong> ${packageName}</p>
          <p style="margin: 5px 0;"><strong>Trip Date:</strong> ${new Date(tripDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Total Amount Paid:</strong> Rs. ${totalPrice.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${_id}</p>
        </div>

        <p>You can download your official invoice by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Invoice PDF</a>
        </div>

        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #64748b;">${downloadLink}</p>
        
        <p>We're excited to have you on board! If you have any questions, feel free to contact us.</p>
        
        <p style="margin-top: 30px;">Best Regards,<br><strong>The Jagannath Darshan Yatra Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">&copy; 2026 Jagannath Darshan Yatra. All rights reserved.</p>
        <p style="margin: 5px 0;">Office No: 307, 3rd Floor, Esplanade One Mall, Rasulgarh, Bhubaneswar, Odisha 751010</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Jagannath Darshan Yatra <no-reply@jagannathdarshanyatra.com>',
      to: [contactEmail, 'jagannathdarshanyatra@gmail.com'],
      subject: `Booking Confirmation - ${packageName}`,
      html: emailHtml
    });

    if (error) {
      console.error('[Email] Resend SDK error:', error.message || JSON.stringify(error));
    } else {
      console.log(`[Email] Booking confirmation sent to ${contactEmail}. ID: ${data.id}`);
    }
  } catch (err) {
    console.error('[Email] Failed to send via Resend SDK:', err.message);
  }
};

module.exports = {
  sendBookingConfirmationEmail
};
