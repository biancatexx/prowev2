"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { UserIcon, LogOut, Edit2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { saveUser, type User } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import NavbarApp from "@/components/NavbarApp"

export default function PerfilPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const { toast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false) // Novo estado para controle de edição
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    birthDate: "",
  })

  // 1. Inicializa o formulário com os dados do usuário
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
    if (!isEditing) return setIsEditing(true) // Se não estiver editando, apenas habilita a edição

    setLoading(true)
    try {
      if (!user) return
      const updatedUser: User = {
        ...user,
        name: formData.name,
        whatsapp: formData.whatsapp.replace(/\D/g, ""), // Limpa o WhatsApp
        email: formData.email,
        birthDate: formData.birthDate,
      }
      // 1. Salva nos dados mockados
      saveUser(updatedUser)
      // 2. Atualiza o contexto global
      updateUser(updatedUser)
      
      setIsEditing(false) // Desliga o modo de edição após salvar
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

  // Header fixo
  const Header = () => (
    <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
      <div className="container mx-auto max-w-screen-lg text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Perfil do Cliente
        </h1>
      </div>
    </header>
  )

  // Main varia conforme login
  const MainContent = () => {
    if (!user) {
      return (
        <main className="container mx-auto max-w-screen-lg px-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Faça login</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Entre na sua conta para acessar seu perfil
            </p>
            <Button onClick={() => router.push("/login")}>
              Fazer Login
            </Button>
          </Card>
        </main>
      )
    }

    return (
      <main className="container mx-auto max-w-screen-lg px-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={!isEditing} // Desabilitado
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
                disabled={!isEditing} // Desabilitado
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing} // Desabilitado
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                disabled={!isEditing} // Desabilitado
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Salvando..." : (
                isEditing ? "Salvar Alterações" : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </>
                )
              )}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <MainContent />
      <NavbarApp />
    </div>
  )
}
