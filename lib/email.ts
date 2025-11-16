import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Base URL for images - update this to your actual domain/CDN
// For emails, we need a publicly accessible URL (not localhost)
// Use EMAIL_IMAGE_BASE_URL for production, or NEXTAUTH_URL if it's a public domain
const EMAIL_IMAGE_BASE_URL = process.env.EMAIL_IMAGE_BASE_URL || process.env.NEXTAUTH_URL || 'https://your-domain.vercel.app'
const STORE_NAME = 'Elegance Store'
const STORE_COLOR = '#ec4899'

// Helper function to get email image URL
const getEmailImageUrl = (imageName: string) => {
  // Emails can't access localhost, so we need a public URL
  // In production, this should be your actual domain
  // For local testing, you'll need to deploy or use a CDN
  const baseUrl = EMAIL_IMAGE_BASE_URL.replace('localhost:3000', 'your-domain.vercel.app')
  return `${baseUrl}/email-images/${imageName}`
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  totalAmount: number
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Order Confirmation - ${STORE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header with Store Name -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${STORE_COLOR} 0%, #d946ef 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${STORE_NAME}</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Elegant Fashion & Beauty</p>
                    </td>
                  </tr>
                  
                  <!-- Promotional Banner -->
                  <tr>
                    <td style="padding: 0;">
                      <img src="${getEmailImageUrl('banner-order.jpg')}" alt="Elegant Lingerie Collection" style="width: 100%; height: 200px; object-fit: cover; display: block; background-color: #f3f4f6;" />
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${STORE_COLOR}; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Thank You For Your Order! 🎉</h2>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We're thrilled to have you as our valued customer. Your order has been confirmed and is being processed.</p>
                      
                      <!-- Order Details Box -->
                      <div style="background-color: #f9fafb; border-left: 4px solid ${STORE_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order ID:</strong> ${orderId}</p>
                        <p style="margin: 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Total Amount:</strong> <span style="color: ${STORE_COLOR}; font-size: 20px; font-weight: bold;">Rs ${totalAmount.toFixed(2)}</span></p>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">We'll send you another email with tracking information once your order ships. You can also check your order status in your account.</p>
                    </td>
                  </tr>
                  
                  <!-- Product Showcase -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <h3 style="color: #333333; font-size: 20px; margin: 0 0 20px 0; text-align: center;">Explore More Elegant Pieces</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="48%" style="padding-right: 2%;">
                            <img src="${getEmailImageUrl('lingerie.png')}" alt="Lingerie Collection" style="width: 100%; border-radius: 8px; margin-bottom: 10px; background-color: #f3f4f6;" />
                            <p style="text-align: center; color: #666666; font-size: 12px; margin: 0;">Lingerie Collection</p>
                          </td>
                          <td width="48%" style="padding-left: 2%;">
                            <img src="${getEmailImageUrl('bras.jpg')}" alt="Bra Collection" style="width: 100%; border-radius: 8px; margin-bottom: 10px; background-color: #f3f4f6;" />
                            <p style="text-align: center; color: #666666; font-size: 12px; margin: 0;">Bra Collection</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Questions? Contact us at <a href="mailto:${process.env.SMTP_FROM || process.env.SMTP_USER}" style="color: ${STORE_COLOR}; text-decoration: none;">${process.env.SMTP_FROM || process.env.SMTP_USER}</a></p>
                      <p style="color: #999999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  orderId: string,
  status: string
) {
  try {
    const statusColors: Record<string, string> = {
      'PENDING': '#f59e0b',
      'PROCESSING': '#3b82f6',
      'SHIPPED': '#10b981',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444',
    }
    const statusColor = statusColors[status.toUpperCase()] || STORE_COLOR
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Order Status Update - ${STORE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${STORE_COLOR} 0%, #d946ef 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${STORE_NAME}</h1>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${STORE_COLOR}; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Order Status Update</h2>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Your order status has been updated.</p>
                      
                      <!-- Status Badge -->
                      <div style="background-color: ${statusColor}15; border: 2px solid ${statusColor}; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Status</p>
                        <p style="margin: 0; color: ${statusColor}; font-size: 24px; font-weight: bold; text-transform: uppercase;">${status}</p>
                      </div>
                      
                      <div style="background-color: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order ID:</strong> ${orderId}</p>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">You can track your order status anytime from your account dashboard.</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Questions? Contact us at <a href="mailto:${process.env.SMTP_FROM || process.env.SMTP_USER}" style="color: ${STORE_COLOR}; text-decoration: none;">${process.env.SMTP_FROM || process.env.SMTP_USER}</a></p>
                      <p style="color: #999999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Verify Your Email - ${STORE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${STORE_COLOR} 0%, #d946ef 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${STORE_NAME}</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Elegant Fashion & Beauty</p>
                    </td>
                  </tr>
                  
                  <!-- Promotional Banner -->
                  <tr>
                    <td style="padding: 0;">
                      <img src="${getEmailImageUrl('banner-otp.png')}" alt="Welcome to Elegance Store" style="width: 100%; height: 200px; object-fit: cover; display: block; background-color: #f3f4f6;" />
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${STORE_COLOR}; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Welcome to ${STORE_NAME}! ✨</h2>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for signing up! Please verify your email address to complete your registration and start shopping our elegant collection.</p>
                      
                      <!-- OTP Box -->
                      <div style="background: linear-gradient(135deg, ${STORE_COLOR}15 0%, #d946ef15 100%); border: 2px dashed ${STORE_COLOR}; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px;">
                        <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                        <h1 style="color: ${STORE_COLOR}; font-size: 48px; letter-spacing: 12px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
                      </div>
                      
                      <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for your security.
                        </p>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">Enter this code on the verification page to complete your registration.</p>
                    </td>
                  </tr>
                  
                  <!-- Product Showcase -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <h3 style="color: #333333; font-size: 18px; margin: 0 0 20px 0; text-align: center;">Discover Our Collections</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="32%" style="padding-right: 2%;">
                            <img src="${getEmailImageUrl('lingerie.png')}" alt="Lingerie" style="width: 100%; border-radius: 8px; margin-bottom: 8px; background-color: #f3f4f6;" />
                            <p style="text-align: center; color: #666666; font-size: 11px; margin: 0;">Lingerie</p>
                          </td>
                          <td width="32%" style="padding: 0 1%;">
                            <img src="${getEmailImageUrl('bras.jpg')}" alt="Bras" style="width: 100%; border-radius: 8px; margin-bottom: 8px; background-color: #f3f4f6;" />
                            <p style="text-align: center; color: #666666; font-size: 11px; margin: 0;">Bras</p>
                          </td>
                          <td width="32%" style="padding-left: 2%;">
                            <img src="${getEmailImageUrl('jewelry.jpg')}" alt="Jewelry" style="width: 100%; border-radius: 8px; margin-bottom: 8px; background-color: #f3f4f6;" />
                            <p style="text-align: center; color: #666666; font-size: 11px; margin: 0;">Jewelry</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0; line-height: 1.6;">If you didn't request this verification code, please ignore this email or contact our support team.</p>
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Questions? <a href="mailto:${process.env.SMTP_FROM || process.env.SMTP_USER}" style="color: ${STORE_COLOR}; text-decoration: none;">Contact Us</a></p>
                      <p style="color: #999999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw error
  }
}

