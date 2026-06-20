// app/api/auth/google/route.js
// Step 1: Redirect user to Google's OAuth consent screen

import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

export async function GET() {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  )

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  })

  return NextResponse.redirect(url)
}
