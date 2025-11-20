import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'week' // today, week, month, year

        // Calculate date range
        let startDate: Date
        const endDate = endOfDay(new Date())

        switch (period) {
            case 'today':
                startDate = startOfDay(new Date())
                break
            case 'week':
                startDate = startOfWeek(new Date())
                break
            case 'month':
                startDate = startOfMonth(new Date())
                break
            case 'year':
                startDate = startOfYear(new Date())
                break
            default:
                startDate = startOfWeek(new Date())
        }

        // Fetch orders in the period
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        // Calculate total revenue
        const totalRevenue = orders
            .filter((order: any) => order.paymentStatus === 'COMPLETED')
            .reduce((sum: number, order: any) => sum + order.totalAmount, 0)

        // Calculate previous period revenue for comparison
        const periodDuration = endDate.getTime() - startDate.getTime()
        const prevStartDate = new Date(startDate.getTime() - periodDuration)

        const prevOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: prevStartDate,
                    lt: startDate,
                },
                paymentStatus: 'COMPLETED',
            },
        })

        const prevRevenue = prevOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
        const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

        // Order counts by status
        const ordersByStatus = {
            total: orders.length,
            pending: orders.filter((o: any) => o.status === 'PENDING').length,
            confirmed: orders.filter((o: any) => o.status === 'CONFIRMED').length,
            processing: orders.filter((o: any) => o.status === 'PROCESSING').length,
            shipped: orders.filter((o: any) => o.status === 'SHIPPED').length,
            delivered: orders.filter((o: any) => o.status === 'DELIVERED').length,
            cancelled: orders.filter((o: any) => o.status === 'CANCELLED').length,
        }

        // New customers in period
        const newCustomers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                role: 'USER',
            },
        })

        // Average order value
        const completedOrders = orders.filter((o: any) => o.paymentStatus === 'COMPLETED')
        const avgOrderValue = completedOrders.length > 0
            ? totalRevenue / completedOrders.length
            : 0

        // Sales trends (daily breakdown for last 7-30 days)
        const daysToShow = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365
        const salesTrends = []

        for (let i = daysToShow - 1; i >= 0; i--) {
            const day = subDays(new Date(), i)
            const dayStart = startOfDay(day)
            const dayEnd = endOfDay(day)

            const dayOrders = orders.filter(
                (o: any) => o.createdAt >= dayStart && o.createdAt <= dayEnd && o.paymentStatus === 'COMPLETED'
            )

            salesTrends.push({
                date: day.toISOString().split('T')[0],
                revenue: dayOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
                orders: dayOrders.length,
            })
        }

        // Revenue by category
        const revenueByCategory: { [key: string]: number } = {}

        orders.forEach((order: any) => {
            if (order.paymentStatus === 'COMPLETED') {
                order.items.forEach((item: any) => {
                    const category = item.product.category
                    revenueByCategory[category] = (revenueByCategory[category] || 0) + item.price * item.quantity
                })
            }
        })

        // Top selling products
        const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

        orders.forEach((order: any) => {
            if (order.paymentStatus === 'COMPLETED') {
                order.items.forEach((item: any) => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            name: item.product.name,
                            quantity: 0,
                            revenue: 0,
                        }
                    }
                    productSales[item.productId].quantity += item.quantity
                    productSales[item.productId].revenue += item.price * item.quantity
                })
            }
        })

        const topProducts = Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        })

        return NextResponse.json({
            metrics: {
                totalRevenue,
                revenueChange,
                orderCount: orders.length,
                orderChange: prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0,
                newCustomers,
                avgOrderValue,
            },
            ordersByStatus,
            salesTrends,
            revenueByCategory: Object.entries(revenueByCategory).map(([category, revenue]) => ({
                category,
                revenue,
            })),
            topProducts,
            recentOrders: recentOrders.map((order: any) => ({
                id: order.id,
                customerName: order.user.name || 'Guest',
                amount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
            })),
        })
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
