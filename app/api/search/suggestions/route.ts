import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] })
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } }, // Case-insensitive by default in SQLite/Postgres usually, but depends on provider
                    { description: { contains: query } },
                    { category: { equals: query as any } }, // Exact match for category enum if possible, or partial if string
                ],
                isActive: true,
            },
            take: 5,
            select: {
                id: true,
                name: true,
                basePrice: true,
                image: true,
                category: true,
                colors: {
                    take: 1,
                    select: {
                        images: true,
                        variants: {
                            take: 1,
                            select: {
                                price: true,
                            }
                        }
                    }
                }
            },
        })

        const suggestions = products.map(product => {
            // Determine display price
            let price = product.basePrice
            if (product.colors?.[0]?.variants?.[0]?.price) {
                price = product.colors[0].variants[0].price
            }

            // Determine display image
            let image = product.image
            if (product.colors?.[0]?.images?.[0]) {
                image = product.colors[0].images[0]
            }

            return {
                id: product.id,
                name: product.name,
                price: price,
                image: image,
                category: product.category,
            }
        })

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ suggestions: [] }, { status: 500 })
    }
}
