import { Resend } from 'resend';
import { CreateEmailOptions } from 'resend';
import { getSiteSettings } from '@/lib/server-api';

const resend = new Resend(process.env.RESEND_API_KEY);

const { siteName } = await getSiteSettings();

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
      text,
    } as CreateEmailOptions);
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendApprovalEmail({
  userEmail,
  userName,
  approvalToken,
}: {
  userEmail: string;
  userName: string;
  approvalToken: string;
}) {
  const subject = 'Account Registration - Approval Required';
  const html = `
    <h1>New User Registration</h1>
    <p>A new user has registered and requires approval:</p>
    <ul>
      <li><strong>Name:</strong> ${userName}</li>
      <li><strong>Email:</strong> ${userEmail}</li>
    </ul>
    <p>Approval Token: <code>${approvalToken}</code></p>
    <p>Please log in to the superadmin dashboard to approve this user.</p>
  `;

  return sendEmail({
    to: process.env.SUPER_ADMIN_EMAIL!,
    subject,
    html,
  });
}

export async function sendApprovalConfirmationEmail({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const subject = `Account Approved - Welcome to ${siteName}`;
  const html = `
    <h1>Welcome to ${siteName}!</h1>
    <p>Hi ${userName},</p>
    <p>Your account has been approved and is now active.</p>
    <p>You can now log in and start using our services.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login">Login Now</a></p>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
  });
}
