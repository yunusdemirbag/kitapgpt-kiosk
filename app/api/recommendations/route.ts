import { type NextRequest, NextResponse } from "next/server"

// Mock kitap veritabanı - gerçek veritabanı bağlantısı kurulana kadar
const mockBooksDatabase = [
  {
    id: 1,
    title: "Suç ve Ceza",
    author: "Fyodor Dostoyevski",
    genre: "Klasik Roman",
    category: "Edebiyat",
    description: "Rus edebiyatının başyapıtlarından",
    color_gradient: "from-purple-600 to-purple-800",
    available_copies: 3,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    genre: "Distopya",
    category: "Edebiyat",
    description: "Totaliter rejim eleştirisi",
    color_gradient: "from-red-600 to-red-800",
    available_copies: 2,
  },
  {
    id: 3,
    title: "Yüzyıllık Yalnızlık",
    author: "Gabriel García Márquez",
    genre: "Büyülü Gerçekçilik",
    category: "Edebiyat",
    description: "Latin Amerika edebiyatının şaheseri",
    color_gradient: "from-amber-600 to-amber-800",
    available_copies: 1,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Tarih/Antropoloji",
    category: "Tarih",
    description: "İnsanlığın kısa tarihi",
    color_gradient: "from-blue-600 to-blue-800",
    available_copies: 4,
  },
  {
    id: 5,
    title: "Kürk Mantolu Madonna",
    author: "Sabahattin Ali",
    genre: "Roman",
    category: "Edebiyat",
    description: "Türk edebiyatının unutulmaz eseri",
    color_gradient: "from-indigo-600 to-indigo-800",
    available_copies: 3,
  },
  {
    id: 6,
    title: "Simyacı",
    author: "Paulo Coelho",
    genre: "Felsefi Roman",
    category: "Edebiyat",
    description: "Kişisel keşif yolculuğu",
    color_gradient: "from-teal-600 to-teal-800",
    available_copies: 2,
  },
  {
    id: 7,
    title: "Sefiller",
    author: "Victor Hugo",
    genre: "Klasik Roman",
    category: "Edebiyat",
    description: "Fransız edebiyatının başyapıtı",
    color_gradient: "from-rose-600 to-rose-800",
    available_copies: 1,
  },
  {
    id: 8,
    title: "Dune",
    author: "Frank Herbert",
    genre: "Bilim Kurgu",
    category: "Edebiyat",
    description: "Bilim kurgu klasiği",
    color_gradient: "from-orange-600 to-orange-800",
    available_copies: 2,
  },
  {
    id: 9,
    title: "İnce Memed",
    author: "Yaşar Kemal",
    genre: "Roman",
    category: "Edebiyat",
    description: "Çukurova'nın destanı",
    color_gradient: "from-green-600 to-green-800",
    available_copies: 3,
  },
  {
    id: 10,
    title: "Beyaz Diş",
    author: "Jack London",
    genre: "Macera",
    category: "Edebiyat",
    description: "Vahşi yaşam hikayesi",
    color_gradient: "from-cyan-600 to-cyan-800",
    available_copies: 2,
  }
]

// Basit öneri algoritması
function getBookRecommendations(userInput: string, excludeIds: number[] = []): any[] {
  const input = userInput.toLowerCase()
  const recommendations: any[] = []
  
  // Anahtar kelimeler için eşleştirme
  const keywords = {
    klasik: ['klasik', 'eski', 'tarihi'],
    roman: ['roman', 'hikaye', 'kurgu'],
    bilim: ['bilim', 'fizik', 'matematik', 'teknoloji'],
    tarih: ['tarih', 'geçmiş', 'osmanlı'],
    macera: ['macera', 'aksiyon', 'heyecan'],
    felsefe: ['felsefe', 'düşünce', 'hayat', 'anlam'],
  }
  
  // Önce doğrudan eşleşmeleri bul
  mockBooksDatabase.forEach(book => {
    if (excludeIds.includes(book.id)) return
    
    const bookText = `${book.title} ${book.author} ${book.genre} ${book.description}`.toLowerCase()
    
    // Kullanıcı girdisindeki kelimeleri kontrol et
    const userWords = input.split(' ')
    let matchScore = 0
    
    userWords.forEach(word => {
      if (word.length > 2 && bookText.includes(word)) {
        matchScore += 2
      }
    })
    
    // Kategori eşleşmesi
    Object.entries(keywords).forEach(([category, words]) => {
      words.forEach(word => {
        if (input.includes(word) && bookText.includes(word)) {
          matchScore += 1
        }
      })
    })
    
    if (matchScore > 0) {
      recommendations.push({ ...book, score: matchScore })
    }
  })
  
  // Eğer yeterli öneri yoksa, rastgele kitaplar ekle
  if (recommendations.length < 3) {
    const availableBooks = mockBooksDatabase.filter(book => 
      !excludeIds.includes(book.id) && 
      !recommendations.find(rec => rec.id === book.id)
    )
    
    while (recommendations.length < 5 && availableBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableBooks.length)
      const randomBook = availableBooks.splice(randomIndex, 1)[0]
      recommendations.push({ ...randomBook, score: 0 })
    }
  }
  
  // Skorlara göre sırala ve ilk 5'i al
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score, ...book }) => book)
}

export async function POST(request: NextRequest) {
  try {
    const { userInput, excludeIds = [] } = await request.json()

    if (!userInput || userInput.trim().length === 0) {
      return NextResponse.json({ error: "Lütfen favori kitaplarınızı yazın" }, { status: 400 })
    }

    // Mock öneri sistemi kullan
    const recommendations = getBookRecommendations(userInput, excludeIds)

    if (recommendations.length === 0) {
      return NextResponse.json({ 
        books: [],
        error: "Üzgünüm, şu anda size uygun kitap önerisi bulamadım. Lütfen farklı bir kitap veya yazar adı deneyin."
      })
    }

    return NextResponse.json({ books: recommendations })
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json({ 
      error: "Kitap önerisi alınırken bir hata oluştu. Lütfen tekrar deneyin." 
    }, { status: 500 })
  }
}
