import { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Shield, Lock, Eye, UserCheck, Mail, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Elegance Store',
  description: 'Learn how Elegance Store collects, uses, and protects your personal information. Your privacy and data security are our top priorities.',
  alternates: {
    canonical: 'https://elegance-store.vercel.app/privacy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs
          items={[
            { name: 'Privacy Policy', href: '/privacy' },
          ]}
        />

        <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="text-primary-600" size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">Privacy Policy</span>
            </h1>
            <p className="text-gray-600">
              Last Updated: November 21, 2024
            </p>
          </div>

          {/* Intro */}
          <div className="mb-8 p-6 bg-primary-50 rounded-lg border-l-4 border-primary-600">
            <p className="text-gray-700 leading-relaxed">
              At Elegance Store, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or make a purchase.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 rounded-lg p-2">
                  <UserCheck className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">1. Information We Collect</h2>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">When you create an account or place an order, we collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name and contact information (email, phone number)</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through our payment gateway)</li>
                <li>Order history and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Automatically Collected Information</h3>
              <p className="text-gray-700 mb-4">When you visit our website, we automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Browser type and version</li>
                <li>IP address and device information</li>
                <li>Pages visited and time spent on site</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 rounded-lg p-2">
                  <Eye className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">2. How We Use Your Information</h2>
              </div>
              
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Process Orders:</strong> Fulfill and deliver your purchases</li>
                <li><strong>Communication:</strong> Send order confirmations, shipping updates, and customer service messages</li>
                <li><strong>Marketing:</strong> Send promotional emails about new products and offers (you can opt-out anytime)</li>
                <li><strong>Improve Service:</strong> Analyze website usage to enhance user experience</li>
                <li><strong>Fraud Prevention:</strong> Detect and prevent fraudulent transactions</li>
                <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 rounded-lg p-2">
                  <Lock className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">3. Payment Security</h2>
              </div>
              
              <p className="text-gray-700 mb-4">
                We take payment security seriously. All payment transactions are processed through secure, encrypted connections using industry-standard SSL technology.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We never store complete credit card information on our servers</li>
                <li>Payment processing is handled by trusted third-party providers</li>
                <li>All sensitive data is encrypted during transmission</li>
                <li>We comply with PCI-DSS requirements for payment security</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>
              
              <p className="text-gray-700 mb-4">We do not sell or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">We share information with trusted third parties who help us operate our business:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Payment Processors:</strong> To process your payments securely</li>
                <li><strong>Shipping Partners:</strong> To deliver your orders</li>
                <li><strong>Email Services:</strong> To send you order updates and newsletters</li>
                <li><strong>Analytics Providers:</strong> To understand website usage</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose your information if required by law, court order, or to protect our rights, property, or safety.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking Technologies</h2>
              
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Remember your preferences and shopping cart</li>
                <li>Analyze site traffic and user behavior</li>
                <li>Personalize content and advertisements</li>
                <li>Improve website functionality</li>
              </ul>

              <p className="text-gray-700 mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our website.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights and Choices</h2>
              
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              </ul>

              <p className="text-gray-700 mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@elegancestore.com" className="text-primary-600 hover:underline">privacy@elegancestore.com</a>
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
              
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Order information is typically retained for 7 years for tax and accounting purposes.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
              
              <p className="text-gray-700">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">9. Security Measures</h2>
              
              <p className="text-gray-700 mb-4">We implement various security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers with regular security updates</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training on data protection</li>
              </ul>

              <p className="text-gray-700 mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">10. Third-Party Links</h2>
              
              <p className="text-gray-700">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
              
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-primary-200">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Email:</strong> <a href="mailto:privacy@elegancestore.com" className="text-primary-600 hover:underline">privacy@elegancestore.com</a></li>
                    <li><strong>Support:</strong> <a href="mailto:support@elegancestore.com" className="text-primary-600 hover:underline">support@elegancestore.com</a></li>
                    <li><strong>Contact Form:</strong> <a href="/contact" className="text-primary-600 hover:underline">Visit our Contact Page</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-green-600" size={24} />
                <p className="text-green-800 font-semibold m-0">
                  Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="/products"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            Shop with Confidence
          </a>
        </div>
      </div>
    </div>
  )
}
