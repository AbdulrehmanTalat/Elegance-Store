import { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Elegance Store',
  description: 'Find answers to common questions about ordering, shipping, returns, sizing, and product care at Elegance Store.',
  keywords: ['FAQ', 'help', 'customer service', 'shipping info', 'returns', 'sizing guide'],
  alternates: {
    canonical: 'https://elegance-store.vercel.app/faq',
  },
}

const faqs = [
  {
    category: 'Ordering & Payment',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, and Cash on Delivery (COD) for orders in Pakistan. All online payments are processed securely through our encrypted payment gateway.',
      },
      {
        question: 'How do I place an order?',
        answer: 'Simply browse our products, select your desired items, choose size and color, add to cart, and proceed to checkout. You can check out as a guest or create an account for faster future purchases.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'You can modify or cancel your order within 2 hours of placement by contacting our customer service. After this time, orders enter processing and cannot be changed.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your complete card details on our servers.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free shipping on all orders across Pakistan with no minimum purchase required.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-5 business days for major cities and 5-7 business days for other areas. Express delivery (1-2 days) is available for an additional fee.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within Pakistan. International shipping will be available soon.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can also track your order by logging into your account.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy on all items. Products must be unused, unwashed, and in original packaging with tags attached.',
      },
      {
        question: 'How do I return an item?',
        answer: 'Contact our customer service to initiate a return. We\'ll provide you with a return shipping label. Once we receive and inspect the item, we\'ll process your refund within 5-7 business days.',
      },
      {
        question: 'Can I exchange an item?',
        answer: 'Yes! Exchanges are available for different sizes or colors within 30 days. Contact us to arrange an exchange.',
      },
      {
        question: 'Are there any items that cannot be returned?',
        answer: 'For hygiene reasons, opened makeup products and worn undergarments cannot be returned. All other items are eligible for return if conditions are met.',
      },
    ],
  },
  {
    category: 'Sizing & Fit',
    questions: [
      {
        question: 'How do I find my bra size?',
        answer: 'Measure around your ribcage (band size) and around the fullest part of your bust (cup size). Refer to our detailed sizing guide or contact us for personalized assistance.',
      },
      {
        question: 'What if I\'m between sizes?',
        answer: 'We recommend sizing up for comfort. Our customer service team can also provide personalized recommendations based on the specific product.',
      },
      {
        question: 'Do you offer plus sizes?',
        answer: 'Yes, we offer extended sizing in our lingerie collection. Check individual product pages for available sizes.',
      },
      {
        question: 'Are your sizes true to fit?',
        answer: 'Yes, our products generally fit true to size. However, some styles may run small or large - check the product description for specific fit notes.',
      },
    ],
  },
  {
    category: 'Product Care',
    questions: [
      {
        question: 'How should I wash my lingerie?',
        answer: 'Hand wash in cold water with mild detergent. Never use a dryer - air dry flat. For detailed care instructions, visit our blog article on lingerie care.',
      },
      {
        question: 'How do I care for jewelry?',
        answer: 'Store in a dry place away from direct sunlight. Clean with a soft cloth. Avoid contact with water, perfume, and chemicals to maintain shine.',
      },
      {
        question: 'How long does makeup last?',
        answer: 'Unopened makeup lasts 2-3 years when stored properly. Once opened, use within 6-12 months for best results. Check product packaging for specific expiration dates.',
      },
      {
        question: 'Can I wash all lingerie in a machine?',
        answer: 'While hand washing is recommended, you can machine wash most items on a delicate cycle in a mesh bag. However, hand washing extends product life significantly.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        question: 'Do I need an account to shop?',
        answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save favorite items, and checkout faster.',
      },
      {
        question: 'How is my personal information used?',
        answer: 'We only use your information to process orders and improve your shopping experience. We never sell your data to third parties. See our Privacy Policy for details.',
      },
      {
        question: 'Can I change my account information?',
        answer: 'Yes, log into your account and go to Account Settings to update your personal information, shipping address, and password.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page. Enter your email and we\'ll send you a link to reset your password.',
      },
    ],
  },
]

export default function FAQPage() {
  // Generate FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap(category =>
      category.questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      }))
    ),
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs
          items={[
            { name: 'FAQ', href: '/faq' },
          ]}
        />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Frequently Asked Questions</span>
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary-600">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group border-b border-gray-200 pb-4 last:border-0"
                  >
                    <summary className="flex items-start justify-between cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4 group-open:text-primary-600 transition">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className="flex-shrink-0 mt-1 text-gray-500 group-open:rotate-180 transition-transform"
                        size={20}
                      />
                    </summary>
                    <p className="mt-4 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg mb-6">
            Our customer service team is here to help you
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
