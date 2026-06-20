// app/api/watch-later/route.js

import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/watch-later — fetch all saved recipes for the logged-in user
export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const recipes = await prisma.watchLaterRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recipes }, { status: 200 })
  } catch (error) {
    console.error('[WATCH_LATER_GET_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// POST /api/watch-later — save a recipe to watch later
export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const { recipeId, title, image, sourceUrl } = await request.json()

    if (!recipeId || !title) {
      return NextResponse.json({ error: 'recipeId and title are required.' }, { status: 400 })
    }

    // Prevent duplicates
    const existing = await prisma.watchLaterRecipe.findFirst({
      where: { userId, recipeId: String(recipeId) },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Recipe is already in your Watch Later list.', recipe: existing },
        { status: 200 }
      )
    }

    const recipe = await prisma.watchLaterRecipe.create({
      data: {
        userId,
        recipeId: String(recipeId),
        title,
        image: image || '',
        sourceUrl: sourceUrl || '',
      },
    })

    return NextResponse.json({ recipe }, { status: 201 })
  } catch (error) {
    console.error('[WATCH_LATER_POST_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
