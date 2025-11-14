const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyAdminEmail() {
  try {
    const email = 'htesting22@gmail.com'
    console.log('Verifying email for admin:', email)
    
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('Current status:')
    console.log('Email Verified:', user.emailVerified)
    console.log('Role:', user.role)

    // Update email verification
    const updated = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        role: 'ADMIN', // Ensure role is ADMIN
      },
    })

    console.log('\n✅ Admin account updated!')
    console.log('Email Verified:', updated.emailVerified)
    console.log('Role:', updated.role)
    console.log('\nYou can now login with:')
    console.log('Email:', updated.email)
    console.log('Password: A7009674a!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminEmail()

