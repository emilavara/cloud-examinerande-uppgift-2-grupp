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

  if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!data.user) {
      return NextResponse.json({ error: 'Signup failed' }, { status: 400 })
  }

  // No session yet -> tell client to check email
  if (!data.session) {
      return NextResponse.json(
          { user: data.user, needsEmailConfirmation: true },
          { status: 200 }
      )
  }

  // Session exists -> set cookies
  const response = NextResponse.json(
      { user: data.user, needsEmailConfirmation: false },
      { status: 200 }
  )

  const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // Supabase gives expires_in in seconds; Next cookies expect seconds for maxAge
      maxAge: data.session.expires_in,
  }


  response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
  response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)

  return response
}
