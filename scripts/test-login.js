const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'htesting22@gmail.com'
    const password = 'A7009674a!'
    
    console.log('Testing login with:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('\n---\n')
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user) {
      console.log('❌ User not found!')
      console.log('Trying case-insensitive search...')
      
      // Try to find any user with similar email
      const allUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'htesting22',
            mode: 'insensitive',
          },
        },
      })
      
      if (allUsers.length > 0) {
        console.log('Found users with similar email:')
        allUsers.forEach(u => {
          console.log(`  - ${u.email} (Role: ${u.role}, Verified: ${u.emailVerified})`)
        })
      }
      return
    }

    console.log('✅ User found:')
    console.log('  Email:', user.email)
    console.log('  Role:', user.role)
    console.log('  Email Verified:', user.emailVerified)
    console.log('  Has Password:', !!user.password)
    console.log('  Password Length:', user.password?.length || 0)

    if (!user.password) {
      console.log('\n❌ User has no password!')
      console.log('Creating password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      console.log('✅ Password created!')
      return
    }

    // Test password
    console.log('\nTesting password...')
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password match:', isValid ? '✅ Valid' : '❌ Invalid')

    if (!isValid) {
      console.log('\n⚠️  Password doesn\'t match! Resetting password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: true,
          role: 'ADMIN',
        },
      })
      console.log('✅ Password reset and account updated!')
      
      // Test again
      const newUser = await prisma.user.findUnique({
        where: { id: user.id },
      })
      const isValidAfter = await bcrypt.compare(password, newUser.password)
      console.log('Password test after reset:', isValidAfter ? '✅ Valid' : '❌ Invalid')
    }

    // Final status
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
    })
    
    console.log('\n---\n')
    console.log('✅ Final Account Status:')
    console.log('  Email:', finalUser.email)
    console.log('  Role:', finalUser.role)
    console.log('  Email Verified:', finalUser.emailVerified)
    console.log('  Password Set:', !!finalUser.password)
    
    const finalTest = await bcrypt.compare(password, finalUser.password)
    console.log('  Password Test:', finalTest ? '✅ Valid' : '❌ Invalid')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()

