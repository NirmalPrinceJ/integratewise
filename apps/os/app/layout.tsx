import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "IntegrateWise - Your Business Command Center",
  description: "The AI-powered operating system for modern businesses. Connect all your tools, automate workflows, and get intelligent insights.",
  generator: "IntegrateWise",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "IntegrateWise - Your Business Command Center",
    description: "The AI-powered operating system for modern businesses. Connect all your tools, automate workflows, and get intelligent insights.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntegrateWise - Your Business Command Center",
    description: "The AI-powered operating system for modern businesses.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
