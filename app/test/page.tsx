"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Brain, Search } from "lucide-react"

interface TestResult {
  name: string
  status: "loading" | "success" | "error"
  message: string
  data?: any
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Supabase Bağlantısı", status: "loading", message: "Test ediliyor..." },
    { name: "Kitap Verilerini Çekme", status: "loading", message: "Test ediliyor..." },
    { name: "Kitap Arama", status: "loading", message: "Test ediliyor..." },
    { name: "OpenAI Önerisi", status: "loading", message: "Test ediliyor..." },
  ])

  const updateTest = (index: number, status: TestResult["status"], message: string, data?: any) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message, data } : test)))
  }

  const runTests = async () => {
    // Reset all tests
    setTests((prev) => prev.map((test) => ({ ...test, status: "loading", message: "Test ediliyor..." })))

    // Test 1: Supabase Connection
    try {
      const response = await fetch("/api/test/supabase")
      const result = await response.json()

      if (response.ok) {
        updateTest(0, "success", `Bağlantı başarılı! ${result.message}`, result)
      } else {
        updateTest(0, "error", result.error || "Bağlantı hatası")
      }
    } catch (error) {
      updateTest(0, "error", "Bağlantı hatası: " + error.message)
    }

    // Test 2: Fetch Books
    try {
      const response = await fetch("/api/books/search?limit=5")
      const result = await response.json()

      if (response.ok && result.books) {
        updateTest(1, "success", `${result.books.length} kitap bulundu`, result.books)
      } else {
        updateTest(1, "error", "Kitap verisi alınamadı")
      }
    } catch (error) {
      updateTest(1, "error", "Kitap verisi hatası: " + error.message)
    }

    // Test 3: Search Books
    try {
      const response = await fetch("/api/books/search?q=matematik&limit=3")
      const result = await response.json()

      if (response.ok) {
        updateTest(2, "success", `Arama sonucu: ${result.books.length} kitap`, result.books)
      } else {
        updateTest(2, "error", "Arama hatası")
      }
    } catch (error) {
      updateTest(2, "error", "Arama hatası: " + error.message)
    }

    // Test 4: AI Recommendation
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: "matematik ve fizik kitapları seviyorum" }),
      })
      const result = await response.json()

      if (response.ok && result.books) {
        updateTest(3, "success", `AI önerisi: ${result.books.length} kitap`, result.books)
      } else {
        updateTest(3, "error", result.error || "AI önerisi alınamadı")
      }
    } catch (error) {
      updateTest(3, "error", "AI önerisi hatası: " + error.message)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Test Ediliyor</Badge>
      case "success":
        return <Badge className="bg-green-500">Başarılı</Badge>
      case "error":
        return <Badge variant="destructive">Hata</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Sistem Test Paneli</h1>
          <p className="text-slate-600">Supabase ve OpenAI entegrasyonlarını test ediyoruz</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tests.map((test, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {index === 0 && <Database className="h-5 w-5" />}
                    {index === 1 && <Database className="h-5 w-5" />}
                    {index === 2 && <Search className="h-5 w-5" />}
                    {index === 3 && <Brain className="h-5 w-5" />}
                    {test.name}
                  </CardTitle>
                  {getStatusIcon(test.status)}
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(test.status)}</div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">{test.message}</CardDescription>

                {test.data && test.status === "success" && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Test Sonucu:</h4>
                    {Array.isArray(test.data) ? (
                      <div className="space-y-2">
                        {test.data.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-xs bg-white p-2 rounded border">
                            {item.title ? (
                              <div>
                                <strong>{item.title}</strong>
                                <br />
                                <span className="text-slate-600">{item.author}</span>
                                <br />
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                            ) : (
                              <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                            )}
                          </div>
                        ))}
                        {test.data.length > 3 && (
                          <p className="text-xs text-slate-500">+{test.data.length - 3} daha...</p>
                        )}
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(test.data, null, 2)}</pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={runTests} className="bg-blue-600 hover:bg-blue-700">
            Testleri Tekrar Çalıştır
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Test Açıklamaları:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              <strong>Supabase Bağlantısı:</strong> Veritabanı bağlantısını kontrol eder
            </li>
            <li>
              <strong>Kitap Verilerini Çekme:</strong> Veritabanından kitap listesini alır
            </li>
            <li>
              <strong>Kitap Arama:</strong> Arama fonksiyonunu test eder
            </li>
            <li>
              <strong>OpenAI Önerisi:</strong> AI tabanlı kitap önerisi sistemini test eder
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")} className="mr-4">
            Ana Sayfaya Dön
          </Button>
          <Button variant="outline" onClick={() => window.open("/api/books/search?limit=10", "_blank")}>
            API'yi Tarayıcıda Test Et
          </Button>
        </div>
      </div>
    </div>
  )
}
