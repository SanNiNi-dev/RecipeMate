import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

/* GET /api/admin/users?page=1&search= */
export async function GET(request) {
  const admin = await getAdminFromRequest()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const search = searchParams.get('search') || ''
    const limit  = 20
    const skip   = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name:  { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true,
          isAdmin: true, googleId: true, createdAt: true,
          _count: {
            select: {
              searchHistory: true,
              watchLater:    true,
              savedVideos:   true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[ADMIN_USERS_GET]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
