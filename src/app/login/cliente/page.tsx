"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function LoginClientePage() {
  const router = useRouter()
  const { loginClient } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await loginClient(whatsapp.replace(/\D/g, ""))

      if (success) {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        })
        router.push("/")
      } else {
        toast({
          title: "WhatsApp não encontrado",
          description: "Cadastre-se para continuar.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer login.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 p-6">
        <div className="container mx-auto max-w-md">
          <Link href="/" className="flex items-center gap-2 text-zinc-800 hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-white rounded-2xl p-8 border border-border shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Entrar</h1>
            <p className="text-muted-foreground">Digite seu WhatsApp para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 98765-4321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Ainda não tem uma conta?{" "}
              <Link href="/cadastro-cliente" className="text-primary font-semibold hover:underline">
                Cadastre-se aqui
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
