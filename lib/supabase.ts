// Mock Supabase client - no database dependency
export const supabase = {
  from: () => ({
    select: () => ({
      data: [],
      error: null
    }),
    insert: () => ({
      data: [],
      error: null
    })
  })
}

export const supabaseAdmin = supabase

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