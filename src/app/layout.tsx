import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap", // garante renderização estável da fonte
})

export const metadata: Metadata = {
  title: "Prowe - Agende seu horário com os melhores profissionais",
  description:
    "Encontre e agende serviços de beleza com os melhores profissionais perto de você",
  authors: [{ name: "Prowe" }],
  openGraph: {
    type: "website",
    title: "Prowe - Agende seu horário com os melhores profissionais",
    description:
      "Encontre e agende serviços de beleza com os melhores profissionais perto de você",
    images: [
      {
        url: "https://storage.googleapis.com/gpt-engineer-file-uploads/84qFikrz2BNFWQ9QDZNQq36YFSq2/social-images/social-1759442456718-imagem_2025-10-02_190056712.png",
        width: 1200,
        height: 630,
        alt: "Prowe - Agendamento de Serviços",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    title: "Prowe - Agende seu horário com os melhores profissionais",
    description:
      "Encontre e agende serviços de beleza com os melhores profissionais perto de você",
    images: [
      "https://storage.googleapis.com/gpt-engineer-file-uploads/84qFikrz2BNFWQ9QDZNQq36YFSq2/social-images/social-1759442456718-imagem_2025-10-02_190056712.png",
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      {/* Adicionado suppressHydrationWarning para evitar erro de mismatch da fonte */}
      <body
        className={`${poppins.variable} font-sans`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div />}>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
