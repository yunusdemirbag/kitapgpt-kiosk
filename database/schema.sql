-- Supabase veritabanı şeması
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
('Türkiye Coğrafyası', 'Prof. Dr. Necdet Tuncel', 'Coğrafya', 'Türkiye\'nin fiziki ve beşeri coğrafyası', 2018, 'from-cyan-600 to-cyan-800'),
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
CREATE INDEX IF NOT EXISTS books_search_idx ON books USING gin(to_tsvector('turkish', title || ' ' || author || ' ' || category || ' ' || COALESCE(description, '')));
