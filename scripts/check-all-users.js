const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'admin',
          mode: 'insensitive',
        },
      },
    })

    console.log('All users with "admin" in email:')
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
      where: { email: 'admin@elegancestore.online' },
    })

    if (exactUser) {
      console.log('✅ Exact match found for: admin@elegancestore.online')
    } else {
      console.log('❌ No exact match for: admin@elegancestore.online')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

