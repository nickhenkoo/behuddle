import type { Metadata } from 'next'
import { Syne, DM_Sans, Geist } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'
import { ConsoleEgg } from '@/components/ConsoleEgg'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'behuddle',
  description: 'The space where lonely side-projects turn into real startups. Find your co-founder or contribute to something bigger.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${syne.variable} ${dmSans.variable} bg-texture antialiased min-h-screen relative`}>
        <ConsoleEgg />
        {children}
      </body>
    </html>
  )
}
