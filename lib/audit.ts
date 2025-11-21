import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'

interface LogActionParams {
    userId: string
    action: AuditAction
    entity: string
    entityId?: string
    details?: any
    ipAddress?: string
    userAgent?: string
}

export async function logAction(params: LogActionParams) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details || {},
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            },
        })
    } catch (error) {
        console.error('Failed to log audit action:', error)
        // Don't throw - audit logging shouldn't break the app
    }
}

export function getClientInfo(req: Request) {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    return { ipAddress: ip, userAgent }
}
