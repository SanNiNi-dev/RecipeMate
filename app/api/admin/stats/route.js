import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/* GET /api/admin/stats */
export async function GET() {
  const admin = await getAdminFromRequest()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      newUsersThisWeek,
      totalSearches,
      totalSaved,
      totalVideos,
      recentSearches,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.searchHistory.count(),
      prisma.watchLaterRecipe.count(),
      prisma.savedVideo.count(),
      prisma.searchHistory.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      newUsersThisWeek,
      totalSearches,
      totalSaved,
      totalVideos,
      recentSearches,
    })
  } catch (err) {
    console.error('[ADMIN_STATS]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
