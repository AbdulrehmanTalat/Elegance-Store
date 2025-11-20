const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verifyLogin(email, password) {
    console.log(`\nVerifying login for: ${email}`)

    try {
        const normalizedEmail = email.trim().toLowerCase()

        // 1. Find user
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive',
                },
            },
        })

        if (!user) {
            console.log('❌ User not found in database.')
            return
        }

        console.log('✅ User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            hasPassword: !!user.password
        })

        // 2. Check password
        if (!user.password) {
            console.log('❌ User has no password set.')
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (isPasswordValid) {
            console.log('✅ Password is VALID.')
        } else {
            console.log('❌ Password is INVALID.')
        }

        // 3. Check verification status
        if (!user.emailVerified && user.role !== 'ADMIN') {
            console.log('⚠️ User email is NOT verified. Login would fail with "Please verify your email first".')
        } else {
            console.log('✅ User email verification check passed.')
        }

    } catch (error) {
        console.error('Error verifying login:', error)
    } finally {
        await prisma.$disconnect()
    }
}

async function main() {
    await verifyLogin('abdurrehmantalat@gmail.com', 'A7009674a!')
    await verifyLogin('htesting22@gmail.com', 'A7009674a!')
}

main()
