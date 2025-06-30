import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Bartın Üniversitesi Kütüphane Kiosku",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Bartın Üniversitesi Kütüphane Kitap Öneri Kiosku",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
