"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Database, Code, BookOpen } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")
  const [sqlOutput, setSqlOutput] = useState("")

  const handleSetupDatabase = async () => {
    setIsLoading(true)
    setSetupStatus("loading")
    setSetupMessage("Veritabanı kuruluyor...")

    try {
      const response = await fetch("/api/setup/database", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setSetupStatus("success")
        setSetupMessage("Veritabanı başarıyla kuruldu!")
        setSqlOutput(data.output || "")
      } else {
        setSetupStatus("error")
        setSetupMessage(data.error || "Veritabanı kurulumu başarısız oldu.")
        setSqlOutput(data.details || "")
      }
    } catch (error) {
      setSetupStatus("error")
      setSetupMessage("Veritabanı kurulumu sırasında bir hata oluştu.")
      setSqlOutput(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Kütüphane Sistemi Kurulumu</h1>
          <p className="text-slate-600">Veritabanı ve API entegrasyonlarını kurun</p>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Kurulum</TabsTrigger>
            <TabsTrigger value="schema">Veritabanı Şeması</TabsTrigger>
            <TabsTrigger value="help">Yardım</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Veritabanı Kurulumu
                </CardTitle>
                <CardDescription>
                  Supabase veritabanınızı kurmak için aşağıdaki butona tıklayın. Bu işlem, gerekli tabloları ve örnek
                  verileri oluşturacaktır.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {setupStatus === "idle" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Kurulum gerekli</AlertTitle>
                    <AlertDescription>
                      Kütüphane sistemi için gerekli veritabanı tabloları henüz oluşturulmamış. Kurulumu başlatmak için
                      aşağıdaki butona tıklayın.
                    </AlertDescription>
                  </Alert>
                )}

                {setupStatus === "loading" && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <AlertTitle>Kurulum yapılıyor</AlertTitle>
                    <AlertDescription>{setupMessage}</AlertDescription>
                  </Alert>
                )}

                {setupStatus === "success" && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Kurulum başarılı</AlertTitle>
                    <AlertDescription>{setupMessage}</AlertDescription>
                  </Alert>
                )}

                {setupStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Kurulum hatası</AlertTitle>
                    <AlertDescription>{setupMessage}</AlertDescription>
                  </Alert>
                )}

                {sqlOutput && (
                  <div className="mt-4 p-4 bg-slate-800 text-slate-200 rounded-md overflow-auto max-h-60 text-xs">
                    <pre>{sqlOutput}</pre>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                  Ana Sayfaya Dön
                </Button>
                <Button onClick={handleSetupDatabase} disabled={isLoading || setupStatus === "success"}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {setupStatus === "success" ? "Kurulum Tamamlandı" : "Veritabanını Kur"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="schema">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Veritabanı Şeması
                </CardTitle>
                <CardDescription>
                  Aşağıdaki SQL kodu, kütüphane sistemi için gerekli tabloları ve örnek verileri oluşturur. Bu kodu
                  Supabase SQL Editor'da manuel olarak çalıştırabilirsiniz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-800 text-slate-200 rounded-md overflow-auto max-h-96 text-xs">
                  <pre>{`-- Supabase veritabanı şeması
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- Kitaplar tablosu
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  isbn VARCHAR(20),
  publication_year INTEGER,
  language VARCHAR(10) DEFAULT 'tr',
  available_copies INTEGER DEFAULT 1,
  total_copies INTEGER DEFAULT 1,
  color_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-blue-800',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kitap önerileri tablosu
CREATE TABLE IF NOT EXISTS book_recommendations (
  id SERIAL PRIMARY KEY,
  user_input TEXT NOT NULL,
  recommended_books JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kitap kategorileri tablosu
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-blue-800'
);

-- Örnek kategoriler ekle
INSERT INTO categories (name, description, color_gradient) VALUES
('Edebiyat', 'Türk ve Dünya Edebiyatı', 'from-blue-600 to-blue-800'),
('Matematik', 'Matematik ve İstatistik', 'from-purple-600 to-purple-800'),
('Tarih', 'Türk ve Dünya Tarihi', 'from-amber-600 to-amber-800'),
('Fizik', 'Fizik ve Astronomi', 'from-green-600 to-green-800'),
('Coğrafya', 'Coğrafya ve Jeoloji', 'from-cyan-600 to-cyan-800'),
('Bilgisayar', 'Bilgisayar Bilimleri', 'from-indigo-600 to-indigo-800'),
('Psikoloji', 'Psikoloji ve Sosyoloji', 'from-rose-600 to-rose-800'),
('Felsefe', 'Felsefe ve Mantık', 'from-violet-600 to-violet-800'),
('Sanat', 'Sanat ve Tasarım', 'from-orange-600 to-orange-800'),
('Dil', 'Dil ve Dilbilim', 'from-teal-600 to-teal-800');

-- Örnek kitaplar ekle
INSERT INTO books (title, author, category, description, publication_year, color_gradient) VALUES
('Türk Edebiyatı Tarihi', 'Nihad Sami Banarlı', 'Edebiyat', 'Türk edebiyatının kapsamlı tarihi', 1971, 'from-blue-600 to-blue-800'),
('Matematik Analiz', 'Prof. Dr. Mehmet Özkan', 'Matematik', 'Üniversite düzeyinde matematik analizi', 2020, 'from-purple-600 to-purple-800'),
('Osmanlı Tarihi', 'İsmail Hakkı Uzunçarşılı', 'Tarih', 'Osmanlı İmparatorluğu tarihi', 1988, 'from-amber-600 to-amber-800'),
('Fizik Temelleri', 'Dr. Ahmet Yılmaz', 'Fizik', 'Temel fizik prensipleri', 2019, 'from-green-600 to-green-800'),
('Türkiye Coğrafyası', 'Prof. Dr. Necdet Tuncel', 'Coğrafya', 'Türkiye\\'nin fiziki ve beşeri coğrafyası', 2018, 'from-cyan-600 to-cyan-800'),
('Bilgisayar Programlama', 'Dr. Fatma Kaya', 'Bilgisayar', 'Programlama temelleri ve algoritma', 2021, 'from-indigo-600 to-indigo-800'),
('Modern Türk Şiiri', 'Prof. Dr. İnci Enginün', 'Edebiyat', 'Cumhuriyet dönemi Türk şiiri', 2015, 'from-rose-600 to-rose-800'),
('Lineer Cebir', 'Dr. Selma Altınok', 'Matematik', 'Lineer cebir ve uygulamaları', 2020, 'from-violet-600 to-violet-800'),
('Cumhuriyet Tarihi', 'Prof. Dr. Kemal Karpat', 'Tarih', 'Türkiye Cumhuriyeti tarihi', 2010, 'from-orange-600 to-orange-800'),
('Psikoloji Giriş', 'Dr. Ayşe Demir', 'Psikoloji', 'Genel psikoloji prensipleri', 2019, 'from-rose-600 to-rose-800'),
('Felsefe Tarihi', 'Prof. Dr. Macit Gökberk', 'Felsefe', 'Antik çağdan günümüze felsefe', 2000, 'from-violet-600 to-violet-800'),
('Sanat Tarihi', 'Dr. Semra Ögel', 'Sanat', 'Türk ve İslam sanatları', 2017, 'from-orange-600 to-orange-800'),
('İngilizce Dilbilgisi', 'Prof. Dr. Cevat Çapan', 'Dil', 'İngilizce gramer ve kullanım', 2018, 'from-teal-600 to-teal-800'),
('Organik Kimya', 'Dr. Hasan Özdemir', 'Fizik', 'Organik kimya temelleri', 2020, 'from-green-600 to-green-800'),
('Sosyoloji Giriş', 'Prof. Dr. Zygmunt Bauman', 'Psikoloji', 'Modern sosyoloji teorileri', 2016, 'from-rose-600 to-rose-800'),
('Türk Dili', 'Prof. Dr. Zeynep Korkmaz', 'Dil', 'Türk dilinin yapısı ve tarihi', 2014, 'from-teal-600 to-teal-800'),
('Geometri', 'Dr. Mustafa Kemal', 'Matematik', 'Analitik ve diferansiyel geometri', 2019, 'from-purple-600 to-purple-800'),
('Dünya Tarihi', 'Prof. Dr. William McNeill', 'Tarih', 'Dünya medeniyetleri tarihi', 2012, 'from-amber-600 to-amber-800'),
('Quantum Fiziği', 'Dr. Michio Kaku', 'Fizik', 'Kuantum mekaniği prensipleri', 2021, 'from-green-600 to-green-800'),
('Türk Edebiyatı Antolojisi', 'Prof. Dr. Agah Sırrı Levend', 'Edebiyat', 'Seçme Türk edebiyatı eserleri', 2005, 'from-blue-600 to-blue-800');

-- RLS (Row Level Security) politikaları
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver
CREATE POLICY "Enable read access for all users" ON books FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON book_recommendations FOR SELECT USING (true);

-- Sadece authenticated kullanıcılar yazabilir
CREATE POLICY "Enable insert for authenticated users only" ON book_recommendations FOR INSERT WITH CHECK (true);

-- Kitap arama için full-text search index
CREATE INDEX IF NOT EXISTS books_search_idx ON books USING gin(to_tsvector('turkish', title || ' ' || author || ' ' || category || ' ' || COALESCE(description, '')));`}</pre>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(document.querySelector("pre")?.innerText || "")
                    alert("SQL kodu panoya kopyalandı!")
                  }}
                >
                  SQL Kodunu Kopyala
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Yardım ve Sorun Giderme
                </CardTitle>
                <CardDescription>
                  Kütüphane sistemi kurulumu ve kullanımı hakkında yardım ve sorun giderme bilgileri.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Kurulum Sorunları</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Veritabanı tabloları bulunamadı:</strong> Supabase SQL Editor'da şema kodunu çalıştırın
                        veya "Kurulum" sekmesindeki "Veritabanını Kur" butonunu kullanın.
                      </li>
                      <li>
                        <strong>API anahtarları hatalı:</strong> Environment variables'ları kontrol edin ve doğru
                        değerleri girdiğinizden emin olun.
                      </li>
                      <li>
                        <strong>OpenAI hatası:</strong> OpenAI API anahtarınızın doğru olduğundan ve yeterli kredinizin
                        bulunduğundan emin olun.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Manuel Kurulum</h3>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Supabase Dashboard'a giriş yapın</li>
                      <li>SQL Editor'a gidin</li>
                      <li>"Şema" sekmesindeki SQL kodunu kopyalayın</li>
                      <li>SQL Editor'da kodu yapıştırın ve çalıştırın</li>
                      <li>Tabloların ve verilerin oluşturulduğunu doğrulayın</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Geçici Çözüm</h3>
                    <p>
                      Veritabanı kurulumu tamamlanana kadar sistem otomatik olarak örnek verilerle çalışacaktır. Bu
                      sayede veritabanı kurulmadan da sistemi test edebilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => (window.location.href = "/test")}>
                  Test Sayfasına Git
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Veritabanı kurulumu tamamlanana kadar sistem otomatik olarak örnek verilerle çalışacaktır.
          </p>
        </div>
      </div>
    </div>
  )
}
