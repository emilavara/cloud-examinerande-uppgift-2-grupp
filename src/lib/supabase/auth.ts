import { LoginCredentials, SignupCredentials } from '@/types/auth.types'

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password }: SignupCredentials) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed')
  }

  return data
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }: LoginCredentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Sign out failed')
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const response = await fetch('/api/auth/me')
  const data = await response.json()

  if (!response.ok) {
    return null
  }

  return data.user ?? null
}
