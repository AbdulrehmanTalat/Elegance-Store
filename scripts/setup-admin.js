const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function setupAdmin() {
  try {
    console.log('=== Admin Setup Script ===\n')

    // Check for command line arguments
    let email, name, password
    
    if (process.argv.length >= 4) {
      // Command line arguments provided
      email = process.argv[2]
      password = process.argv[3]
      name = process.argv[4] || null
      console.log(`Using provided credentials:`)
      console.log(`Email: ${email}`)
      console.log(`Name: ${name || 'Not provided'}\n`)
    } else {
      // Interactive mode
      email = await question('Enter admin email: ')
      name = await question('Enter admin name (optional): ')
      password = await question('Enter admin password: ')
    }

    if (!email || !password) {
      console.error('Email and password are required!')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('\nUser already exists. Updating to admin...')
      const hashedPassword = await bcrypt.hash(password, 10)
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          emailVerified: true,
        },
      })
      console.log('\n✅ Admin updated successfully!')
      console.log(`Email: ${updatedUser.email}`)
      console.log(`Role: ${updatedUser.role}`)
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10)
      const admin = await prisma.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
        },
      })
      console.log('\n✅ Admin created successfully!')
      console.log(`Email: ${admin.email}`)
      console.log(`Role: ${admin.role}`)
    }
  } catch (error) {
    console.error('Error setting up admin:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

setupAdmin()

