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

// Base URL for images - reads from EMAIL_IMAGE_BASE_URL environment variable
// For emails, we need a publicly accessible URL (not localhost)
// Set EMAIL_IMAGE_BASE_URL in your .env file or Vercel environment variables
const EMAIL_IMAGE_BASE_URL = process.env.EMAIL_IMAGE_BASE_URL || process.env.NEXTAUTH_URL || 'https://elegance-store-seven.vercel.app'
const STORE_NAME = 'Elegance Store'
const STORE_COLOR = '#ec4899'

// Helper function to get email image URL
const getEmailImageUrl = (imageName: string) => {
  // Ensure baseUrl doesn't have trailing slash and doesn't include localhost
  let baseUrl = EMAIL_IMAGE_BASE_URL.replace(/\/$/, '') // Remove trailing slash
  if (baseUrl.includes('localhost')) {
    baseUrl = baseUrl.replace('localhost:3000', 'elegance-store-seven.vercel.app')
  }
  return `${baseUrl}/email-images/${imageName}`
}

interface OrderItem {
  productName: string
  quantity: number
  price: number
  image?: string | null
  colorName?: string | null
  bandSize?: string | null
  cupSize?: string | null
  size?: string | null
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  totalAmount: number,
  shippingAddress: string,
  phone: string,
  items: OrderItem[],
  orderDate?: Date | string
) {
  try {
    // Debug: Log image URLs being used
    console.log('EMAIL_IMAGE_BASE_URL:', EMAIL_IMAGE_BASE_URL)
    console.log('Order items with images:', items.map(item => ({ name: item.productName, image: item.image })))
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
                      <img src="${getEmailImageUrl('banner-otp.png')}" alt="Elegant Lingerie Collection" style="width: 100%; height: 200px; object-fit: cover; display: block; background-color: #f3f4f6;" />
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${STORE_COLOR}; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Thank You For Your Order! 🎉</h2>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">We're thrilled to have you as our valued customer. Your order has been confirmed and is being processed.</p>
                      
                      <!-- Order Number -->
                      <div style="background-color: #f9fafb; border-left: 4px solid ${STORE_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Number:</strong> <span style="color: ${STORE_COLOR}; font-size: 18px; font-weight: bold;">${orderId}</span></p>
                        ${orderDate ? `<p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Date & Time:</strong> ${new Date(orderDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>` : ''}
                      </div>
                      
                      <!-- Order Items -->
                      <h3 style="color: #333333; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
                      ${items.map((item) => {
                        // Build image URL - handle both absolute and relative paths
                        let imageUrl = getEmailImageUrl('lingerie.png') // default fallback
                        if (item.image && item.image.trim()) {
                          const image = item.image.trim()
                          if (image.startsWith('http://') || image.startsWith('https://')) {
                            imageUrl = image
                          } else if (image.startsWith('/')) {
                            // Relative path like /uploads/image.jpg
                            const baseUrl = EMAIL_IMAGE_BASE_URL.replace(/\/$/, '') // Remove trailing slash
                            imageUrl = `${baseUrl}${image}`
                          } else {
                            // Just filename, assume it's in uploads
                            const baseUrl = EMAIL_IMAGE_BASE_URL.replace(/\/$/, '') // Remove trailing slash
                            imageUrl = `${baseUrl}/uploads/${image}`
                          }
                        }
                        
                        return `
                        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="100" style="vertical-align: top; padding-right: 15px;">
                                <img src="${imageUrl}" alt="${item.productName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; background-color: #f3f4f6; display: block;" />
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 8px 0; color: #333333; font-size: 16px; font-weight: 600;">${item.productName}</p>
                                ${item.colorName ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Color:</strong> ${item.colorName}</p>` : ''}
                                ${item.bandSize ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Band Size:</strong> ${item.bandSize}</p>` : ''}
                                ${item.cupSize ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Cup Size:</strong> ${item.cupSize}</p>` : ''}
                                ${!item.bandSize && !item.cupSize && item.size ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Size:</strong> ${item.size}</p>` : ''}
                                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                                <p style="margin: 0; color: ${STORE_COLOR}; font-size: 18px; font-weight: bold;">Rs ${(item.price * item.quantity).toFixed(2)}</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                        `
                      }).join('')}
                      
                      <!-- Shipping Address -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Shipping Address</h3>
                        <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; line-height: 1.6;">${shippingAddress.replace(/,/g, ',<br>')}</p>
                        <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
                      </div>
                      
                      <!-- Total Amount -->
                      <div style="background-color: ${STORE_COLOR}15; border: 2px solid ${STORE_COLOR}; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                        <p style="margin: 0; color: ${STORE_COLOR}; font-size: 32px; font-weight: bold;">Rs ${totalAmount.toFixed(2)}</p>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">We'll send you another email with tracking information once your order ships. You can also check your order status in your account.</p>
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

export async function sendAdminOrderNotificationEmail(
  adminEmail: string,
  orderId: string,
  totalAmount: number,
  customerEmail: string,
  shippingAddress: string,
  phone: string,
  items: OrderItem[],
  orderDate?: Date | string
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: `🆕 New Order Received - ${STORE_NAME} - Order #${orderId}`,
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">🆕 New Order Received</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${STORE_NAME} - Action Required</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Order Details</h2>
                      
                      <!-- Order Number -->
                      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Number:</strong> <span style="color: #10b981; font-size: 18px; font-weight: bold;">${orderId}</span></p>
                        ${orderDate ? `<p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Date & Time:</strong> ${new Date(orderDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>` : ''}
                        <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Customer Email:</strong> ${customerEmail}</p>
                        <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Total Amount:</strong> <span style="color: #10b981; font-size: 20px; font-weight: bold;">Rs ${totalAmount.toFixed(2)}</span></p>
                      </div>
                      
                      <!-- Order Items -->
                      <h3 style="color: #333333; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
                      ${items.map((item) => {
                        const sizeLabel = item.bandSize && item.cupSize 
                          ? `${item.bandSize} ${item.cupSize}`.trim()
                          : item.size || ''
                        
                        // Build image URL - handle both absolute and relative paths
                        let imageUrl = getEmailImageUrl('lingerie.png') // default fallback
                        if (item.image) {
                          if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
                            imageUrl = item.image
                          } else if (item.image.startsWith('/')) {
                            // Relative path like /uploads/image.jpg
                            imageUrl = `${EMAIL_IMAGE_BASE_URL}${item.image}`
                          } else {
                            // Just filename, assume it's in uploads
                            imageUrl = `${EMAIL_IMAGE_BASE_URL}/uploads/${item.image}`
                          }
                        }
                        
                        return `
                        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="80" style="vertical-align: top; padding-right: 12px;">
                                <img src="${imageUrl}" alt="${item.productName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; background-color: #f3f4f6; display: block;" />
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; color: #333333; font-size: 15px; font-weight: 600;">${item.productName}</p>
                                ${item.colorName ? `<p style="margin: 0 0 3px 0; color: #666666; font-size: 13px;"><strong>Color:</strong> ${item.colorName}</p>` : ''}
                                ${sizeLabel ? `<p style="margin: 0 0 3px 0; color: #666666; font-size: 13px;"><strong>Size:</strong> ${sizeLabel}</p>` : ''}
                                <p style="margin: 0 0 6px 0; color: #666666; font-size: 13px;"><strong>Quantity:</strong> ${item.quantity}</p>
                                <p style="margin: 0; color: #10b981; font-size: 16px; font-weight: bold;">Rs ${(item.price * item.quantity).toFixed(2)}</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                        `
                      }).join('')}
                      
                      <!-- Shipping Address -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Shipping Address</h3>
                        <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; line-height: 1.6;">${shippingAddress.replace(/,/g, ',<br>')}</p>
                        <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
                      </div>
                      
                      <!-- Action Required -->
                      <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">⚠️ Action Required</p>
                        <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px; line-height: 1.6;">Please process this order and update the status in the admin panel. Contact the sales team if needed.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">This is an automated notification from ${STORE_NAME}</p>
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
    console.error('Error sending admin notification email:', error)
  }
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  orderId: string,
  status: string,
  totalAmount: number,
  shippingAddress: string,
  phone: string,
  items: OrderItem[],
  orderDate?: Date | string
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
                      
                      <!-- Order Number and Date -->
                      <div style="background-color: #f9fafb; border-left: 4px solid ${STORE_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Number:</strong> <span style="color: ${STORE_COLOR}; font-size: 18px; font-weight: bold;">${orderId}</span></p>
                        ${orderDate ? `<p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong style="color: #333333;">Order Date & Time:</strong> ${new Date(orderDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>` : ''}
                      </div>
                      
                      <!-- Order Items -->
                      <h3 style="color: #333333; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
                      ${items.map((item) => {
                        // Build image URL - handle both absolute and relative paths
                        let imageUrl = getEmailImageUrl('lingerie.png') // default fallback
                        if (item.image && item.image.trim()) {
                          const image = item.image.trim()
                          if (image.startsWith('http://') || image.startsWith('https://')) {
                            imageUrl = image
                          } else if (image.startsWith('/')) {
                            // Relative path like /uploads/image.jpg
                            const baseUrl = EMAIL_IMAGE_BASE_URL.replace(/\/$/, '') // Remove trailing slash
                            imageUrl = `${baseUrl}${image}`
                          } else {
                            // Just filename, assume it's in uploads
                            const baseUrl = EMAIL_IMAGE_BASE_URL.replace(/\/$/, '') // Remove trailing slash
                            imageUrl = `${baseUrl}/uploads/${image}`
                          }
                        }
                        
                        return `
                        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="100" style="vertical-align: top; padding-right: 15px;">
                                <img src="${imageUrl}" alt="${item.productName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; background-color: #f3f4f6; display: block;" />
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 8px 0; color: #333333; font-size: 16px; font-weight: 600;">${item.productName}</p>
                                ${item.colorName ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Color:</strong> ${item.colorName}</p>` : ''}
                                ${item.bandSize ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Band Size:</strong> ${item.bandSize}</p>` : ''}
                                ${item.cupSize ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Cup Size:</strong> ${item.cupSize}</p>` : ''}
                                ${!item.bandSize && !item.cupSize && item.size ? `<p style="margin: 0 0 4px 0; color: #666666; font-size: 14px;"><strong>Size:</strong> ${item.size}</p>` : ''}
                                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                                <p style="margin: 0; color: ${STORE_COLOR}; font-size: 18px; font-weight: bold;">Rs ${(item.price * item.quantity).toFixed(2)}</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                        `
                      }).join('')}
                      
                      <!-- Shipping Address -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Shipping Address</h3>
                        <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; line-height: 1.6;">${shippingAddress.replace(/,/g, ',<br>')}</p>
                        <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
                      </div>
                      
                      <!-- Total Amount -->
                      <div style="background-color: ${STORE_COLOR}15; border: 2px solid ${STORE_COLOR}; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                        <p style="margin: 0; color: ${STORE_COLOR}; font-size: 32px; font-weight: bold;">Rs ${totalAmount.toFixed(2)}</p>
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

