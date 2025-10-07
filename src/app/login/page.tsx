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
import { toast } from "sonner"

export default function LoginPage() {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent p-6">
        <div className="container mx-auto max-w-md">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-screen-lg px-4 py-6">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8 bg-white rounded-2xl p-8 border border-border shadow-lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Área do Profissional</h1>
              <p className="text-muted-foreground">Entre com sua conta para acessar seu dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
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
                    <span className="px-4 bg-white text-muted-foreground">ou</span>
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
                  <div className="space-y-2">
                    <div className="p-2 bg-background rounded">
                      <p className="font-medium">Studio Beleza Premium</p>
                      <p className="text-xs text-muted-foreground">Email: profissional@teste.com</p>
                      <p className="text-xs text-muted-foreground">Senha: 123456</p>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <p className="font-medium">Espaço Maria Silva</p>
                      <p className="text-xs text-muted-foreground">Email: maria@salao.com</p>
                      <p className="text-xs text-muted-foreground">Senha: 123456</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
