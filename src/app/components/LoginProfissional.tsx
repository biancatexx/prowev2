"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// ArrowLeft e o useAuth e toast serão resolvidos no componente pai, ou você pode reimportá-los. 
// Para simplificar, vou assumir que você moveu apenas a lógica do formulário.

import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner" // ou useToast, dependendo de qual você usa

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
      const success = await login(email, password)

      if (success) {
        toast.success("Login realizado com sucesso!")
        router.push("/admin/dashboard")
      } else {
        toast.error("Email ou senha incorretos")
      }
    } catch (error) {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  // RETORNE APENAS O CONTEÚDO QUE SERÁ EXIBIDO DENTRO DA ABA
  return (
    <div className="w-full space-y-8 p-0">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-1">Login do Profissional</h1>
        <p className="text-muted-foreground text-sm">Entre com sua conta para acessar seu dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
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

        <div className="space-y-2">
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

          <div className="mt-4 p-4 bg-muted rounded-lg text-sm space-y-3">
            <p className="font-semibold text-base">Dados para teste:</p>
            <div className="p-2 bg-background rounded">
              <p className="font-medium">Studio Beleza Premium</p>
              <p className="text-xs text-muted-foreground">Email: profissional@teste.com</p>
              <p className="text-xs text-muted-foreground">Senha: 123456</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}