import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const id = parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid video ID.' }, { status: 400 })
    }

    const savedVideo = await prisma.savedVideo.findUnique({ where: { id } })
    if (!savedVideo || savedVideo.userId !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 })
    }

    await prisma.savedVideo.delete({ where: { id } })
    return NextResponse.json({ message: 'Saved video removed.' }, { status: 200 })
  } catch (error) {
    console.error('[SAVED_VIDEOS_DELETE_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
