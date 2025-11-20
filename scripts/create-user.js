const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser(email, password, name) {
    console.log(`\nCreating user: ${email}`)

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            console.log('⚠️ User already exists.')
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'USER',
                emailVerified: true, // Auto-verify for manual creation
            },
        })

        console.log('✅ User created successfully!')
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Role: ${user.role}`)

    } catch (error) {
        console.error('Error creating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

async function main() {
    await createUser('abdurrehmantalat@gmail.com', 'A7009674a!', 'Abdur Rehman')
}

main()
