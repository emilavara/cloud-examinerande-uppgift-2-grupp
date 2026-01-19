import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { NewEntry } from "@/types/database.types";

export async function GET() {
  const accessToken = (await cookies()).get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase(accessToken);
  const { data: userData, error: userError } =
    await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: Request) {
  const accessToken = (await cookies()).get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as NewEntry;
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase(accessToken);
  const { data: userData, error: userError } =
    await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert([
      {
        user_id: userData.user.id,
        title: title,
        content,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}
