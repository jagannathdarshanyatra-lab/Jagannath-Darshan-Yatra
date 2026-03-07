const { Resend } = require('resend');
const Contact = require('../models/Contact');

// Send email using Resend API (works on cloud providers where SMTP is blocked)
const sendEmailNotification = async (contactData) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not found. skipping contact notification.');
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const { name, email, phone, message, package: packageType, destination } = contactData;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #334155;">
      <h2 style="color: #f97316;">New Contact Inquiry</h2>
      <p>A new inquiry has been received from the Jagannath Darshan Yatra website.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
        <p style="margin: 5px 0;"><strong>Package Interest:</strong> ${packageType || 'Not specified'}</p>
        <p style="margin: 5px 0;"><strong>Destination:</strong> ${destination || 'Not specified'}</p>
      </div>
      
      <p><strong>Message:</strong></p>
      <div style="background-color: #fffaf0; border-left: 4px solid #f97316; padding: 10px; margin: 10px 0;">
        ${message}
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        You can reply directly to this email to contact the customer.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Jagannath Darshan Yatra Inquiries <no-reply@jagannathdarshanyatra.com>',
      to: 'jagannathdarshanyatra@gmail.com',
      subject: `New Contact Inquiry from ${name}`,
      html: emailHtml,
      reply_to: email // So you can reply directly to the customer
    });

    if (error) {
      console.error('[Email] Resend SDK error (Contact):', error.message || JSON.stringify(error));
    } else {
      console.log(`[Email] Contact notification sent for ${name}. ID: ${data.id}`);
    }
  } catch (err) {
    console.error('[Email] Failed to send contact notification via Resend SDK:', err.message);
  }
};

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message, package: packageType, destination } = req.body;

    // Save to database first
    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
      package: packageType,
      destination
    });



    // Send response IMMEDIATELY after DB save
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Thank you for contacting us! We will get back to you soon.'
    });

    // Fire-and-forget: Send email in background
    sendEmailNotification({ name, email, phone, message, package: packageType, destination })
      .catch(err => console.error('[Email] Background error:', err.message));

  } catch (err) {
    // console.error('[Contact] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to submit form'
    });
  }
};

// ─── Admin Endpoints ───────────────────────────────────────────

/**
 * GET /api/contact/admin/all
 * Fetch all inquiries (admin). Supports ?status=New filter and pagination.
 * Query params: ?status=New&page=1&limit=10
 */
exports.getAllInquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [inquiries, totalCount] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: inquiries.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      inquiries,
    });
  } catch (err) {
    // console.error('[Contact] getAllInquiries error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch inquiries' });
  }
};

/**
 * GET /api/contact/admin/:id
 * Fetch a single inquiry by ID (admin).
 */
exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await Contact.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }
    res.json({ success: true, inquiry });
  } catch (err) {
    // console.error('[Contact] getInquiryById error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch inquiry' });
  }
};

/**
 * PUT /api/contact/admin/:id/status
 * Update inquiry status (admin). Body: { status: 'New' | 'Contacted' | 'Resolved' }
 */
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['New', 'Contacted', 'Resolved'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const inquiry = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    res.json({ success: true, inquiry });
  } catch (err) {
    // console.error('[Contact] updateInquiryStatus error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update inquiry status' });
  }
};

/**
 * DELETE /api/contact/admin/:id
 * Delete an inquiry (admin).
 */
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Contact.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    // console.error('[Contact] deleteInquiry error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete inquiry' });
  }
};


