// app/api/auth/me/route.js

import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getUserIdFromRequest()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('[ME_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
