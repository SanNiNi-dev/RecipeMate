// app/api/videos/route.js
// GET /api/videos?q=query — proxy to Spoonacular cooking video search

import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q')

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 })
    }

    const apiKey = process.env.SPOONACULAR_API_KEY
    if (!apiKey || apiKey === 'your_spoonacular_api_key_here') {
      return NextResponse.json(
        { error: 'Spoonacular API key is not configured. Please set SPOONACULAR_API_KEY in your .env file.' },
        { status: 503 }
      )
    }

    const url = `https://api.spoonacular.com/food/videos/search?query=${encodeURIComponent(query.trim())}&number=12&apiKey=${apiKey}`
    const res = await fetch(url)

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[VIDEOS_SPOONACULAR_ERROR]', res.status, errBody)
      return NextResponse.json(
        { error: 'Failed to fetch videos from Spoonacular.' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const videos = (data.videos || []).map((v) => ({
      youTubeId: v.youTubeId,
      title: v.title,
      shortUrl: v.shortUrl,
      thumbnail: v.thumbnail,
      length: v.length,
      views: v.views,
      rating: v.rating,
    }))

    return NextResponse.json({ videos }, { status: 200 })
  } catch (error) {
    console.error('[VIDEOS_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
