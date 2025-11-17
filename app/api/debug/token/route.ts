import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    const tokenExp = typeof token.exp === 'number' ? token.exp : null
    const now = Math.floor(Date.now() / 1000)
    const daysFromNow = tokenExp ? Math.floor((tokenExp - now) / (24 * 60 * 60)) : null

    return NextResponse.json({
      token: {
        id: token.id,
        email: token.email,
        role: token.role,
        exp: tokenExp,
        expDate: tokenExp ? new Date(tokenExp * 1000).toISOString() : null,
        daysFromNow: daysFromNow,
        iat: token.iat,
        iatDate: token.iat ? new Date((token.iat as number) * 1000).toISOString() : null,
      },
      now: now,
      nowDate: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to decode token', message: error.message },
      { status: 500 }
    )
  }
}

