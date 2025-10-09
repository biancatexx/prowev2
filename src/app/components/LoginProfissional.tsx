"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function LoginProfissional() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // login agora retorna o objeto completo do profissional
      const professional = await login(email, password)

      if (professional) {
        // salva o ID no localStorage para usar na página de agendamento
        localStorage.setItem("mock_logged_professional_id", professional.id)
        toast.success("Login realizado com sucesso!")

        // redireciona para o dashboard ou página de agendamento
        router.push("/admin/dashboard")
      } else {
        toast.error("Email ou senha incorretos")
      }
    } catch (error) {
      console.error("[Login Error]", error)
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8 p-0">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-1">Login do Profissional</h1>
        <p className="text-muted-foreground text-sm">Entre com sua conta para acessar seu dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="mb-2">
          <Label htmlFor="email-pro">E-mail</Label>
          <Input
            id="email-pro"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10"
          />
        </div>

        <div className="mb-2">
          <Label htmlFor="password-pro">Senha</Label>
          <Input
            id="password-pro"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10"
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <div className="text-center space-y-4">
          <Link href="#" className="text-sm text-primary hover:underline block">
            Esqueceu sua senha?
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link href="/login/cadastro-profissional" className="text-primary font-semibold hover:underline">
              Cadastre-se aqui
            </Link>
          </div>

          <div className="mt-4 p-4 bg-primary/20 rounded-lg text-sm space-y-3 text-center">
            <p className="font-semibold mb-0">Dados para teste:</p>
            <div className="">
              <p className="text-xs text-muted-foreground">s@email.com</p>
              <p className="text-xs text-muted-foreground">123456</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}
