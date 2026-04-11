import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'
import { ConsoleEgg } from '@/components/ConsoleEgg'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { CookieBanner } from '@/components/CookieBanner'
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'From concept to creation | behuddle',
  description: 'The space where lonely side-projects turn into real startups. Find your co-founder or contribute to something bigger.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicons/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", inter.variable)}>
      <body className={`${bricolage.variable} ${inter.variable} ${instrumentSerif.variable} bg-texture antialiased min-h-screen`}>
        <ConsoleEgg />
        <ToastProvider />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
