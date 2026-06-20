import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const savedVideos = await prisma.savedVideo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ savedVideos }, { status: 200 })
  } catch (error) {
    console.error('[SAVED_VIDEOS_GET_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const { videoId, title, shortUrl, thumbnail } = await request.json()

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required.' }, { status: 400 })
    }

    const existing = await prisma.savedVideo.findFirst({
      where: { userId, videoId: String(videoId) },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Video is already in your Watch Later list.', savedVideo: existing },
        { status: 200 }
      )
    }

    const savedVideo = await prisma.savedVideo.create({
      data: {
        userId,
        videoId: String(videoId),
        title,
        shortUrl: shortUrl || `https://youtu.be/${videoId}`,
        thumbnail: thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      },
    })

    return NextResponse.json({ savedVideo }, { status: 201 })
  } catch (error) {
    console.error('[SAVED_VIDEOS_POST_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
