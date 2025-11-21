import { User } from '@prisma/client'

export function isSuperAdmin(user: any): boolean {
    return user?.role === 'SUPER_ADMIN'
}

export function isAdmin(user: any): boolean {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
}

export function hasPermission(
    user: any,
    permission: string
): boolean {
    if (!user) return false

    // Super admins have all permissions
    if (isSuperAdmin(user)) return true

    // Check specific permission
    return user.adminPermissions?.[permission] === true
}

export function canAccessPage(
    user: any,
    page: string
): boolean {
    if (!user || !isAdmin(user)) return false

    // Super admins can access all pages
    if (isSuperAdmin(user)) return true

    // Map pages to permissions
    const pagePermissions: Record<string, string> = {
        '/admin/dashboard': 'canAccessDashboard',
        '/admin/products': 'canManageProducts',
        '/admin/orders': 'canManageOrders',
        '/admin/users': 'canManageUsers',
        '/admin/coupons': 'canManageCoupons',
        '/admin/manage-admins': 'canManageAdmins',
        '/admin/audit-logs': 'canViewAuditLogs',
        '/admin/settings': 'canManageSettings',
        '/admin/blog': 'canManageBlog',
    }

    const requiredPermission = pagePermissions[page]
    if (!requiredPermission) return false

    return hasPermission(user, requiredPermission)
}

export function getAccessiblePages(user: any): string[] {
    if (!user || !isAdmin(user)) return []

    const allPages = [
        '/admin/dashboard',
        '/admin/products',
        '/admin/orders',
        '/admin/users',
        '/admin/coupons',
        '/admin/manage-admins',
        '/admin/audit-logs',
        '/admin/settings',
        '/admin/blog',
    ]

    if (isSuperAdmin(user)) return allPages

    return allPages.filter(page => canAccessPage(user, page))
}
