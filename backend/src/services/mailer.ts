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

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  // We'll point this to the frontend URL since the user needs to enter the new password on a UI screen
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Vertical.AI Security" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: email,
    subject: `🔒 Password Reset Request — ${name}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>We received a request to reset your password for your Vertical.AI account.</p>
      <p>If you didn't make this request, you can safely ignore this email.</p>
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendMeetingScheduledEmail = async (bdeEmail: string, bdeName: string, leadName: string, scheduledTime: Date) => {
  const mailOptions = {
    from: `"Vertical.AI Assistant" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: bdeEmail,
    subject: `📅 New Meeting Scheduled — ${leadName}`,
    html: `
      <h2>Hello ${bdeName},</h2>
      <p>A new meeting has been scheduled with <strong>${leadName}</strong>.</p>
      <p><strong>Scheduled Time:</strong> ${scheduledTime.toLocaleString()}</p>
      <p>Please make sure to review the lead details in the CRM before the meeting.</p>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${bdeEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending meeting scheduled email:', error);
  }
};

export const sendMeetingDueEmail = async (bdeEmail: string, bdeName: string, leadName: string) => {
  const mailOptions = {
    from: `"Vertical.AI Assistant" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: bdeEmail,
    subject: `🚨 Meeting Overdue — ${leadName}`,
    html: `
      <h2>Hello ${bdeName},</h2>
      <p>Your scheduled meeting with <strong>${leadName}</strong> is now due/overdue!</p>
      <p>Please log in to your dashboard to handle the followup immediately.</p>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${bdeEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending meeting overdue email:', error);
  }
};
