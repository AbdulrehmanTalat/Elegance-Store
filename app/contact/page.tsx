import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Elegance Store',
  description: 'Get in touch with Elegance Store for any questions or support',
}

export default function ContactPage() {
  const contactEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'support@elegancestore.com'

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-4">
              We'd love to hear from you! If you have any questions, concerns, or feedback, 
              please don't hesitate to reach out to us.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Email Us</h3>
            <p className="text-gray-600 mb-2">
              Send us an email at:
            </p>
            <a 
              href={`mailto:${contactEmail}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {contactEmail}
            </a>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Response Time</h3>
            <p className="text-gray-600">
              We typically respond to all inquiries within 24-48 hours during business days.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
            <p className="text-gray-600">
              Monday - Friday: 9:00 AM - 6:00 PM<br />
              Saturday: 10:00 AM - 4:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

