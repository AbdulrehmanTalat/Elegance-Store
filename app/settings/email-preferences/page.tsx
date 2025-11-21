import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import EmailPreferences from '@/components/settings/EmailPreferences'

export const metadata = {
  title: 'Email Preferences | Elegance Store',
  description: 'Manage your email notification preferences',
}

export default async function EmailPreferencesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/settings/email-preferences')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <a href="/" className="hover:text-primary-600 transition">Home</a>
          <span>/</span>
          <a href="/profile" className="hover:text-primary-600 transition">Profile</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Email Preferences</span>
        </nav>

        <EmailPreferences />
      </div>
    </div>
  )
}
