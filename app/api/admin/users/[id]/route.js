import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/* PATCH /api/admin/users/[id]  — toggle isAdmin */
export async function PATCH(request, { params }) {
  const admin = await getAdminFromRequest()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const targetId = parseInt((await params).id, 10)
  if (isNaN(targetId)) return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 })

  // Prevent admin from removing their own admin rights
  if (targetId === admin.id) {
    return NextResponse.json({ error: 'You cannot change your own admin status.' }, { status: 400 })
  }

  try {
    const { isAdmin } = await request.json()
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { isAdmin: Boolean(isAdmin) },
      select: { id: true, name: true, email: true, isAdmin: true },
    })
    return NextResponse.json({ user: updated, message: `Admin status ${isAdmin ? 'granted' : 'revoked'}.` })
  } catch (err) {
    console.error('[ADMIN_USER_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

/* DELETE /api/admin/users/[id] — delete user + all their data */
export async function DELETE(request, { params }) {
  const admin = await getAdminFromRequest()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const targetId = parseInt((await params).id, 10)
  if (isNaN(targetId)) return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 })

  if (targetId === admin.id) {
    return NextResponse.json({ error: 'You cannot delete your own account from admin panel.' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: targetId } })
    return NextResponse.json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('[ADMIN_USER_DELETE]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
