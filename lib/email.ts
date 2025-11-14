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

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  totalAmount: number
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">Thank you for your order!</h2>
          <p>Your order has been confirmed.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          <p>We will send you another email when your order ships.</p>
        </div>
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
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Order Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">Order Status Update</h2>
          <p>Your order status has been updated.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>New Status:</strong> ${status}</p>
        </div>
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
      subject: 'Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">Email Verification</h2>
          <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #ec4899; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw error
  }
}

