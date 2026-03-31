import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// For real production, use SMTP_HOST, SMTP_PORT, etc. from .env
// For development, we'll log to console if no credentials are provided.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendApprovalEmail = async (
  teamLeadEmail: string,
  userName: string,
  userRole: string,
  token: string
) => {
  const approveUrl = `${process.env.APP_BASE_URL}/api/v1/auth/approve?token=${token}`;
  const denyUrl = `${process.env.APP_BASE_URL}/api/v1/auth/deny?token=${token}`;

  const mailOptions = {
    from: `"Vertical.AI CRM" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: teamLeadEmail,
    subject: `🔔 New Account Request — ${userName} (${userRole})`,
    html: `
      <h2>New Account Request</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Role:</strong> ${userRole}</p>
      <p>Please review this request and take action:</p>
      <div style="margin: 20px 0;">
        <a href="${approveUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">✅ Approve Access</a>
        <a href="${denyUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">❌ Deny Access</a>
      </div>
      <p>This link expires in 48 hours.</p>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${teamLeadEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Approve Link: ${approveUrl}`);
      console.log(`Deny Link: ${denyUrl}`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

export const sendNotificationEmail = async (email: string, subject: string, message: string) => {
  // Logic to send a final "You are approved" or "You are denied" email
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Vertical.AI System" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text: message,
      });
    } else {
      console.log(`[DEV MAIL LOG] To: ${email}, Subject: ${subject}, Msg: ${message}`);
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};
