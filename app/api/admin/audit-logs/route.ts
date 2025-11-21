import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch audit logs (SUPER_ADMIN only)
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
            return NextResponse.json({ error: 'Forbidden - SUPER_ADMIN only' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const action = searchParams.get('action')
        const entity = searchParams.get('entity')
        const userId = searchParams.get('userId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const where: any = {}

        if (action) where.action = action
        if (entity) where.entity = entity
        if (userId) where.userId = userId
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate)
        }

        const [logs, total] = await Promise.all([
            (prisma as any).auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            (prisma as any).auditLog.count({ where }),
        ])

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }
}
