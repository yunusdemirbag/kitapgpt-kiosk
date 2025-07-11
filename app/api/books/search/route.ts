import { type NextRequest, NextResponse } from "next/server"

// Updated mock data with new structure
const mockBooks = [
  {
    id: 1,
    title: "1984",
    author: "George Orwell",
    genre: "Distopya",
    description: "Distopik gelecek kurgusu",
    color_gradient: "from-red-600 to-red-800",
    available_copies: 1,
  },
  {
    id: 2,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romantik Klasik",
    description: "Klasik romantik roman",
    color_gradient: "from-pink-600 to-pink-800",
    available_copies: 1,
  },
  {
    id: 3,
    title: "The Lord of the Rings",
    author: "J. R. R. Tolkien",
    genre: "Epik Fantastik",
    description: "Büyük fantastik macera",
    color_gradient: "from-purple-600 to-purple-800",
    available_copies: 1,
  },
  {
    id: 4,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Modern Klasik",
    description: "Modern klasik roman",
    color_gradient: "from-blue-600 to-blue-800",
    available_copies: 1,
  },
  {
    id: 5,
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J. K. Rowling",
    genre: "Fantastik",
    description: "Büyücülük dünyası",
    color_gradient: "from-violet-600 to-violet-800",
    available_copies: 1,
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const limit = parseInt(searchParams.get("limit") || "10")

  if (!query) {
    return NextResponse.json({ error: "Arama sorgusu gerekli" }, { status: 400 })
  }

  try {
    // Mock search functionality
    const filteredBooks = mockBooks.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.genre.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit)

    return NextResponse.json({ books: filteredBooks })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Arama yapılamadı" }, { status: 500 })
  }
}
