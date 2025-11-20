import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate input
        const result = contactSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            )
        }

        const { name, email, subject, message } = result.data

        // Send email notification
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        // Send to admin
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to admin email
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; margin-bottom: 5px; }
            .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ec4899; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${name} (${email})</div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="footer">
                <p>You can reply directly to this email to respond to ${name}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
        })

        // Send confirmation to user
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'We received your message - Elegance Store',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for contacting Elegance Store. We have received your message and will get back to you as soon as possible.</p>
              
              <div class="message">
                <strong>Your message:</strong><br>
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <p>We typically respond within 24-48 hours.</p>
              <p>Best regards,<br>The Elegance Store Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
        })

        return NextResponse.json({ success: true, message: 'Message sent successfully' })
    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to send message. Please try again.' },
            { status: 500 }
        )
    }
}
