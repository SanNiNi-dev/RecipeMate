// app/api/auth/google/callback/route.js
// Step 2: Handle the callback from Google, exchange code for tokens,
// upsert the user in DB, and set the session cookie.

import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // User denied permission
  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/login?error=google_denied`)
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${APP_URL}/api/auth/google/callback`
    )

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Fetch Google user profile
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    const { sub: googleId, email, name, picture } = payload

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`)
    }

    // Find existing user by googleId first, then by email (account linking)
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    })

    if (user) {
      // Link googleId if the user signed up with email/password before
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        })
      }
    } else {
      // Create a brand-new user (no password needed for Google users)
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          // password left null — Google users don't need one
        },
      })
    }

    // Set the same session cookie as email/password login
    const cookieStore = await cookies()
    cookieStore.set('session_user_id', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.redirect(`${APP_URL}/?login=success`)
  } catch (err) {
    console.error('[GOOGLE_CALLBACK_ERROR]', err)
    return NextResponse.redirect(`${APP_URL}/login?error=google_failed`)
  }
}
