import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  const accessToken = (await cookies()).get('sb-access-token')?.value

  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  const supabase = createServerSupabase(accessToken)
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  return NextResponse.json({ user: data.user })
}
