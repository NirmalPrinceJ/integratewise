import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "IntegrateWise — Reliable Integration. Accelerated Automation.",
  description: "Normalize once. Render anywhere. Cut churn 15–25% with a schema-first, AI-assisted automation layer.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "IntegrateWise — Reliable Integration. Accelerated Automation.",
    description: "Normalize once. Render anywhere. Cut churn 15–25% with a schema-first, AI-assisted automation layer.",
    siteName: "IntegrateWise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntegrateWise — Reliable Integration. Accelerated Automation.",
    description: "Normalize once. Render anywhere. Cut churn 15–25% with a schema-first, AI-assisted automation layer.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "IntegrateWise",
              url: "https://integratewise.co",
              logo: "https://integratewise.co/logo.png",
              sameAs: [],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: "connect@integratewise.co",
                  contactType: "sales",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
