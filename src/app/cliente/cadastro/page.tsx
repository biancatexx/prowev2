"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ensureClientExists, initializeMocks } from "@/data/mockData"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function CadastroCliente() {
  const router = useRouter()
  const { loginClient } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeMocks()
  }, [])

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`
    }
    if (value.length > 10) {
      value = `${value.substring(0, 10)}-${value.substring(10, 14)}`
    } else if (value.length > 9) {
      const length = value.length
      const prefix = value.substring(0, length - 4)
      const suffix = value.substring(length - 4)
      value = `${prefix}-${suffix}`
    }

    setWhatsapp(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanWhatsapp = whatsapp.replace(/\D/g, "")
    if (!name.trim() || cleanWhatsapp.length < 10) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e um WhatsApp válido.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      ensureClientExists(name.trim(), cleanWhatsapp)

      const success = await loginClient(cleanWhatsapp)
      if (success) {
        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo(a), seu login foi feito com sucesso.",
        })
        router.push("/")
      } else {
        toast({
          title: "Erro no login automático",
          description: "Seu cadastro foi criado, mas o login falhou.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg text-center">
          <Link href="/cliente" className="flex items-center gap-2 text-primary-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-xl px-4 py-4">
        <Card className="p-6">
          <div className="">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Cadastro de cliente</h2>
              <p className="text-muted-foreground"> Informe seu nome e WhatsApp para criar sua conta</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Bianca Teixeira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  required
                  className="h-10"
                  maxLength={15}
                />
              </div>

              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>

          </div>
        </Card>
      </main>
    </div>


  )
}
