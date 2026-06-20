import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

/* GET /api/profile — fetch full profile + stats */
export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })

    const [user, searchCount, savedCount, videoCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true, googleId: true },
      }),
      prisma.searchHistory.count({ where: { userId } }),
      prisma.watchLaterRecipe.count({ where: { userId } }),
      prisma.savedVideo.count({ where: { userId } }),
    ])

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    return NextResponse.json({
      user,
      stats: { searchCount, savedCount, videoCount },
    })
  } catch (err) {
    console.error('[PROFILE_GET]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

/* PATCH /api/profile — update name and/or password */
export async function PATCH(request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })

    const { name, currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const updateData = {}

    // Update name
    if (name && name.trim() && name.trim() !== user.name) {
      updateData.name = name.trim()
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required.' }, { status: 400 })
      }
      if (!user.password) {
        return NextResponse.json({ error: 'Password change not available for Google accounts.' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes made.' }, { status: 200 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, createdAt: true },
    })

    return NextResponse.json({ user: updated, message: 'Profile updated!' })
  } catch (err) {
    console.error('[PROFILE_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
