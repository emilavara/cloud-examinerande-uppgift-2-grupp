import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { NewEntry } from '@/types/database.types'

type Params = {
  params: Promise<{ id: string }>
}

async function authenticate() {
  const accessToken = (await cookies()).get('sb-access-token')?.value

  if (!accessToken) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const supabase = createServerSupabase(accessToken)
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

  if (userError || !userData.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { supabase, userId: userData.user.id }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const auth = await authenticate()
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, userId } = auth

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: data })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const auth = await authenticate()
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, userId } = auth

  const body = (await request.json()) as NewEntry
  const { title, content } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('entries')
    .update({ title, content })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: data })
}
