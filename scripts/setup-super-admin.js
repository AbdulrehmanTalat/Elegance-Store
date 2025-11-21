const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function promoteSuperAdmin() {
    try {
        const email = 'htesting22@gmail.com'

        // Update user role to SUPER_ADMIN
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'SUPER_ADMIN',
            },
        })

        console.log(`✅ User ${email} promoted to SUPER_ADMIN`)

        // Create full admin permissions
        await prisma.adminPermissions.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                canAccessDashboard: true,
                canManageProducts: true,
                canManageOrders: true,
                canManageUsers: true,
                canManageCoupons: true,
                canManageAdmins: true,
                canViewAuditLogs: true,
                canManageSettings: true,
                canManageBlog: true,
            },
            update: {
                canAccessDashboard: true,
                canManageProducts: true,
                canManageOrders: true,
                canManageUsers: true,
                canManageCoupons: true,
                canManageAdmins: true,
                canViewAuditLogs: true,
                canManageSettings: true,
                canManageBlog: true,
            },
        })

        console.log(`✅ Full admin permissions granted to ${email}`)

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'CREATE',
                entity: 'AdminPermissions',
                entityId: user.id,
                details: {
                    message: 'Initial Super Admin setup',
                    permissions: 'ALL',
                },
            },
        })

        console.log('✅ Audit log created')
        console.log('\n🎉 Super Admin setup complete!')

    } catch (error) {
        console.error('❌ Error promoting user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

promoteSuperAdmin()
