"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { UserIcon, LogOut, Edit2, Save } from "lucide-react" // Importado Save
import { useAuth } from "@/contexts/AuthContext" // Assumindo que seu caminho do AuthContext é este
import { saveUser, type User } from "@/data/mockData"
import NavbarApp from "@/components/NavbarApp"
import { toast } from "sonner"

// Componente Header movido para fora do PerfilPage para otimização
const Header = () => (
  <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
    <div className="container mx-auto max-w-screen-lg text-center">
      <h1 className="text-2xl font-bold text-primary-foreground">
        Perfil do Cliente
      </h1>
    </div>
  </header>
)

// Tipagem para as props do MainContent
interface MainContentProps {
  user: User | null;
  formData: {
    name: string;
    whatsapp: string;
    email: string;
    birthDate: string;
  };
  isEditing: boolean;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  router: any; // Adicionado 'router' para o caso de !user
}

// Componente MainContent movido para fora do PerfilPage para otimização
const MainContent = ({ user, formData, isEditing, loading, handleSubmit, handleInputChange, handleLogout, router }: MainContentProps) => {
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-end">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : (
              isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </>
              )
            )}
          </Button>
        </div>
        {/* Imagem de Perfil */}
        <div className="text-center flex justify-center -mb-4">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white z-10">

            <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</span>

          </div>
        </div>
        <Card className="p-6 pt-16 -mt-12">


          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              value={formData.name}
              // OTIMIZAÇÃO: Usando a função única handleInputChange
              onChange={handleInputChange}
              required
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              // OTIMIZAÇÃO: Usando a função única handleInputChange
              onChange={handleInputChange}
              required
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              // OTIMIZAÇÃO: Usando a função única handleInputChange
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              // OTIMIZAÇÃO: Usando a função única handleInputChange
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

        </Card>
      </form>
      <div className="mt-6 pt-4 border-t border-border text-end">
        <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </main>
  )
}

// Componente principal
export default function PerfilPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
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

  // OTIMIZAÇÃO: Função centralizada para lidar com a mudança de inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Usando o formato de atualização de função (prev) para melhor performance
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditing) return setIsEditing(true) // Se não estiver editando, apenas habilita a edição

    setLoading(true)
    try {
      if (!user) return
      const updatedUser: User = {
        ...user,
        name: formData.name,
        // Limpar o WhatsApp é melhor feito ao salvar
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        birthDate: formData.birthDate,
      }
      // 1. Salva nos dados mockados
      saveUser(updatedUser)
      // 2. Atualiza o contexto global
      updateUser(updatedUser)

      setIsEditing(false) // Desliga o modo de edição após salvar
      toast.success("Perfil atualizado!")
    } catch (error) {
      toast.success("Não foi possível atualizar o perfil.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Você foi deslogado!")
    router.push("/perfil")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <MainContent
        user={user}
        formData={formData}
        isEditing={isEditing}
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleLogout={handleLogout}
        router={router}
      />
      <NavbarApp />
    </div>
  )
}