-- Supabase için tam veritabanı şeması
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce mevcut tabloları temizle (eğer varsa)
DROP TABLE IF EXISTS book_recommendations CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS failure_messages CASCADE;

-- Kitaplar tablosu
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  genre VARCHAR(200) NOT NULL,
  author VARCHAR(300) NOT NULL,
  publisher VARCHAR(300),
  pub_year INTEGER,
  description TEXT,
  language VARCHAR(10) DEFAULT 'tr',
  available_copies INTEGER DEFAULT 1,
  total_copies INTEGER DEFAULT 1,
  color_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-blue-800',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kitap kategorileri tablosu
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-blue-800'
);

-- Kitap önerileri tablosu
CREATE TABLE book_recommendations (
  id SERIAL PRIMARY KEY,
  user_input TEXT NOT NULL,
  recommended_books JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başarısızlık mesajları tablosu
CREATE TABLE failure_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kategorileri ekle
INSERT INTO categories (name, description, color_gradient) VALUES
('Distopya', 'Distopik romanlar ve gelecek kurguları', 'from-red-600 to-red-800'),
('Coming-of-Age', 'Büyüme ve olgunlaşma hikayeleri', 'from-green-600 to-green-800'),
('Romantik Klasik', 'Klasik romantik edebiyat', 'from-pink-600 to-pink-800'),
('Epik Fantastik', 'Büyük çaplı fantastik eserler', 'from-purple-600 to-purple-800'),
('Modern Klasik', 'Modern dönem klasikleri', 'from-blue-600 to-blue-800'),
('Macera', 'Macera ve keşif hikayeleri', 'from-orange-600 to-orange-800'),
('Tarihî Roman', 'Tarihi dönemleri konu alan romanlar', 'from-amber-600 to-amber-800'),
('Psikolojik Roman', 'Psikolojik derinlik içeren eserler', 'from-indigo-600 to-indigo-800'),
('Büyülü Gerçekçilik', 'Büyülü gerçekçilik akımı', 'from-emerald-600 to-emerald-800'),
('Bilimkurgu', 'Bilim kurgu ve teknoloji', 'from-cyan-600 to-cyan-800'),
('Gotik', 'Gotik edebiyat ve korku', 'from-gray-600 to-gray-800'),
('Fantastik', 'Fantastik edebiyat', 'from-violet-600 to-violet-800'),
('Fabl', 'Fabl ve alegorik eserler', 'from-yellow-600 to-yellow-800'),
('Korku', 'Korku ve gerilim', 'from-red-700 to-red-900'),
('Polisiye', 'Polisiye ve dedektif hikayeleri', 'from-slate-600 to-slate-800'),
('Popüler Bilim', 'Popüler bilim eserleri', 'from-teal-600 to-teal-800'),
('Kişisel Gelişim', 'Kişisel gelişim ve motivasyon', 'from-lime-600 to-lime-800'),
('Felsefe', 'Felsefi eserler', 'from-stone-600 to-stone-800'),
('Anı', 'Anı ve otobiyografi', 'from-rose-600 to-rose-800');

-- Başarısızlık mesajlarını ekle
INSERT INTO failure_messages (message) VALUES
('Üzgünüm, benzer türde kitap önerisi bulamadım; farklı bir favori deneyebilir misin?'),
('Şu an elimde bu kitaba yakın öneri yok; başka bir kitap adı girelim mi?'),
('Aradığın tarza uygun eser bulamadım; başka bir başlık yaz lütfen.'),
('Bu kitap için benzer öneri listem boş; farklı bir kitap dene.'),
('Sistemimde bu tarza uygun öneri yok; yeni bir favori girer misin?'),
('Maalesef benzer kitap öneremiyorum; başka bir eser dene.'),
('Bu başlığa yakın tavsiye bulamadım; farklı bir kitap ismi isteyelim mi?'),
('Benzer türde kitap mevcut değil; yeni bir tercih yaz lütfen.'),
('Öneri havuzum bu kitapta boş çıktı; başka bir başlık dener misin?'),
('Bu eserle eşleşen öneri yok; farklı bir kitap dene lütfen.'),
('Benzer tavsiye bulamadım; başka bir yazarı girer misin?'),
('Şimdilik bu tarza yakın önerim yok; farklı bir kitap adı gir.'),
('Bu isimle eşleşen öneri mevcut değil; yeni bir favori yaz.'),
('Ne yazık ki liste boş; başka bir kitap deneyelim mi?'),
('Bu kitap için öneri üretemiyorum; farklı bir eser gir.'),
('Benzer eser bulamadım; yeni bir kitap yaz lütfen.'),
('Tavsiye listem bu kitapta boş; başka bir başlık dene.'),
('Şu an benzer kitap önermiyorum; farklı bir tercih gir.'),
('Bu başlığa yakın öneri çıkmadı; yeni bir kitap adı yaz.'),
('Aynı türde kitap bulamadım; başka bir eser sor lütfen.'),
('Bu kitap için havuzum boş; farklı bir favori girer misin?'),
('Benzer öneri bulamıyorum; yeni bir kitap dene.'),
('Bu başlığa uygun öneri yok; başka bir kitap seç.'),
('Öneri listem dolmadı; farklı bir kitap adı gir lütfen.'),
('Bu esere yakın tavsiye yok; başka bir başlık dene.'),
('Maalesef bu tarza dair öneri bulamadım; yeni bir tercih yaz.'),
('Benzer kitap elimde yok; farklı bir eser girer misin?'),
('Bu favoriye uygun önerim bulunmuyor; başka bir kitap iste.'),
('Şu an benzer eser tavsiye edemiyorum; farklı bir isim dene.'),
('Bu kitapla eşleşen öneri yok; yeni bir başlık yaz lütfen.'),
('Tavsiye motoru benzer kitap bulamadı; başka bir eser sor.'),
('Bu tarza uygun kitap listemde yok; farklı bir kitap adı gir.'),
('Öneri havuzu boş; başka bir favori dene.'),
('Benzer öneri sunamıyorum; yeni bir kitap gir.'),
('Bu başlık için tavsiye bulunamadı; farklı bir kitap seç.'),
('Sistemimde bu tarza uygun eser yok; başka bir tercih gir.'),
('Bu kitapla ilgili öneri çıkmadı; yeni bir başlık dener misin?'),
('Benzer türde eser bulamadım; başka bir kitap sor.'),
('Öneri listem boş kaldı; farklı bir favori gir.'),
('Bu kitap için eşleşme yok; yeni bir eser yaz lütfen.'),
('Aynı tarza uygun kitap bulamadım; başka bir başlık dene.'),
('Bu esere benzer öneri yok; farklı bir kitap adı gir.'),
('Tavsiye motoru boş döndü; yeni bir tercih yaz.'),
('Bu başlıkta eşleşme bulamadım; başka bir favori dene.'),
('Benzer kitap mevcut değil; farklı bir eser sor.'),
('Bu kitap için öneri listem boş; yeni bir başlık yaz.'),
('Şu an benzer öneri sunamıyorum; başka bir kitap dene.'),
('Bu tarza uygun eser yok; farklı bir kitap gir lütfen.'),
('Öneri kaynağı boş; başka bir favori yaz.'),
('Bu kitapla örtüşen tavsiye yok; yeni bir başlık dene.'),
('Ne yazık ki benzer kitap bulamadım; başka bir eser gir.'),
('Bu başlığa uygun öneri bulunamadı; farklı bir kitap iste.'),
('Tavsiye motorunda eşleşme yok; yeni bir favori dene.'),
('Bu eser için benzer liste boş; başka bir kitap seç.'),
('Benzer öneri elimde yok; farklı bir kitap adı gir.'),
('Bu kitabın tarzına uygun tavsiye bulamadım; yeni bir eser yaz.'),
('Öneri havuzu dolmadı; başka bir başlık dene.'),
('Bu kitap için benzer eser yok; farklı bir tercih gir.'),
('Bu başlıkta tavsiye çıkmadı; yeni bir kitap sor.'),
('Aynı türde öneri üretemiyorum; başka bir kitap yaz lütfen.'),
('Bu esere yakın kitap yok; yeni bir başlık dene.'),
('Tavsiye listesi boş; farklı bir favori gir.'),
('Bu kitap için öneri bulamadım; başka bir eser dene.'),
('Benzer eser mevcut değil; yeni bir kitap adı gir.'),
('Bu başlığa benzer öneri yok; farklı bir kitap yaz.'),
('Öneri motoru bu kitapta boş; başka bir başlık dene.'),
('Bu tarza uygun kitap bulamadım; yeni bir favori sor.'),
('Bu kitap için benzer liste yok; farklı bir eser gir.'),
('Tavsiye sistemim bu başlıkta boş; başka bir kitap deneyelim.'),
('Bu esere uygun öneri bulunamadı; yeni bir başlık yaz.'),
('Şu an benzer kitap yok; farklı bir tercih gir lütfen.'),
('Bu kitapla ilgili tavsiye sunamıyorum; başka bir eser dene.'),
('Öneri listem boş kaldı; yeni bir kitap adı gir.'),
('Bu favori için benzer yok; farklı bir kitap sor.'),
('Benzer eser bulunamadı; yeni bir başlık dene.'),
('Bu başlığı eşleyen kitap çıkmadı; başka bir tercih yaz.'),
('Tavsiye havuzum dolmadı; farklı bir favorisinden bahset.'),
('Bu kitap için öneri veremiyorum; yeni bir eser gir lütfen.'),
('Aynı tarza uygun kitap yok; başka bir başlık dene.'),
('Bu eserle ilgili tavsiye bulamadım; yeni bir kitap seç.'),
('Benzer kitap mevcut değil; farklı bir kitap adı yaz.'),
('Bu başlıkta öneri boş; başka bir favori sor.'),
('Tavsiye motoru bu kitapta sonuç vermedi; yeni bir başlık dene.'),
('Bu kitap için havuzum boş; farklı bir eser gir.'),
('Benzer eser bulamadım; yeni bir tercih yaz.'),
('Öneri listemde yok; başka bir kitap dene.'),
('Bu başlığa uygun kitap bulunmadı; farklı bir başlık gir.'),
('Bu eserle eşleşen tavsiye yok; yeni bir favori sor.'),
('Tavsiye motoru uygun kitap bulamadı; başka bir eser dene.'),
('Bu kitap için benzer çıkmadı; yeni bir kitap adı yaz.'),
('Aynı tarza uygun öneri yok; farklı bir tercih gir.'),
('Bu başlıkta sonuç bulamadım; yeni bir kitap sor.'),
('Öneri listesi boş; başka bir favori dene.'),
('Bu kitap için tavsiye üretemiyorum; yeni bir eser yaz lütfen.'),
('Benzer kitap elimde yok; farklı bir başlık gir.'),
('Bu esere uygun tavsiye yok; yeni bir kitap dene.'),
('Tavsiye motoru bu başlıkta boş döndü; başka bir kitap seç.'),
('Bu kitap için öneri bulamadım; farklı bir eser yaz.'),
('Benzer eser mevcut değil; yeni bir tercih gir lütfen.'),
('Şu an bu başlıkta öneri yok; başka bir kitap denemek ister misin?');

-- Kitapları ekle
INSERT INTO books (title, genre, author, publisher, pub_year, color_gradient) VALUES
('1984', 'Distopya', 'George Orwell', 'Secker & Warburg', 1949, 'from-red-600 to-red-800'),
('To Kill a Mockingbird', 'Coming-of-Age', 'Harper Lee', 'J. B. Lippincott', 1960, 'from-green-600 to-green-800'),
('Pride and Prejudice', 'Romantik Klasik', 'Jane Austen', 'T. Egerton', 1813, 'from-pink-600 to-pink-800'),
('The Lord of the Rings', 'Epik Fantastik', 'J. R. R. Tolkien', 'Allen & Unwin', 1954, 'from-purple-600 to-purple-800'),
('The Great Gatsby', 'Modern Klasik', 'F. Scott Fitzgerald', 'Charles Scribner''s Sons', 1925, 'from-blue-600 to-blue-800'),
('Moby-Dick', 'Macera', 'Herman Melville', 'Harper & Brothers', 1851, 'from-orange-600 to-orange-800'),
('War and Peace', 'Tarihî Roman', 'Lev Tolstoy', 'The Russian Messenger', 1869, 'from-amber-600 to-amber-800'),
('Crime and Punishment', 'Psikolojik Roman', 'Fyodor Dostoyevski', 'The Russian Messenger', 1866, 'from-indigo-600 to-indigo-800'),
('One Hundred Years of Solitude', 'Büyülü Gerçekçilik', 'Gabriel García Márquez', 'Editorial Sudamericana', 1967, 'from-emerald-600 to-emerald-800'),
('Brave New World', 'Distopya', 'Aldous Huxley', 'Chatto & Windus', 1932, 'from-red-600 to-red-800'),
('The Catcher in the Rye', 'Coming-of-Age', 'J. D. Salinger', 'Little, Brown & Co.', 1951, 'from-green-600 to-green-800'),
('Jane Eyre', 'Gotik', 'Charlotte Brontë', 'Smith, Elder & Co.', 1847, 'from-gray-600 to-gray-800'),
('The Hobbit', 'Fantastik', 'J. R. R. Tolkien', 'Allen & Unwin', 1937, 'from-violet-600 to-violet-800'),
('Wuthering Heights', 'Gotik', 'Emily Brontë', 'Thomas Cautley Newby', 1847, 'from-gray-600 to-gray-800'),
('Fahrenheit 451', 'Bilimkurgu', 'Ray Bradbury', 'Ballantine Books', 1953, 'from-cyan-600 to-cyan-800'),
('Les Misérables', 'Tarihî Roman', 'Victor Hugo', 'A. Lacroix & Verboeckhoven', 1862, 'from-amber-600 to-amber-800'),
('Anna Karenina', 'Tarihî Roman', 'Lev Tolstoy', 'The Russian Messenger', 1877, 'from-amber-600 to-amber-800'),
('The Brothers Karamazov', 'Psikolojik Roman', 'Fyodor Dostoyevski', 'The Russian Messenger', 1880, 'from-indigo-600 to-indigo-800'),
('Don Quixote', 'Macera', 'Miguel de Cervantes', 'Francisco de Robles', 1605, 'from-orange-600 to-orange-800'),
('The Alchemist', 'Fabl', 'Paulo Coelho', 'HarperCollins', 1988, 'from-yellow-600 to-yellow-800'),
('The Little Prince', 'Fabl', 'Antoine de Saint-Exupéry', 'Reynal & Hitchcock', 1943, 'from-yellow-600 to-yellow-800'),
('Harry Potter and the Sorcerer''s Stone', 'Fantastik', 'J. K. Rowling', 'Bloomsbury', 1997, 'from-violet-600 to-violet-800'),
('The Chronicles of Narnia', 'Fantastik', 'C. S. Lewis', 'Geoffrey Bles', 1950, 'from-violet-600 to-violet-800'),
('The Picture of Dorian Gray', 'Gotik', 'Oscar Wilde', 'Ward, Lock & Co.', 1890, 'from-gray-600 to-gray-800'),
('Dracula', 'Korku', 'Bram Stoker', 'Archibald Constable', 1897, 'from-red-700 to-red-900'),
('Frankenstein', 'Korku', 'Mary Shelley', 'Lackington, Hughes', 1818, 'from-red-700 to-red-900'),
('The Old Man and the Sea', 'Macera', 'Ernest Hemingway', 'Charles Scribner''s Sons', 1952, 'from-orange-600 to-orange-800'),
('A Tale of Two Cities', 'Tarihî Roman', 'Charles Dickens', 'Chapman & Hall', 1859, 'from-amber-600 to-amber-800'),
('The Metamorphosis', 'Modern Klasik', 'Franz Kafka', 'Kurt Wolff Verlag', 1915, 'from-blue-600 to-blue-800'),
('Lolita', 'Modern Klasik', 'Vladimir Nabokov', 'Olympia Press', 1955, 'from-blue-600 to-blue-800'),
('Ulysses', 'Modern Klasik', 'James Joyce', 'Shakespeare and Co.', 1922, 'from-blue-600 to-blue-800'),
('The Grapes of Wrath', 'Modern Klasik', 'John Steinbeck', 'Viking Press', 1939, 'from-blue-600 to-blue-800'),
('The Sound and the Fury', 'Modern Klasik', 'William Faulkner', 'Jonathan Cape & Harrison Smith', 1929, 'from-blue-600 to-blue-800'),
('A Clockwork Orange', 'Distopya', 'Anthony Burgess', 'William Heinemann', 1962, 'from-red-600 to-red-800'),
('Beloved', 'Tarihî Roman', 'Toni Morrison', 'Alfred A. Knopf', 1987, 'from-amber-600 to-amber-800'),
('Invisible Man', 'Modern Klasik', 'Ralph Ellison', 'Random House', 1952, 'from-blue-600 to-blue-800'),
('The Kite Runner', 'Modern Klasik', 'Khaled Hosseini', 'Riverhead Books', 2003, 'from-blue-600 to-blue-800'),
('The Name of the Rose', 'Polisiye', 'Umberto Eco', 'Bompiani', 1980, 'from-slate-600 to-slate-800'),
('Life of Pi', 'Macera', 'Yann Martel', 'Knopf Canada', 2001, 'from-orange-600 to-orange-800'),
('Slaughterhouse-Five', 'Bilimkurgu', 'Kurt Vonnegut', 'Delacorte Press', 1969, 'from-cyan-600 to-cyan-800'),
('The Stranger', 'Felsefe', 'Albert Camus', 'Gallimard', 1942, 'from-stone-600 to-stone-800'),
('Catch-22', 'Bilimkurgu', 'Joseph Heller', 'Simon & Schuster', 1961, 'from-cyan-600 to-cyan-800'),
('The Handmaid''s Tale', 'Distopya', 'Margaret Atwood', 'McClelland & Stewart', 1985, 'from-red-600 to-red-800'),
('The Road', 'Bilimkurgu', 'Cormac McCarthy', 'Alfred A. Knopf', 2006, 'from-cyan-600 to-cyan-800'),
('Dune', 'Bilimkurgu', 'Frank Herbert', 'Chilton Books', 1965, 'from-cyan-600 to-cyan-800'),
('The Shining', 'Korku', 'Stephen King', 'Doubleday', 1977, 'from-red-700 to-red-900'),
('It', 'Korku', 'Stephen King', 'Viking Press', 1986, 'from-red-700 to-red-900'),
('Gone with the Wind', 'Tarihî Roman', 'Margaret Mitchell', 'Macmillan', 1936, 'from-amber-600 to-amber-800'),
('A Game of Thrones', 'Fantastik', 'George R. R. Martin', 'Bantam Spectra', 1996, 'from-violet-600 to-violet-800'),
('The Girl with the Dragon Tattoo', 'Polisiye', 'Stieg Larsson', 'Norstedts Förlag', 2005, 'from-slate-600 to-slate-800'),
('The Da Vinci Code', 'Polisiye', 'Dan Brown', 'Doubleday', 2003, 'from-slate-600 to-slate-800'),
('Memoirs of a Geisha', 'Tarihî Roman', 'Arthur Golden', 'Alfred A. Knopf', 1997, 'from-amber-600 to-amber-800'),
('The Fault in Our Stars', 'Coming-of-Age', 'John Green', 'Dutton Books', 2012, 'from-green-600 to-green-800'),
('Ready Player One', 'Bilimkurgu', 'Ernest Cline', 'Crown Publishing', 2011, 'from-cyan-600 to-cyan-800'),
('The Hunger Games', 'Distopya', 'Suzanne Collins', 'Scholastic Press', 2008, 'from-red-600 to-red-800'),
('The Silence of the Lambs', 'Korku', 'Thomas Harris', 'St. Martin''s Press', 1988, 'from-red-700 to-red-900'),
('Jurassic Park', 'Bilimkurgu', 'Michael Crichton', 'Alfred A. Knopf', 1990, 'from-cyan-600 to-cyan-800'),
('Sapiens', 'Popüler Bilim', 'Yuval Noah Harari', 'Harvill Secker', 2011, 'from-teal-600 to-teal-800'),
('Thinking, Fast and Slow', 'Popüler Bilim', 'Daniel Kahneman', 'Farrar, Straus and Giroux', 2011, 'from-teal-600 to-teal-800'),
('The Power of Habit', 'Kişisel Gelişim', 'Charles Duhigg', 'Random House', 2012, 'from-lime-600 to-lime-800'),
('Educated', 'Anı', 'Tara Westover', 'Random House', 2018, 'from-rose-600 to-rose-800'),
('Becoming', 'Anı', 'Michelle Obama', 'Crown Publishing', 2018, 'from-rose-600 to-rose-800'),
('The Diary of a Young Girl', 'Anı', 'Anne Frank', 'Contact Publishing', 1947, 'from-rose-600 to-rose-800'),
('Man''s Search for Meaning', 'Felsefe', 'Viktor Frankl', 'Beacon Press', 1946, 'from-stone-600 to-stone-800'),
('Meditations', 'Felsefe', 'Marcus Aurelius', 'Unknown', 180, 'from-stone-600 to-stone-800'),
('The Prince', 'Felsefe', 'Niccolò Machiavelli', 'Antonio Blado', 1532, 'from-stone-600 to-stone-800'),
('Republic', 'Felsefe', 'Plato', 'Unknown', -385, 'from-stone-600 to-stone-800'),
('The Art of War', 'Felsefe', 'Sun Tzu', 'Unknown', -500, 'from-stone-600 to-stone-800'),
('Kürk Mantolu Madonna', 'Modern Klasik', 'Sabahattin Ali', 'Yapı Kredi Yay.', 1943, 'from-blue-600 to-blue-800'),
('Tutunamayanlar', 'Modern Klasik', 'Oğuz Atay', 'İletişim Yay.', 1972, 'from-blue-600 to-blue-800'),
('Saatleri Ayarlama Enstitüsü', 'Modern Klasik', 'Ahmet Hamdi Tanpınar', 'Dergâh', 1961, 'from-blue-600 to-blue-800'),
('Serenad', 'Tarihî Roman', 'Zülfü Livaneli', 'Doğan Kitap', 2011, 'from-amber-600 to-amber-800'),
('İnce Memed', 'Modern Klasik', 'Yaşar Kemal', 'Yapı Kredi Yay.', 1955, 'from-blue-600 to-blue-800'),
('Çalıkuşu', 'Romantik Klasik', 'Reşat Nuri Güntekin', 'İnkılâp Kitabevi', 1922, 'from-pink-600 to-pink-800'),
('Ben, Robot', 'Bilimkurgu', 'Isaac Asimov', 'Gnome Press', 1950, 'from-cyan-600 to-cyan-800'),
('Neuromancer', 'Bilimkurgu', 'William Gibson', 'Ace Books', 1984, 'from-cyan-600 to-cyan-800'),
('Snow Crash', 'Bilimkurgu', 'Neal Stephenson', 'Bantam Books', 1992, 'from-cyan-600 to-cyan-800'),
('The Martian', 'Bilimkurgu', 'Andy Weir', 'Crown Publishing', 2011, 'from-cyan-600 to-cyan-800'),
('Ready Player Two', 'Bilimkurgu', 'Ernest Cline', 'Ballantine Books', 2020, 'from-cyan-600 to-cyan-800'),
('The Midnight Library', 'Fantastik', 'Matt Haig', 'Canongate', 2020, 'from-violet-600 to-violet-800'),
('Normal People', 'Modern Klasik', 'Sally Rooney', 'Faber & Faber', 2018, 'from-blue-600 to-blue-800'),
('Where the Crawdads Sing', 'Modern Klasik', 'Delia Owens', 'G. P. Putnam''s Sons', 2018, 'from-blue-600 to-blue-800'),
('Atomic Habits', 'Kişisel Gelişim', 'James Clear', 'Avery', 2018, 'from-lime-600 to-lime-800'),
('Rich Dad Poor Dad', 'Kişisel Gelişim', 'Robert Kiyosaki', 'Plata Publishing', 1997, 'from-lime-600 to-lime-800'),
('Think and Grow Rich', 'Kişisel Gelişim', 'Napoleon Hill', 'The Ralston Society', 1937, 'from-lime-600 to-lime-800'),
('The 7 Habits of Highly Effective People', 'Kişisel Gelişim', 'Stephen R. Covey', 'Free Press', 1989, 'from-lime-600 to-lime-800'),
('Good to Great', 'Kişisel Gelişim', 'Jim Collins', 'HarperBusiness', 2001, 'from-lime-600 to-lime-800'),
('Zero to One', 'Kişisel Gelişim', 'Peter Thiel', 'Crown Business', 2014, 'from-lime-600 to-lime-800'),
('The Lean Startup', 'Kişisel Gelişim', 'Eric Ries', 'Crown Business', 2011, 'from-lime-600 to-lime-800'),
('The Intelligent Investor', 'Kişisel Gelişim', 'Benjamin Graham', 'Harper & Brothers', 1949, 'from-lime-600 to-lime-800'),
('Thinking in Systems', 'Popüler Bilim', 'Donella Meadows', 'Chelsea Green', 2008, 'from-teal-600 to-teal-800'),
('Gödel, Escher, Bach', 'Popüler Bilim', 'Douglas Hofstadter', 'Basic Books', 1979, 'from-teal-600 to-teal-800'),
('A Brief History of Time', 'Popüler Bilim', 'Stephen Hawking', 'Bantam Books', 1988, 'from-teal-600 to-teal-800'),
('Cosmos', 'Popüler Bilim', 'Carl Sagan', 'Random House', 1980, 'from-teal-600 to-teal-800'),
('The Selfish Gene', 'Popüler Bilim', 'Richard Dawkins', 'Oxford University Press', 1976, 'from-teal-600 to-teal-800'),
('The Origin of Species', 'Popüler Bilim', 'Charles Darwin', 'John Murray', 1859, 'from-teal-600 to-teal-800'),
('The Double Helix', 'Popüler Bilim', 'James D. Watson', 'Atheneum', 1968, 'from-teal-600 to-teal-800'),
('The Immortal Life of Henrietta Lacks', 'Popüler Bilim', 'Rebecca Skloot', 'Crown Publishing', 2010, 'from-teal-600 to-teal-800'),
('Silent Spring', 'Popüler Bilim', 'Rachel Carson', 'Houghton Mifflin', 1962, 'from-teal-600 to-teal-800'),
('Guns, Germs, and Steel', 'Popüler Bilim', 'Jared Diamond', 'W. W. Norton', 1997, 'from-teal-600 to-teal-800'),
('The Second Sex', 'Felsefe', 'Simone de Beauvoir', 'Gallimard', 1949, 'from-stone-600 to-stone-800'),
('Orientalism', 'Felsefe', 'Edward Said', 'Pantheon Books', 1978, 'from-stone-600 to-stone-800'),
('The Communist Manifesto', 'Felsefe', 'Karl Marx & Friedrich Engels', 'Deutsch', 1848, 'from-stone-600 to-stone-800'),
('The Wealth of Nations', 'Felsefe', 'Adam Smith', 'Strahan & Cadell', 1776, 'from-stone-600 to-stone-800'),
('Walden', 'Felsefe', 'Henry David Thoreau', 'Ticknor and Fields', 1854, 'from-stone-600 to-stone-800'),
('The Art of Happiness', 'Kişisel Gelişim', 'Dalai Lama XIV & Howard Cutler', 'Riverhead Books', 1998, 'from-lime-600 to-lime-800'),
('Tuesdays with Morrie', 'Anı', 'Mitch Albom', 'Doubleday', 1997, 'from-rose-600 to-rose-800');

-- RLS (Row Level Security) politikaları
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_messages ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver
CREATE POLICY "Enable read access for all users" ON books FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON book_recommendations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON failure_messages FOR SELECT USING (true);

-- Sadece authenticated kullanıcılar yazabilir
CREATE POLICY "Enable insert for authenticated users only" ON book_recommendations FOR INSERT WITH CHECK (true);

-- Kitap arama için full-text search index
CREATE INDEX IF NOT EXISTS books_search_idx ON books USING gin(to_tsvector('turkish', title || ' ' || author || ' ' || genre || ' ' || COALESCE(description, '')));

-- Kategori renkleri için index
CREATE INDEX IF NOT EXISTS books_genre_idx ON books(genre);
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);
