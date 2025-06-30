import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET() {
  try {
    // Basit bir model listesi isteği ile anahtarı test et
    const response = await openai.models.list()
    console.log("OpenAI Test Response:", response)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("OpenAI Test Error:", e)
    return NextResponse.json({ ok: false, error: e.message })
  }
} 