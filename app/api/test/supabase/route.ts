import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  let simpleFetchOk = false;
  let simpleFetchError = null;

  try {
    const response = await fetch('https://www.google.com');
    if (response.ok) {
      simpleFetchOk = true;
    } else {
      simpleFetchOk = false;
      simpleFetchError = `Status: ${response.status}`;
    }
  } catch (e: any) {
    simpleFetchOk = false;
    simpleFetchError = e.message;
  }

  try {
    const { error } = await supabase.from("books").select("id").limit(1)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, simpleFetch: { ok: simpleFetchOk, error: simpleFetchError } })
    }
    return NextResponse.json({ ok: true, simpleFetch: { ok: simpleFetchOk, error: simpleFetchError } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, simpleFetch: { ok: simpleFetchOk, error: simpleFetchError } })
  }
}
