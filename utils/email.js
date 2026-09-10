const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send lead notification email to admin
 * @param {Object} lead - the lead data
 * @param {Object} property - the property data
 */
const sendLeadEmail = async (lead, property) => {
  const isUrgent = lead.type === 'urgent';

  const subject = isUrgent
    ? `🚨 URGENT CALL REQUEST — ${property.title}`
    : `📋 New Callback Request — ${property.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

      <!-- Header -->
      <div style="background: ${isUrgent ? '#c0392b' : '#1a3c5e'}; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 20px;">
          ${isUrgent ? '🚨 Urgent Call Request' : '📋 New Callback Request'}
        </h2>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">
          RoomRent Platform
        </p>
      </div>

      <!-- Body -->
      <div style="background: #f9fafb; padding: 28px; border: 1px solid #e5e7eb; border-top: none;">

        <!-- Alert for urgent -->
        ${isUrgent ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px;">
          <strong style="color: #c0392b;">⚡ User requested an urgent call — please call back immediately!</strong>
        </div>` : ''}

        <!-- User Details -->
        <h3 style="color: #1a3c5e; font-size: 15px; margin: 0 0 12px;">👤 User Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 140px;">Name</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 14px;">${lead.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Phone</td>
            <td style="padding: 10px 0; font-size: 14px;">
              <a href="tel:${lead.phone}" style="color: #0e7c86; font-weight: 600;">${lead.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">WhatsApp</td>
            <td style="padding: 10px 0; font-size: 14px;">
              <a href="https://wa.me/${lead.whatsapp}" style="color: #25d366; font-weight: 600;">${lead.whatsapp}</a>
            </td>
          </tr>
        </table>

        <!-- Property Details -->
        <h3 style="color: #1a3c5e; font-size: 15px; margin: 0 0 12px;">🏠 Property Interested In</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 140px;">Property</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 14px;">${property.title}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Area</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">${property.area}, ${property.city}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Price Range</td>
            <td style="padding: 10px 0; color: #0e7c86; font-weight: 600; font-size: 14px;">
              Rs. ${property.priceMin?.toLocaleString()} – Rs. ${property.priceMax?.toLocaleString()} / month
            </td>
          </tr>
        </table>

        <!-- Action buttons -->
        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <a href="tel:${lead.phone}"
            style="display: inline-block; background: #1a3c5e; color: white; padding: 12px 20px;
                   border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 10px;">
            📞 Call Now
          </a>
          <a href="https://wa.me/${lead.whatsapp}"
            style="display: inline-block; background: #25d366; color: white; padding: 12px 20px;
                   border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            💬 WhatsApp
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 14px 28px; border-radius: 0 0 8px 8px;
                  border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Received on ${new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
          &nbsp;·&nbsp; RoomRent Admin Panel
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from: `"RoomRent Leads" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  });
};

module.exports = { sendLeadEmail };