const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'htesting',
          mode: 'insensitive',
        },
      },
    })

    console.log('All users with "htesting" in email:')
    console.log('---')
    users.forEach(u => {
      console.log(`Email: "${u.email}"`)
      console.log(`  Role: ${u.role}`)
      console.log(`  Verified: ${u.emailVerified}`)
      console.log(`  Has Password: ${!!u.password}`)
      console.log('')
    })

    // Also check exact match
    const exactUser = await prisma.user.findUnique({
      where: { email: 'htesting22@gmail.com' },
    })

    if (exactUser) {
      console.log('✅ Exact match found for: htesting22@gmail.com')
    } else {
      console.log('❌ No exact match for: htesting22@gmail.com')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

