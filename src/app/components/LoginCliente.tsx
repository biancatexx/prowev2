"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export function LoginCliente() {
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

  // RETORNE APENAS O CONTEÚDO QUE SERÁ EXIBIDO DENTRO DA ABA
  return (
    <div className="w-full space-y-8 p-0">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-1">Login do Cliente</h1>
        <p className="text-muted-foreground text-sm">Digite seu WhatsApp para continuar</p>
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
            className="h-10"
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
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
  )
}