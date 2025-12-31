/**
 * Email Service - Nodemailer Integration
 */

import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import logger from './logger.service';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const templates = {
  welcome: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to NEURAFIELD QUANTUM</h1>
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p>Welcome to the future of AI-powered content creation! Your account has been successfully created.</p>
          <p>You now have access to:</p>
          <ul>
            <li>200+ AI providers</li>
            <li>500+ models for video, image, audio, and 3D generation</li>
            <li>Advanced Cinematix Engine with 12 filmmaking innovations</li>
            <li>Collaborative social platform</li>
          </ul>
          <p>You've received <strong>{{credits}} free credits</strong> to get started!</p>
          <a href="{{appUrl}}/dashboard" class="button">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 NEURAFIELD QUANTUM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  jobComplete: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #0072ff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .success { color: #22c55e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Your Job is Complete!</h1>
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p class="success">Great news! Your {{type}} generation job has been completed successfully.</p>
          <p><strong>Job Details:</strong></p>
          <ul>
            <li>Job ID: {{jobId}}</li>
            <li>Type: {{type}}</li>
            <li>Provider: {{provider}}</li>
            <li>Duration: {{duration}}</li>
          </ul>
          <a href="{{appUrl}}/jobs/{{jobId}}" class="button">View Result</a>
        </div>
      </div>
    </body>
    </html>
  `,

  jobFailed: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .error { color: #ef4444; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Job Failed</h1>
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p class="error">Unfortunately, your {{type}} generation job has failed.</p>
          <p><strong>Error Details:</strong></p>
          <p>{{error}}</p>
          <p>Your credits have been refunded. Please try again or contact support if the issue persists.</p>
          <a href="{{appUrl}}/dashboard" class="button">Try Again</a>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="{{resetUrl}}" class="button">Reset Password</a>
          <p class="warning">⚠️ This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  paymentSuccess: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { color: #22c55e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Successful</h1>
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p class="success">Thank you for your payment!</p>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li>Amount: ${{amount}}</li>
            <li>Plan: {{plan}}</li>
            <li>Credits Added: {{credits}}</li>
            <li>Transaction ID: {{transactionId}}</li>
          </ul>
          <p>Your new credits are now available in your account.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export class EmailService {
  /**
   * Send email
   */
  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      await transporter.sendMail({
        from: `"NEURAFIELD QUANTUM" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      logger.info('Email sent successfully', { to, subject });
    } catch (error: any) {
      logger.error('Failed to send email', { error: error.message, to, subject });
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(
    email: string,
    name: string,
    credits: number
  ): Promise<void> {
    const template = Handlebars.compile(templates.welcome);
    const html = template({
      name: name || 'there',
      credits,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    });

    await this.sendEmail(
      email,
      '🚀 Welcome to NEURAFIELD QUANTUM!',
      html
    );
  }

  /**
   * Send job completion email
   */
  static async sendJobCompleteEmail(
    email: string,
    name: string,
    job: {
      id: string;
      type: string;
      provider: string;
      duration: string;
    }
  ): Promise<void> {
    const template = Handlebars.compile(templates.jobComplete);
    const html = template({
      name: name || 'there',
      jobId: job.id,
      type: job.type,
      provider: job.provider,
      duration: job.duration,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    });

    await this.sendEmail(
      email,
      '✅ Your Job is Complete!',
      html
    );
  }

  /**
   * Send job failure email
   */
  static async sendJobFailedEmail(
    email: string,
    name: string,
    job: {
      type: string;
      error: string;
    }
  ): Promise<void> {
    const template = Handlebars.compile(templates.jobFailed);
    const html = template({
      name: name || 'there',
      type: job.type,
      error: job.error,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    });

    await this.sendEmail(
      email,
      '❌ Job Failed',
      html
    );
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<void> {
    const template = Handlebars.compile(templates.passwordReset);
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = template({
      name: name || 'there',
      resetUrl,
    });

    await this.sendEmail(
      email,
      '🔒 Password Reset Request',
      html
    );
  }

  /**
   * Send payment success email
   */
  static async sendPaymentSuccessEmail(
    email: string,
    name: string,
    payment: {
      amount: number;
      plan: string;
      credits: number;
      transactionId: string;
    }
  ): Promise<void> {
    const template = Handlebars.compile(templates.paymentSuccess);
    const html = template({
      name: name || 'there',
      amount: (payment.amount / 100).toFixed(2),
      plan: payment.plan,
      credits: payment.credits,
      transactionId: payment.transactionId,
    });

    await this.sendEmail(
      email,
      '💳 Payment Successful',
      html
    );
  }

  /**
   * Send custom email
   */
  static async sendCustomEmail(
    to: string,
    subject: string,
    templateData: Record<string, any>,
    templateHtml: string
  ): Promise<void> {
    const template = Handlebars.compile(templateHtml);
    const html = template(templateData);

    await this.sendEmail(to, subject, html);
  }

  /**
   * Verify email configuration
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error: any) {
      logger.error('Email service connection failed', { error: error.message });
      return false;
    }
  }
}
