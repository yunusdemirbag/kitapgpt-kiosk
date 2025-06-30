import { NextResponse } from "next/server"

// Mock categories data
const mockCategories = [
  { id: 1, name: "Edebiyat", description: "Türk ve Dünya Edebiyatı", color_gradient: "from-blue-600 to-blue-800" },
  { id: 2, name: "Matematik", description: "Matematik ve İstatistik", color_gradient: "from-purple-600 to-purple-800" },
  { id: 3, name: "Tarih", description: "Türk ve Dünya Tarihi", color_gradient: "from-amber-600 to-amber-800" },
  { id: 4, name: "Fizik", description: "Fizik ve Astronomi", color_gradient: "from-green-600 to-green-800" },
  { id: 5, name: "Coğrafya", description: "Coğrafya ve Jeoloji", color_gradient: "from-cyan-600 to-cyan-800" },
]

export async function GET() {
  try {
    return NextResponse.json({ categories: mockCategories })
  } catch (error) {
    console.error("Categories error:", error)
    return NextResponse.json({ categories: mockCategories })
  }
}
