"use client"

import { useState, useEffect } from "react"
import { Search, Book, BookOpen, ChevronRight, Sparkles, Camera, RefreshCw, Loader2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Image from "next/image"

// Types
interface LibraryBook {
  id: number
  title: string
  author: string
  genre: string
  description?: string
  color_gradient: string
  available_copies: number
}

export default function LibraryKiosk() {
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteBooks, setFavoriteBooks] = useState("")
  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<LibraryBook[]>([])
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [robotState, setRobotState] = useState("greeting") // greeting, askFavorites, preparing, showBooks, noRecommendations
  const [robotAnimation, setRobotAnimation] = useState(true)
  const [preparationProgress, setPreparationProgress] = useState(0)
  const [usedBookIds, setUsedBookIds] = useState<number[]>([])
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(40)
  const [isLoading, setIsLoading] = useState(false)
  const [showKioskExamples, setShowKioskExamples] = useState(false)

  useEffect(() => {
    // Reset robot animation after 3 seconds
    const timer = setTimeout(() => {
      setRobotAnimation(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [robotAnimation])

  // Auto-show kiosk examples on first visit
  useEffect(() => {
    const hasSeenExamples = localStorage.getItem('kitapgpt-examples-shown')
    const lastShownTime = localStorage.getItem('kitapgpt-examples-time')
    
    if (!hasSeenExamples || !lastShownTime) {
      // First time visitor - show immediately
      const timer = setTimeout(() => {
        setShowKioskExamples(true)
      }, 2000) // 2 seconds after page load
      
      return () => clearTimeout(timer)
    } else {
      // Check if 5 minutes have passed
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      const timeDiff = Date.now() - parseInt(lastShownTime)
      
      if (timeDiff >= fiveMinutes) {
        const timer = setTimeout(() => {
          setShowKioskExamples(true)
        }, 2000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [])


  // Auto redirect timer for results page and no recommendations page
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (robotState === "showBooks" || robotState === "noRecommendations") {
      setAutoRedirectTimer(40)
      interval = setInterval(() => {
        setAutoRedirectTimer((prev) => {
          if (prev <= 1) {
            // Redirect to main page
            setRobotState("greeting")
            setFilteredBooks([])
            setRecommendedBooks([])
            setUsedBookIds([])
            setFavoriteBooks("")
            setSearchQuery("")
            setShowError(false)
            setErrorMessage("")
            clearInterval(interval)
            return 40
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [robotState])

  // Progress bar animation for preparation state
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (robotState === "preparing") {
      interval = setInterval(() => {
        setPreparationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1
        })
      }, 10) // 1000ms / 100 = 10ms per 1%
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [robotState])

  const getRecommendations = async (userInput: string, excludeIds: number[] = []) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          excludeIds,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        // If there's an error message from the API, show it
        if (data.error) {
          setErrorMessage(data.error)
          setShowError(true)
          return { books: [], hasError: true, errorMessage: data.error }
        }
        throw new Error("Öneri alınamadı")
      }

      return { books: data.books || [], hasError: false }
    } catch (error) {
      console.error("Recommendation error:", error)
      setErrorMessage("Kitap önerisi alınamadı. Lütfen tekrar deneyin.")
      setShowError(true)
      return { books: [], hasError: true, errorMessage: "Kitap önerisi alınamadı. Lütfen tekrar deneyin." }
    } finally {
      setIsLoading(false)
    }
  }

  const searchBooks = async (query: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&limit=10`)

      if (!response.ok) {
        throw new Error("Arama yapılamadı")
      }

      const data = await response.json()
      return data.books || []
    } catch (error) {
      console.error("Search error:", error)
      setErrorMessage("Arama yapılamadı. Lütfen tekrar deneyin.")
      setShowError(true)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavoriteBooks = async (books: string) => {
    setFavoriteBooks(books)
    if (books.trim()) {
      setRobotState("preparing")
      setRobotAnimation(true)
      setPreparationProgress(0)
      setShowError(false)

      // Show preparing animation for 8 seconds, then show results
      setTimeout(async () => {
        const result = await getRecommendations(books)
        if (result.hasError || result.books.length === 0) {
          // Show no recommendations state
          setRobotState("noRecommendations")
          setErrorMessage(result.errorMessage || "Öneri bulunamadı")
        } else {
          setRecommendedBooks(result.books)
          setFilteredBooks(result.books)
          setUsedBookIds(result.books.map((book: LibraryBook) => book.id))
          setRobotState("showBooks")
        }
      }, 1000)
    }
  }

  const handleAlternativeRecommendation = async () => {
    setRobotState("preparing")
    setRobotAnimation(true)
    setPreparationProgress(0)
    setShowError(false)

    // Show preparing animation for 8 seconds, then show alternative results
    setTimeout(async () => {
      const result = await getRecommendations(favoriteBooks, usedBookIds)
      if (result.hasError || result.books.length === 0) {
        // Show no recommendations state
        setRobotState("noRecommendations")
        setErrorMessage(result.errorMessage || "Başka öneri bulunamadı")
      } else {
        setRecommendedBooks(result.books)
        setFilteredBooks(result.books)
        setUsedBookIds((prev) => [...prev, ...result.books.map((book: LibraryBook) => book.id)])
        setRobotState("showBooks")
      }
    }, 8000)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setShowError(false)

    if (!query.trim()) {
      setFilteredBooks([])
      return
    }

    // Check for "kitapları göster" command
    if (query.toLowerCase().includes("kitap") && query.toLowerCase().includes("göster")) {
      setRobotState("showBooks")
      setFilteredBooks(recommendedBooks)
      return
    }

    // Search books in database
    const results = await searchBooks(query)

    if (results.length === 0) {
      setShowError(true)
      setErrorMessage("Aradığınız kriterlere uygun kitap bulunamadı.")
      setFilteredBooks([])
    } else {
      setFilteredBooks(results)
    }
  }

  const startRecommendation = () => {
    setRobotState("askFavorites")
    setRobotAnimation(true)
    setShowError(false)
  }

  const showBooks = () => {
    setRobotState("showBooks")
    setFilteredBooks(recommendedBooks)
  }

  const resetToHome = () => {
    setRobotState("greeting")
    setFilteredBooks([])
    setRecommendedBooks([])
    setUsedBookIds([])
    setFavoriteBooks("")
    setSearchQuery("")
    setAutoRedirectTimer(40)
    setShowError(false)
    setErrorMessage("")
  }

  const getRobotMessage = () => {
    switch (robotState) {
      case "greeting":
        return "Merhaba! Size kitap önermemi ister misiniz?"
      case "askFavorites":
        return "Hoşuna giden okuyup beğendiğin kitaplardan birini veya bir kaçını yazar mısın?"
      case "preparing":
        return "Sizin için kitap önerisi hazırlıyorum..."
      case "showBooks":
        return "İşte senin için seçtiğim kitaplar! Kütüphanemizden bu kitapları temin edebilirsin. Ekranın fotoğrafını çekmeyi unutma!"
      case "noRecommendations":
        return errorMessage || "Üzgünüm, şu anda size uygun kitap önerisi bulamadım."
      case "error":
        return "Bu konuda yardımcı olamıyorum. Kitap türü veya yazar adı belirtebilir misiniz?"
      default:
        return "Size nasıl yardımcı olabilirim?"
    }
  }

  // Get the appropriate robot image based on state
  const getRobotImage = () => {
    if (robotState === "greeting" || robotState === "askFavorites") {
      return "/images/robot-welcome.png"
    }
    return "/images/robot.png"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white text-slate-800 overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-50/40 rounded-full blur-3xl"></div>
      </div>

      {/* Header with Logo */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-blue-100 py-4 px-6 flex items-center justify-center shadow-sm">
        <div className="w-full max-w-2xl flex items-center justify-between">
          {/* University logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Book className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Bartın Üniversitesi</h1>
              <p className="text-sm text-blue-600">Kütüphane Sistemi</p>
            </div>
          </div>
          
          {/* Örnek Button */}
          <Button
            onClick={() => setShowKioskExamples(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-400"
          >
            <Eye className="h-4 w-4" />
            Örnek
          </Button>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-12 flex flex-col h-[calc(100vh-76px)] justify-center">
        {robotState === "preparing" ? (
          // Book Preparation Animation Screen - FULL SCREEN VERSION
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90 backdrop-blur-md flex flex-col items-center justify-center">
            {/* Robot with message */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="relative w-40 h-40"
                >
                  <Image
                    src="/images/robot.png"
                    alt="Bartın Üniversitesi Kütüphane Asistanı"
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                    priority
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white p-5 rounded-2xl border border-blue-100 shadow-lg mb-8 max-w-xs"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-blue-100 rotate-45"></div>
                <p className="text-slate-700 font-medium text-center text-lg">
                  Sizin için kitap önerisi hazırlıyorum...
                </p>
              </motion.div>
            </div>

            {/* Animated Bookshelf - LARGER VERSION */}
            <div className="relative w-full max-w-lg">
              {/* Bookshelf */}
              <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-xl p-6 shadow-2xl border-4 border-amber-300/50">
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {/* Top shelf books */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`top-${i}`}
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.1, 1],
                        y: [0, -5, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        delay: i * 0.2,
                      }}
                      className={`h-24 w-8 rounded-sm ${
                        i % 4 === 0
                          ? "bg-blue-600"
                          : i % 4 === 1
                            ? "bg-green-600"
                            : i % 4 === 2
                              ? "bg-purple-600"
                              : "bg-red-600"
                      } shadow-md`}
                    />
                  ))}
                </div>

                {/* Shelf divider */}
                <div className="h-2 bg-amber-300 rounded mb-4"></div>

                <div className="grid grid-cols-8 gap-2 mb-4">
                  {/* Middle shelf books */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`middle-${i}`}
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.1, 1],
                        y: [0, -5, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        delay: (i + 4) * 0.2,
                      }}
                      className={`h-24 w-8 rounded-sm ${
                        i % 4 === 0
                          ? "bg-amber-600"
                          : i % 4 === 1
                            ? "bg-cyan-600"
                            : i % 4 === 2
                              ? "bg-indigo-600"
                              : "bg-pink-600"
                      } shadow-md`}
                    />
                  ))}
                </div>

                {/* Shelf divider */}
                <div className="h-2 bg-amber-300 rounded mb-4"></div>

                <div className="grid grid-cols-8 gap-2">
                  {/* Bottom shelf books */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`bottom-${i}`}
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.1, 1],
                        y: [0, -5, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        delay: (i + 8) * 0.2,
                      }}
                      className={`h-24 w-8 rounded-sm ${
                        i % 4 === 0
                          ? "bg-teal-600"
                          : i % 4 === 1
                            ? "bg-orange-600"
                            : i % 4 === 2
                              ? "bg-lime-600"
                              : "bg-violet-600"
                      } shadow-md`}
                    />
                  ))}
                </div>
              </div>

              {/* Magical sparkles around the bookshelf */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  style={{
                    left: `${10 + (i % 6) * 16}%`,
                    top: `${10 + Math.floor(i / 6) * 40}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="h-6 w-6 text-blue-300" />
                </motion.div>
              ))}

              {/* Selection glow effect */}
              <motion.div
                className="absolute inset-0 bg-blue-400/20 rounded-xl"
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                }}
              />

              {/* Flying books animation */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`flying-book-${i}`}
                  className={`absolute w-12 h-16 rounded-sm ${
                    i === 0 ? "bg-blue-600" : i === 1 ? "bg-amber-600" : "bg-green-600"
                  } shadow-lg`}
                  initial={{
                    x: -100,
                    y: 100 + i * 50,
                    rotate: -30,
                    opacity: 0,
                  }}
                  animate={{
                    x: [null, 50, 200, 400],
                    y: [null, 0, -50, -100],
                    rotate: [-30, 0, 30, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: 1 + i * 1,
                    times: [0, 0.3, 0.7, 1],
                    ease: "easeInOut",
                  }}
                >
                  {/* Book spine */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10"></div>

                  {/* Book shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-10 w-full max-w-md">
              <div className="h-2 w-full bg-blue-200/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
                  style={{ width: `${preparationProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-blue-200 text-sm">
                <span>Kitaplar taranıyor</span>
                <span>{preparationProgress}%</span>
              </div>
            </div>

            {/* Loading dots */}
            <div className="flex gap-2 mt-8">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 bg-blue-300 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        ) : robotState === "noRecommendations" ? (
          // No Recommendations Screen
          <div className="h-full flex flex-col py-2">
            {/* Auto redirect timer */}
            <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Ana sayfaya dönüş: {autoRedirectTimer}s
            </div>

            {/* Robot with sad expression */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 0.98, 1],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/images/robot.png"
                    alt="Bartın Üniversitesi Kütüphane Asistanı"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain opacity-80"
                    priority
                  />
                </motion.div>

                {/* Sad sparkles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`sad-sparkle-${i}`}
                    className="absolute"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + (i % 2) * 20}%`,
                    }}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.5, 1, 0.5],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2.5,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-gray-400" />
                  </motion.div>
                ))}
              </div>

              {/* Error message bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white p-4 rounded-2xl border border-red-100 shadow-lg max-w-sm"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-red-100 rotate-45"></div>
                <p className="text-slate-700 font-medium text-center leading-relaxed text-sm">{getRobotMessage()}</p>
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full opacity-60"></div>
              </motion.div>
            </div>

            {/* Try again section */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-6"
              >
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Başka bir deneme yapalım!</h3>
                <p className="text-sm text-slate-500">Farklı bir kitap adı veya yazar ismi deneyin</p>
              </motion.div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={resetToHome}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg text-sm"
                >
                  Yeni Öneri Al
                </Button>
              </div>
            </div>
          </div>
        ) : robotState !== "showBooks" ? (
          <>
            {/* Robot Character - KIOSK OPTIMIZED */}
            <div className="mb-12 flex flex-col items-center">
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: robotAnimation ? [0.8, 1.05, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Robot Image - EXTRA LARGE for kiosk */}
                  <div className={`relative ${robotState === "greeting" ? "w-96 h-96" : "w-80 h-80"}`}>
                    <motion.div
                      animate={
                        robotState === "greeting"
                          ? {
                              // Basit cam tıklama animasyonu
                              y: [0, -5, -2, -8, -1, -6, 0],
                              x: [0, 2, -1, 3, -2, 1, 0],
                              scale: [1, 1.02, 0.98, 1.05, 0.97, 1.01, 1],
                            }
                          : {
                              y: robotAnimation ? [0, -8, 0] : [0, -4, 0],
                            }
                      }
                      transition={
                        robotState === "greeting"
                          ? {
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2.5,
                              ease: "easeInOut",
                            }
                          : {
                              repeat: Number.POSITIVE_INFINITY,
                              duration: robotAnimation ? 2 : 3,
                              ease: "easeInOut",
                            }
                      }
                    >
                      <Image
                        src={getRobotImage() || "/placeholder.svg"}
                        alt="Bartın Üniversitesi Kütüphane Asistanı"
                        width={robotState === "greeting" ? 384 : 320}
                        height={robotState === "greeting" ? 384 : 320}
                        className="w-full h-full object-contain"
                        priority
                      />
                    </motion.div>

                    {/* Basit cam tıklama efektleri */}
                    {robotState === "greeting" && (
                      <>
                        {/* Cam tıklama ripple'ları */}
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={`tap-ripple-${i}`}
                            className="absolute inset-0 border-3 border-blue-400/30 rounded-full"
                            animate={{
                              scale: [0.8, 1.5, 2],
                              opacity: [0.8, 0.3, 0],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              delay: i * 0.7,
                              ease: "easeOut",
                            }}
                          />
                        ))}

                        {/* Sağ el sparkle */}
                        <motion.div
                          className="absolute -right-8 top-1/4"
                          animate={{
                            x: [0, 15, -10, 20, -5, 0],
                            y: [0, -8, 5, -12, 3, 0],
                            rotate: [0, 25, -15, 30, -10, 0],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2.5,
                            ease: "easeInOut",
                          }}
                        >
                          <Sparkles className="h-8 w-8 text-yellow-400" />
                        </motion.div>

                        {/* Sol el sparkle */}
                        <motion.div
                          className="absolute -left-8 top-1/3"
                          animate={{
                            x: [0, -12, 8, -18, 4, 0],
                            y: [0, 6, -4, 10, -2, 0],
                            rotate: [0, -20, 15, -25, 10, 0],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2.5,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        >
                          <Sparkles className="h-6 w-6 text-blue-400" />
                        </motion.div>

                        {/* Cam tıklama noktaları */}
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={`tap-${i}`}
                            className="absolute w-2 h-2 bg-white/60 rounded-full"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${30 + (i % 2) * 20}%`,
                            }}
                            animate={{
                              scale: [0, 1.5, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1.5,
                              delay: i * 0.3,
                            }}
                          />
                        ))}

                        {/* Dikkat çeken glow efekti */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.7, 0.3],
                            rotate: [0, 360],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 3,
                            ease: "easeInOut",
                          }}
                        />
                      </>
                    )}

                    {/* Enhanced glow effect - extra large for kiosk */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1, 0.8],
                      }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                      className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 ${
                        robotState === "greeting" ? "w-80 h-20" : "w-60 h-16"
                      } bg-blue-200/40 rounded-full blur-xl`}
                    ></motion.div>

                    {/* Enhanced tech sparkles - extra large for kiosk */}
                    <motion.div
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                        rotate: [0, 180, 360],
                        scale: robotState === "greeting" ? [1, 1.4, 1] : [1, 1.2, 1],
                      }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                      className="absolute -top-4 -right-4"
                    >
                      <Sparkles className={`${robotState === "greeting" ? "h-12 w-12" : "h-8 w-8"} text-blue-500`} />
                    </motion.div>
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        rotate: [360, 180, 0],
                        scale: robotState === "greeting" ? [1, 1.3, 1] : [1, 1.1, 1],
                      }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
                      className="absolute -bottom-4 -left-4"
                    >
                      <Sparkles className={`${robotState === "greeting" ? "h-10 w-10" : "h-7 w-7"} text-blue-400`} />
                    </motion.div>

                    {/* Extra sparkles for greeting page */}
                    {robotState === "greeting" && (
                      <>
                        <motion.div
                          animate={{
                            opacity: [0.2, 0.8, 0.2],
                            rotate: [0, 270, 540],
                            scale: [0.8, 1.6, 0.8],
                          }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.5 }}
                          className="absolute top-1/4 -left-6"
                        >
                          <Sparkles className="h-10 w-10 text-yellow-400" />
                        </motion.div>
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.9, 0.3],
                            rotate: [180, 0, -180],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4.2 }}
                          className="absolute top-3/4 -right-6"
                        >
                          <Sparkles className="h-8 w-8 text-green-400" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Robot Speech Bubble - extra large for kiosk */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`relative bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl ${
                  robotState === "greeting" ? "max-w-lg" : "max-w-md"
                }`}
              >
                {/* Speech pointer */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-blue-100 rotate-45"></div>

                <p
                  className={`text-slate-700 font-semibold text-center leading-relaxed ${
                    robotState === "greeting" ? "text-2xl" : "text-xl"
                  }`}
                >
                  {getRobotMessage()}
                </p>

                {/* Enhanced tech accent for kiosk */}
                <div
                  className={`absolute top-3 right-3 ${
                    robotState === "greeting" ? "w-4 h-4" : "w-3 h-3"
                  } bg-blue-400 rounded-full opacity-60`}
                ></div>

                {/* Extra visual effects for kiosk bubble */}
                {robotState === "greeting" && (
                  <motion.div
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="absolute top-3 left-3 w-3 h-3 bg-green-400 rounded-full"
                  />
                )}
              </motion.div>
            </div>


            {/* Input Section - KIOSK OPTIMIZED */}
            <div className="mb-16 relative">
              {robotState === "greeting" ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startRecommendation}
                    className="w-full h-20 text-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-3xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300"
                  >
                    📚 Evet, kitap öner!
                  </Button>
                </motion.div>
              ) : robotState === "askFavorites" ? (
                <div className="space-y-6">
                  {/* Input Area - KIOSK OPTIMIZED */}
                  <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-800">Favori Kitaplarınızı Yazın</h3>
                    </div>
                    
                    <Input
                      type="text"
                      placeholder="Örn: Harry Potter, Suç ve Ceza, 1984, Simyacı..."
                      value={favoriteBooks}
                      onChange={(e) => setFavoriteBooks(e.target.value)}
                      className="h-16 text-xl bg-blue-50/50 border-2 border-blue-200 focus:border-blue-400 rounded-2xl px-6 text-slate-700 placeholder:text-slate-500 w-full font-medium"
                    />
                  </div>

                  {/* Action Button - KIOSK OPTIMIZED */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleFavoriteBooks(favoriteBooks)}
                      className="w-full h-20 text-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-3xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Sparkles className="h-8 w-8" />
                      Kitap Önerisi Al
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search Area - KIOSK OPTIMIZED */}
                  <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <Search className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-800">Kitap Arayın</h3>
                    </div>
                    
                    <Input
                      type="text"
                      placeholder="Kitap adı, yazar adı veya 'kitapları göster' yazın..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="h-16 text-xl bg-blue-50/50 border-2 border-blue-200 focus:border-blue-400 rounded-2xl px-6 text-slate-700 placeholder:text-slate-500 w-full font-medium"
                    />
                  </div>

                  {/* Search Button - KIOSK OPTIMIZED */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSearch(searchQuery)}
                      className="w-full h-20 text-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-3xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Search className="h-8 w-8" />
                      Kitap Ara
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </motion.div>
                </div>
              )}

              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-red-700 text-lg font-medium text-center">
                      {errorMessage ||
                        "Bu konuda yardımcı olamıyorum. Lütfen kitap, yazar veya tür ile ilgili arama yapın."}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          // OPTIMIZED Book Display Screen - COMPACT VERSION
          <div className="h-full flex flex-col py-2">
            {/* Auto redirect timer */}
            <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Ana sayfaya dönüş: {autoRedirectTimer}s
            </div>

            {/* COMPACT Top Section with Robot and Message */}
            <div className="mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="relative w-24 h-24">
                  <motion.div
                    animate={{
                      y: [0, -4, 0, -2, 0],
                      x: [0, 2, -1, 2, 0],
                      rotate: [0, 3, -2, 4, 0],
                      scale: [1, 1.03, 0.99, 1.04, 1],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/images/robot.png"
                      alt="Bartın Üniversitesi Kütüphane Asistanı"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </motion.div>

                  {/* Compact celebration sparkles */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`celebration-sparkle-${i}`}
                      className="absolute"
                      style={{
                        left: `${10 + (i % 2) * 60}%`,
                        top: `${15 + Math.floor(i / 2) * 50}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.3, 1.2, 0.3],
                        rotate: [0, 180, 360],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    </motion.div>
                  ))}

                  {/* Compact glow effect */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.8, 1.1, 0.8],
                    }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-blue-200/40 rounded-full blur-lg"
                  />
                </div>
              </div>

              <div className="text-center">
                <motion.h2
                  animate={{
                    scale: [1, 1.01, 1],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="text-lg font-bold text-blue-700 mb-1"
                >
                  İşte senin için seçtiğim kitaplar!
                </motion.h2>
                <p className="text-xs text-slate-600 mb-1">Kütüphanemizden bu kitapları temin edebilirsin.</p>
                <div className="flex items-center justify-center gap-1 text-blue-500 font-medium text-xs">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  >
                    <Camera className="h-2.5 w-2.5" />
                  </motion.div>
                  <span>Ekranın fotoğrafını çekmeyi unutma!</span>
                </div>
                <motion.div
                  animate={{
                    scaleX: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mx-auto mt-2"
                />
              </div>
            </div>

            {/* ENHANCED Book Display - Better Layout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center px-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Kitaplar yükleniyor...</span>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center text-slate-500">
                  <span>Kitap bulunamadı.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 15, rotateY: -20 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex flex-col items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-100/50"
                    >
                      {/* ENHANCED Book Display */}
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5, y: -5 }}
                        animate={{
                          y: [0, -3, 0],
                          rotateZ: [0, 0.5, 0, -0.5, 0],
                          scale: [1, 1.01, 1],
                        }}
                        transition={{
                          y: { repeat: Number.POSITIVE_INFINITY, duration: 2.5 + index * 0.2, ease: "easeInOut" },
                          rotateZ: { repeat: Number.POSITIVE_INFINITY, duration: 5 + index * 0.3, ease: "easeInOut" },
                          scale: { repeat: Number.POSITIVE_INFINITY, duration: 3 + index * 0.15, ease: "easeInOut" },
                        }}
                        className="w-40 h-60 relative perspective-1000 mb-4"
                      >
                        {/* Enhanced Book Cover */}
                        <div
                          className={`w-full h-full bg-gradient-to-br ${book.color_gradient} rounded-md shadow-lg relative overflow-hidden transform transition-all duration-500`}
                          style={{
                            boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {/* Book spine effect */}
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10"></div>

                          {/* Book texture */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
                          </div>

                          {/* Book content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                            <div className="w-8 h-8 mb-3 bg-white/20 rounded-full flex items-center justify-center">
                              <Book className="h-5 w-5 text-white" />
                            </div>

                            <h3 className="text-sm font-bold text-white mb-2 drop-shadow-lg leading-tight line-clamp-3">
                              {book.title}
                            </h3>
                            <div className="w-8 h-px bg-white/50 my-2"></div>
                            <p className="text-white/90 font-medium text-xs leading-tight line-clamp-2 mb-1">
                              {book.author}
                            </p>
                            <p className="text-white/70 font-normal text-[10px] leading-tight line-clamp-1">
                              {book.genre}
                            </p>

                            {/* Decorative elements */}
                            <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
                            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
                            
                            {/* Stock indicator */}
                            <div className="absolute top-2 left-2 bg-green-500/80 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                              {book.available_copies} adet
                            </div>
                          </div>

                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                        </div>

                        {/* Book shadow */}
                        <div className="absolute -bottom-1 left-0 right-0 h-2 bg-black/20 blur-sm rounded-full mx-2"></div>
                      </motion.div>

                      {/* Book Title Below - Larger */}
                      <div className="text-center max-w-[160px]">
                        <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-tight">{book.title}</h4>
                        <p className="text-xs text-slate-600 mb-0.5">{book.author}</p>
                        <p className="text-[10px] text-blue-600 font-medium">{book.genre}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* COMPACT Action Buttons */}
            <div className="mt-4 flex gap-2 justify-center">
              <Button
                onClick={resetToHome}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg text-xs"
              >
                Yeni Öneri Al
              </Button>
              <Button
                onClick={handleAlternativeRecommendation}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg text-xs flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Farklı Kitap Önerisi İste
              </Button>
            </div>
          </div>
        )}

        {/* Footer - KIOSK OPTIMIZED */}
        {robotState !== "showBooks" && robotState !== "preparing" && robotState !== "noRecommendations" && (
          <div className="mt-auto pt-8 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-600 text-lg font-medium">
              <Book className="h-6 w-6" />
              <span>Bartın Üniversitesi Kütüphanesi</span>
              <span>•</span>
              <span>Bilgiye açılan kapınız</span>
            </div>
          </div>
        )}
      </div>

      {/* Kiosk Examples Popup Modal */}
      {showKioskExamples && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowKioskExamples(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Kiosk Örnekleri</h2>
                  <p className="text-slate-600">Gerçek kütüphanedeki görünüm</p>
                </div>
              </div>
              <Button
                onClick={() => setShowKioskExamples(false)}
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Kiosk 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <Image
                    src="/images/kiosk1.jpg"
                    alt="Kütüphane Kiosk Örnek 1"
                    width={600}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-lg"
                    priority
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-blue-700">Örnek 1</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Dokunmatik Kiosk Sistemi</h3>
                  <p className="text-slate-600">AI destekli kitap önerileri ile kişiselleştirilmiş kütüphane deneyimi sunar.</p>
                </div>
              </motion.div>

              {/* Kiosk 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <Image
                    src="/images/kiosk2.jpg"
                    alt="Kütüphane Kiosk Örnek 2"
                    width={600}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-lg"
                    priority
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-green-700">Örnek 2</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Akıllı Kitap Keşfi</h3>
                  <p className="text-slate-600">Favori kitaplarınızı yazın, size özel öneriler alın ve kütüphaneden hemen bulun.</p>
                </div>
              </motion.div>
            </div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-slate-800">KitapGPT Kiosk Sistemi</h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Bartın Üniversitesi Kütüphanesi'nde yer alan bu akıllı kiosk sistemi, 
                öğrencilerin kitap keşfetmesini ve kütüphane kaynaklarına kolay erişim sağlamasını amaçlar. 
                AI destekli öneri algoritması ile kişiselleştirilmiş kitap önerileri sunar.
              </p>
            </motion.div>

            {/* Close Buttons */}
            <div className="mt-8 flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowKioskExamples(false)
                  // Mark as seen and set current time
                  localStorage.setItem('kitapgpt-examples-shown', 'true')
                  localStorage.setItem('kitapgpt-examples-time', Date.now().toString())
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-2xl shadow-lg"
              >
                ✓ Tamam, Anladım
              </Button>
              <Button
                onClick={() => setShowKioskExamples(false)}
                variant="outline"
                className="px-8 py-3 rounded-2xl border-2"
              >
                Şimdilik Kapat
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
