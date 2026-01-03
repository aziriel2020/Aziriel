/**
 * EMAIL SERVICE
 * =============
 * Complete email system using SendGrid
 * - Transactional emails
 * - Email templates
 * - Verification emails
 * - Password reset emails
 * - Notification emails
 * - Marketing emails
 */

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@neurafield.ai';
const FROM_NAME = process.env.FROM_NAME || 'Neurafield';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://neurafield.ai';

export class EmailService {
  /**
   * Send raw email
   */
  static async send(
    to: string | string[],
    subject: string,
    html: string,
    options: {
      text?: string;
      attachments?: any[];
      cc?: string[];
      bcc?: string[];
    } = {}
  ): Promise<void> {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      html,
      text: options.text,
      attachments: options.attachments,
      cc: options.cc,
      bcc: options.bcc,
    };

    try {
      await sgMail.send(msg as any);
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error: any) {
      console.error('SendGrid error:', error.response?.body || error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Neurafield</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>

    <p>Welcome to Neurafield! We're excited to have you on board.</p>

    <p>Please click the button below to verify your email address and activate your account:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Verify Email
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you didn't create an account with Neurafield, you can safely ignore this email.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, 'Verify Your Email Address', html);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Neurafield</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

    <p>We received a request to reset the password for your Neurafield account.</p>

    <p>Click the button below to reset your password:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This link will expire in 1 hour for security reasons.
    </p>

    <p style="color: #666; font-size: 14px;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, 'Reset Your Password', html);
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Neurafield</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Neurafield! 🚀</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>

    <p>Welcome to the world's most advanced AI video generation and social media management platform!</p>

    <h3>You now have access to:</h3>

    <ul style="color: #555;">
      <li><strong>15 AI Video Models</strong> - Generate videos with Sora, Runway, Veo, and more</li>
      <li><strong>Hollywood Cinematography Tools</strong> - Professional lens physics & film emulation</li>
      <li><strong>6 AI Innovations</strong> - Voice editing, translation, storyboards, and more</li>
      <li><strong>Social Media Suite</strong> - Stream, publish, and analyze across all platforms</li>
      <li><strong>100 Free Credits</strong> - Start creating immediately!</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Start Creating
      </a>
    </div>

    <h3>Get Started:</h3>
    <ol style="color: #555;">
      <li>Explore the video generation models</li>
      <li>Try the AI storyboard generator</li>
      <li>Connect your social media accounts</li>
      <li>Generate your first video!</li>
    </ol>

    <p style="margin-top: 30px;">Need help? Check out our <a href="${FRONTEND_URL}/docs" style="color: #667eea;">documentation</a> or contact support at support@neurafield.ai</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, 'Welcome to Neurafield - Let\'s Create Something Amazing!', html);
  }

  /**
   * Send job completed notification
   */
  static async sendJobCompletedEmail(
    email: string,
    jobType: string,
    resultUrl: string
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${jobType} is Ready!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Your Video is Ready! ✨</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <p>Great news! Your ${jobType} has completed successfully.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resultUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        View Result
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      You can view and download your result at any time from your dashboard.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, `Your ${jobType} is Ready!`, html);
  }

  /**
   * Send subscription confirmation
   */
  static async sendSubscriptionConfirmation(
    email: string,
    plan: string,
    amount: number
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Subscription Confirmed 🎉</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <p>Thank you for subscribing to Neurafield ${plan}!</p>

    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Subscription Details:</h3>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}/month</p>
      <p><strong>Billing Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <p>Your account has been upgraded and you now have access to all ${plan} features!</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Go to Dashboard
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, 'Subscription Confirmed - Welcome to Neurafield ' + plan, html);
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedEmail(email: string, reason: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc3545; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Payment Failed</h1>
  </div>

  <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
    <p>We were unable to process your recent payment.</p>

    <p><strong>Reason:</strong> ${reason}</p>

    <p>Please update your payment method to continue using Neurafield without interruption.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${FRONTEND_URL}/settings/billing" style="background: #dc3545; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Update Payment Method
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      If you have any questions, please contact our support team at support@neurafield.ai
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Neurafield. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.send(email, 'Payment Failed - Action Required', html);
  }

  /**
   * Send bulk email (for marketing)
   */
  static async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string
  ): Promise<void> {
    // SendGrid allows up to 1000 recipients per send
    const chunkSize = 1000;

    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      await this.send(chunk, subject, html);
    }
  }
}
