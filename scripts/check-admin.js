const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const email = 'htesting22@gmail.com'
    console.log('Checking admin account for:', email)
    
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ User not found!')
      console.log('Note: You typed "htesting22@gamil.com" but the account was created with "htesting22@gmail.com"')
      return
    }

    console.log('\n✅ User found:')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Email Verified:', user.emailVerified)
    console.log('Has Password:', !!user.password)
    console.log('Name:', user.name || 'Not set')

    // Test password
    const testPassword = 'A7009674a!'
    if (user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log('\nPassword test:', isValid ? '✅ Valid' : '❌ Invalid')
    }

    if (user.role !== 'ADMIN') {
      console.log('\n⚠️  User is not an ADMIN! Updating...')
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      })
      console.log('✅ Updated to ADMIN')
    }

    if (!user.emailVerified) {
      console.log('\n⚠️  Email not verified! Updating...')
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      })
      console.log('✅ Email verified')
    }

    console.log('\n✅ Admin account is ready!')
    console.log('Login with:')
    console.log('Email:', user.email)
    console.log('Password: A7009674a!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

