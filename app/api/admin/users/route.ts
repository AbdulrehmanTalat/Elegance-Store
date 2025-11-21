import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logAction, getClientInfo } from '@/lib/audit'

// GET - List all admins (SUPER_ADMIN only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!currentUser || (currentUser.role as string) !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'SUPER_ADMIN' as any }
                ]
            },
            include: {
                adminPermissions: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(admins)
    } catch (error) {
        console.error('Error fetching admins:', error)
        return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
    }
}

// POST - Create new admin (SUPER_ADMIN only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!currentUser || (currentUser.role as string) !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { email, name, password, role, permissions } = body

        // Validate required fields
        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newAdmin = await prisma.user.create({
            data: {
                email,
                name: name || null,
                password: hashedPassword,
                role: (role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN') as any,
                emailVerified: true,
            },
        })

        // Create permissions if ADMIN (SUPER_ADMIN gets all perms by default)
        if (role === 'ADMIN' && permissions) {
            await (prisma as any).adminPermissions.create({
                data: {
                    userId: newAdmin.id,
                    canAccessDashboard: true,
                    canManageProducts: permissions.canManageProducts || false,
                    canManageOrders: permissions.canManageOrders || false,
                    canManageUsers: permissions.canManageUsers || false,
                    canManageCoupons: permissions.canManageCoupons || false,
                    canManageSettings: permissions.canManageSettings || false,
                    canManageBlog: permissions.canManageBlog || false,
                    canManageAdmins: false,
                    canViewAuditLogs: false,
                },
            })
        } else if (role === 'SUPER_ADMIN') {
            await (prisma as any).adminPermissions.create({
                data: {
                    userId: newAdmin.id,
                    canAccessDashboard: true,
                    canManageProducts: true,
                    canManageOrders: true,
                    canManageUsers: true,
                    canManageCoupons: true,
                    canManageSettings: true,
                    canManageBlog: true,
                    canManageAdmins: true,
                    canViewAuditLogs: true,
                },
            })
        }

        // Log action
        const { ipAddress, userAgent } = getClientInfo(req)
        await logAction({
            userId: currentUser.id,
            action: 'CREATE' as any,
            entity: 'User',
            entityId: newAdmin.id,
            details: { email, role },
            ipAddress,
            userAgent,
        })

        return NextResponse.json({
            id: newAdmin.id,
            email: newAdmin.email,
            role: newAdmin.role,
        })
    } catch (error) {
        console.error('Error creating admin:', error)
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
    }
}
