// app/api/watch-later/[id]/route.js
// DELETE /api/watch-later/[id] — remove a recipe from watch later by DB record ID

import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    // params is a Promise in Next.js 15+
    const { id } = await params
    const recordId = parseInt(id, 10)

    if (isNaN(recordId)) {
      return NextResponse.json({ error: 'Invalid ID.' }, { status: 400 })
    }

    // Ensure the record belongs to this user
    const recipe = await prisma.watchLaterRecipe.findUnique({
      where: { id: recordId },
    })

    if (!recipe || recipe.userId !== userId) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    }

    await prisma.watchLaterRecipe.delete({ where: { id: recordId } })

    return NextResponse.json({ message: 'Recipe removed from Watch Later.' }, { status: 200 })
  } catch (error) {
    console.error('[WATCH_LATER_DELETE_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
