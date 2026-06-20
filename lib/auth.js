// lib/auth.js
// Helper to extract the authenticated user ID from the HTTP-only session cookie

import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

/**
 * Reads the `session_user_id` HTTP-only cookie and returns the user ID.
 * Returns null if the cookie is absent or contains an invalid value.
 *
 * @returns {Promise<number|null>} The logged-in user's ID or null.
 */
export async function getUserIdFromRequest() {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session_user_id')
    if (!cookie || !cookie.value) return null

    const userId = parseInt(cookie.value, 10)
    if (isNaN(userId)) return null

    return userId
  } catch {
    return null
  }
}

/**
 * Returns the full user object (including isAdmin) for the current session.
 * Returns null if unauthenticated or user not found.
 *
 * @returns {Promise<{id, name, email, isAdmin, createdAt}|null>}
 */
export async function getUserFromRequest() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
    })
    return user || null
  } catch {
    return null
  }
}

/**
 * Returns the user if they are an admin, otherwise returns null.
 *
 * @returns {Promise<{id, name, email, isAdmin, createdAt}|null>}
 */
export async function getAdminFromRequest() {
  const user = await getUserFromRequest()
  if (!user || !user.isAdmin) return null
  return user
}
