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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">
          Cadastro de Cliente
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Informe seu nome e WhatsApp para criar sua conta
        </p>

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
    </div>
  )
}
