import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { SignupCredentials } from '@/types/auth.types'

export async function POST(request: Request) {
  const body = (await request.json()) as SignupCredentials
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 400 })
  }

  const response = NextResponse.json({ user: data.user })
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.session.expires_in,
  }

  response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
  response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)

  return response
}
