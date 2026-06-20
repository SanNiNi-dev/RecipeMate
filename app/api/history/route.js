// app/api/history/route.js

import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/history — fetch all search history for the logged-in user
export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ history }, { status: 200 })
  } catch (error) {
    console.error('[HISTORY_GET_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// POST /api/history — save a new ingredient search
export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const { searchText } = await request.json()
    if (!searchText || !searchText.trim()) {
      return NextResponse.json({ error: 'searchText is required.' }, { status: 400 })
    }

    const entry = await prisma.searchHistory.create({
      data: { userId, searchText: searchText.trim() },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('[HISTORY_POST_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
