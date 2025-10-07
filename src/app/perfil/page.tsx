"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowLeft, UserIcon, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { saveUser, type User } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import NavbarApp from "@/components/NavbarApp"

export default function PerfilPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    birthDate: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        whatsapp: user.whatsapp || "",
        email: user.email || "",
        birthDate: user.birthDate || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) return

      const updatedUser: User = {
        ...user,
        name: formData.name,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        birthDate: formData.birthDate,
      }

      saveUser(updatedUser)
      updateUser(updatedUser)

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    })
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 rounded-b-3xl pb-6 pt-12 px-4">
          <div className="container mx-auto max-w-md text-center">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Meu Perfil</h1>
          </div>
        </header>

        <main className="container mx-auto max-w-md px-4 mt-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Faça login</h2>
            <p className="text-sm text-muted-foreground mb-6">Entre na sua conta para acessar seu perfil</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Fazer Login
            </Button>
          </Card>
        </main>

        <NavbarApp />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container mx-auto max-w-md">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Meu Perfil</h1>
            <p className="text-sm text-zinc-600">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 mt-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 mt-4">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </Card>
      </main>

      <NavbarApp />
    </div>
  )
}
