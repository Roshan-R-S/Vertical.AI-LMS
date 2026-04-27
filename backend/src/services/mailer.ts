import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host || 'localhost',
  port: config.smtp.port || 587,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const FROM = `"Vertical AI LMS" <${config.smtp.user || 'noreply@vertical.ai'}>`;

const canSend = !!(config.smtp.user && config.smtp.pass);

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string,
  resetToken: string
) => {
  const setPasswordUrl = `${FRONTEND_URL()}/reset-password?token=${resetToken}`;
  console.log('[DEBUG] FRONTEND_URL value:', FRONTEND_URL());
  console.log('[DEBUG] setPasswordUrl:', setPasswordUrl);
  const mailOptions = {
    from: FROM,
    to: email,
    subject: `Welcome to Vertical AI — Set Your Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Vertical AI</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Your account has been created</p>
        </div>
        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
          <p style="color: #374151;">Your <strong>${role}</strong> account on Vertical AI LMS has been created by your administrator.</p>
          <p style="color: #374151;">Click the button below to set your password and activate your account:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${setPasswordUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Set My Password</a>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">⚠️ This link expires in <strong>5 minutes</strong>. If it expires, ask your admin to resend the invite.</p>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Your login email: <strong>${email}</strong></p>
        </div>
      </div>
    `,
  };

  try {
    if (canSend) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG: WELCOME] ---');
      console.log(`To: ${email} | Role: ${role}`);
      console.log(`Set Password Link: ${setPasswordUrl}`);
      console.log('-------------------------------');
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPartnerRequestEmail = async (
  adminEmail: string,
  partnerName: string,
  partnerEmail: string,
  companyName: string,
  approveToken: string
) => {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
  const approveUrl = `${baseUrl}/api/v1/auth/partner-approve?token=${approveToken}`;
  const rejectUrl  = `${baseUrl}/api/v1/auth/partner-reject?token=${approveToken}`;

  const mailOptions = {
    from: FROM,
    to: adminEmail,
    subject: `Channel Partner Request — ${partnerName} (${companyName})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Channel Partner Request</h1>
        </div>
        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151;">A new channel partner has requested access to Vertical AI LMS.</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${partnerName}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${partnerEmail}</p>
            <p style="margin: 0;"><strong>Company:</strong> ${companyName}</p>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <a href="${approveUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Approve Access</a>
            <a href="${rejectUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reject Request</a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">These links expire in 48 hours.</p>
        </div>
      </div>
    `,
  };

  try {
    if (canSend) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('[DEV MAIL: PARTNER REQUEST]', { adminEmail, partnerName, approveUrl, rejectUrl });
    }
  } catch (err) {
    console.error('Error sending partner request email:', err);
  }
};

export const sendPartnerApprovedEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const setPasswordUrl = `${FRONTEND_URL()}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: FROM,
    to: email,
    subject: `Your Channel Partner Access is Approved — Vertical AI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">✅ Access Approved!</h1>
        </div>
        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
          <p style="color: #374151;">Your Channel Partner access request has been <strong>approved</strong>. Click below to set your password and start using Vertical AI LMS.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${setPasswordUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Set My Password & Login</a>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">⚠️ This link expires in <strong>24 hours</strong>.</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">Your login email: <strong>${email}</strong></p>
        </div>
      </div>
    `,
  };

  try {
    if (canSend) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('[DEV MAIL: PARTNER APPROVED]', { email, setPasswordUrl });
    }
  } catch (err) {
    console.error('Error sending partner approved email:', err);
  }
};

export const sendPartnerRejectedEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: FROM,
    to: email,
    subject: `Your Channel Partner Request — Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">❌ Request Not Approved</h1>
        </div>
        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
          <p style="color: #374151;">We regret to inform you that your Channel Partner access request for Vertical AI LMS has not been approved at this time.</p>
          <p style="color: #374151;">If you believe this is a mistake or would like more information, please contact your administrator directly.</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">Thank you for your interest in Vertical AI.</p>
        </div>
      </div>
    `,
  };

  try {
    if (canSend) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('[DEV MAIL: PARTNER REJECTED]', { email, name });
    }
  } catch (err) {
    console.error('Error sending partner rejected email:', err);
  }
};

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
    subject: `New Account Request — ${userName} (${userRole})`,
    html: `
      <h2>New Account Request</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Role:</strong> ${userRole}</p>
      <p>Please review this request and take action:</p>
      <div style="margin: 20px 0;">
        <a href="${approveUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve Access</a>
        <a href="${denyUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Deny Access</a>
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
  const resetUrl = `${FRONTEND_URL()}/reset-password?token=${token}`;
  const mailOptions = {
    from: FROM,
    to: email,
    subject: `Password Reset Request — ${name}`,
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
    subject: `New Meeting Scheduled — ${leadName}`,
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
    subject: `Meeting Overdue — ${leadName}`,
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

export const sendChannelPartnerRequestEmail = async (
  salesHeadEmail: string,
  partnerName: string,
  email: string,
  token: string
) => {
  const approveUrl = `${process.env.APP_BASE_URL}/api/v1/auth/approve?token=${token}`;
  const denyUrl = `${process.env.APP_BASE_URL}/api/v1/auth/deny?token=${token}`;

  const mailOptions = {
    from: `"Vertical.AI CRM" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: salesHeadEmail,
    subject: `New Channel Partner Request — ${partnerName}`,
    html: `
      <h2>New Channel Partner Registration</h2>
      <p>A new person has registered as a Channel Partner and is awaiting your approval.</p>
      <p><strong>Name:</strong> ${partnerName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Please review and take action:</p>
      <div style="margin: 20px 0;">
        <a href="${approveUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve & Create Account</a>
        <a href="${denyUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Deny Request</a>
      </div>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${salesHeadEmail}, Partner: ${partnerName}, Action: Approval`);
      console.log(`Approve: ${approveUrl}`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending partner request email:', error);
  }
};

export const sendChannelPartnerApprovedEmail = async (
  email: string,
  name: string,
  username: string
) => {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const dummyPassword = 'LMS-TheVerticalAI';

  const mailOptions = {
    from: `"Vertical.AI Team" <${process.env.SMTP_USER || 'noreply@vertical.ai'}>`,
    to: email,
    subject: `Welcome to Vertical — Your Account is Ready!`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Congratulations! Your request to join as a Channel Partner has been approved.</p>
      <p>You can now log in to the LMS using the following credentials:</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Username:</strong> ${username} (or your email)</p>
        <p><strong>Temporary Password:</strong> <code>${dummyPassword}</code></p>
      </div>
      <p style="color: #ef4444; font-weight: bold;">Important: You will be required to reset your password upon your first login.</p>
      <p>Welcome aboard!</p>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [DEV MAIL LOG] ---');
      console.log(`To: ${email}, Msg: Account Approved, Credentials Sent.`);
      console.log('-----------------------');
    }
  } catch (error) {
    console.error('Error sending partner approved email:', error);
  }
};
