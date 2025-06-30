import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZHpjbXFjc25ldnpocHpkaGt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAwODc1MCwiZXhwIjoyMDYzNTg0NzUwfQ.wbF2CmD-EIuKS06AGwdXWF4K-3tAfyIL0ZYjVI6Es-M"

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface Book {
  id: number
  title: string
  author: string
  category: string
  description?: string
  isbn?: string
  publication_year?: number
  language: string
  available_copies: number
  total_copies: number
  color_gradient: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  color_gradient: string
}

export interface BookRecommendation {
  id: number
  user_input: string
  recommended_books: Book[]
  created_at: string
}
