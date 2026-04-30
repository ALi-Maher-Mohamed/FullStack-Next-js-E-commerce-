import nodemailer from "nodemailer";

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, name, token) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #4f46e5; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        .token-box { background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ShopHub! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering! Please verify your email address to complete your registration.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link:</p>
          <div class="token-box">
            ${verificationUrl}
          </div>
          <p><strong>⚠️ This link will expire in 24 hours.</strong></p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ShopHub" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address - ShopHub",
    html,
  });
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #4f46e5; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ShopHub! 🎊</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your email has been verified successfully!</p>
          <p>You can now:</p>
          <ul>
            <li>✅ Browse our products</li>
            <li>✅ Add items to cart</li>
            <li>✅ Place orders</li>
            <li>✅ Track your orders</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping →</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ShopHub" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome to ShopHub! 🎉",
    html,
  });
}
