"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { User, Mail, Phone, Calendar, Instagram, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import NavbarApp from "@/components/NavbarApp"

export default function PerfilPage() {
  const router = useRouter()
  const { user, updateUser: updateUserContext, logout } = useAuth()

  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [pendingUpdates, setPendingUpdates] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    whatsapp: user?.whatsapp || "",
    birthDate: user?.birthDate || "",
    instagram: user?.instagram || "",
  })

  useEffect(() => {
    if (user && !user.whatsapp) {
      setShowWhatsAppInput(true)
    }
  }, [user])

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!whatsappInput) {
      toast.error("Por favor, digite seu WhatsApp")
      return
    }

    const success = await updateUserContext({
      whatsapp: whatsappInput,
    })

    if (success) {
      setFormData({ ...formData, whatsapp: whatsappInput })
      setShowWhatsAppInput(false)
      toast.success("WhatsApp cadastrado com sucesso!")
    } else {
      toast.error("Erro ao cadastrar WhatsApp")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Se a data de nascimento foi alterada, pedir senha
    if (formData.birthDate !== user?.birthDate && formData.birthDate) {
      setPendingUpdates(formData)
      setShowPasswordDialog(true)
      return
    }

    // Salvar sem confirmação de senha
    await saveProfile(formData)
  }

  const saveProfile = async (data: typeof formData) => {
    const success = await updateUserContext({
      name: data.name,
      whatsapp: data.whatsapp,
      birthDate: data.birthDate,
      instagram: data.instagram,
    })

    if (success) {
      toast.success("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } else {
      toast.error("Erro ao atualizar perfil")
    }
  }

  const handlePasswordConfirm = async () => {
    if (!user || password !== user.password) {
      toast.error("Senha incorreta")
      return
    }

    setShowPasswordDialog(false)
    setPassword("")
    await saveProfile(pendingUpdates)
    setPendingUpdates(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (showWhatsAppInput) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 rounded-b-3xl pb-6 pt-12 px-4">
          <div className="container text-center mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-zinc-800 mb-1">Bem-vindo!</h1>
            <p className="text-muted-foreground">Complete seu cadastro para continuar</p>
          </div>
        </header>

        <main className="container mx-auto max-w-screen-lg px-4 py-6">
          <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-300 to-purple-200 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-10 h-10 text-purple-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Cadastre seu WhatsApp</h2>
                <p className="text-muted-foreground text-sm">
                  Precisamos do seu WhatsApp para enviar confirmações e lembretes dos seus agendamentos
                </p>
              </div>
              <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                <Input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  className="h-14 text-lg text-center"
                  required
                />
                <Button type="submit" className="w-full h-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900">
                  Continuar
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <> 
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 rounded-b-3xl pb-8 pt-12 px-4">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">Meu Perfil</h1>
          <p className="text-sm text-zinc-600">Gerencie suas informações pessoais</p>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto max-w-screen-lg px-4 py-6">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-3 border-4 border-purple-300">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-lg font-bold bg-purple-200 text-zinc-800">{initials}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm">
                Alterar Foto
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-purple-400" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-11"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-purple-400" />
                E-mail
              </Label>
              <Input id="email" name="email" type="email" value={formData.email} disabled className="h-11 bg-muted" />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1">
              <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4 text-purple-400" />
                WhatsApp *
              </Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-11"
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-1">
              <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-purple-400" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-11"
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Alterar a data de nascimento requer confirmação de senha
                </p>
              )}
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <Label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium">
                <Instagram className="w-4 h-4 text-purple-400" />
                Instagram
              </Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-11"
                placeholder="@seu_usuario"
              />
            </div>

            {/* Senha */}
            {!isEditing && (
              <div className="pt-4">
                <Button variant="outline" size="default" className="w-full bg-transparent" type="button">
                  <Lock className="mr-2 w-4 h-4" />
                  Alterar Senha
                </Button>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-2">
              {!isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-transparent"
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        whatsapp: user?.whatsapp || "",
                        birthDate: user?.birthDate || "",
                        instagram: user?.instagram || "",
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="default" size="lg" className="flex-1 bg-zinc-800 hover:bg-zinc-700">
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </form>

          {/* Info extra */}
          <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>* Campos obrigatórios</p>
          </div>
        </div>
      </main>

      {/* Dialog de confirmação de senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirme sua senha</DialogTitle>
            <DialogDescription>
              Para alterar a data de nascimento, precisamos confirmar sua identidade. Digite sua senha atual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setPassword("")
                setPendingUpdates(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handlePasswordConfirm}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    <NavbarApp />
    </>
  )
}
