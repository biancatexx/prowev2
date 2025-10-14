"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserIcon, LogOut, Save } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { saveUser, type User } from "@/data/mockData"
import NavbarApp from "@/components/NavbarApp"
import { toast } from "sonner"

interface FormDataState {
  name: string;
  whatsapp: string; // sempre armazenado apenas números
  email?: string;
  birthDate: string;
}

const Header = () => (
  <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
    <div className="container mx-auto max-w-screen-lg text-center">
      <h1 className="text-2xl font-bold text-primary-foreground">
        Perfil do Cliente
      </h1>
    </div>
  </header>
)

const formatWhatsappDisplay = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`
  if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`
  return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`
}

interface MainContentProps {
  user: User | null;
  formData: FormDataState;
  hasChanges: boolean;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWhatsappChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  router: any;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const MainContent = ({
  user,
  formData,
  hasChanges,
  loading,
  handleSubmit,
  handleInputChange,
  handleWhatsappChange,
  handleLogout,
  router,
  isModalOpen,
  setIsModalOpen
}: MainContentProps) => {
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
      <div className="space-y-6">
        <div className="text-center flex justify-center -mb-4">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white z-10">
            <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</span>
          </div>
        </div>

        <Card className="p-6 pt-16 -mt-12 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formatWhatsappDisplay(formData.whatsapp)}
              onChange={handleWhatsappChange}
              required
              maxLength={15}
            />
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input id="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
          </div>
        </Card>
      </div>

      <div className="text-end mt-4">
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              disabled={loading || !hasChanges}
              className="w-full sm:w-auto"
            >
              {loading ? "Salvando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja salvar estas alterações no seu perfil?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} disabled={loading} asChild>
                <Button disabled={loading}>
                  {loading ? "Salvando..." : "Sim, Salvar"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-4 pt-4 border-t border-border text-end">
        <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </main>
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()

  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    whatsapp: "",
    email: "",
    birthDate: "",
  })
  const [originalFormData, setOriginalFormData] = useState<FormDataState | null>(null)

  useEffect(() => {
    if (user) {
      const initialData: FormDataState = {
        name: user.name ?? "",
        whatsapp: user.whatsapp ?? "",
        email: user.email ?? "",
        birthDate: user.birthDate ?? "",
      }
      setFormData(initialData)
      setOriginalFormData(initialData)
    } else {
      setFormData({ name: "", whatsapp: "", email: "", birthDate: "" })
      setOriginalFormData(null)
    }
  }, [user])

  const hasChanges = useMemo(() => {
    if (!originalFormData) return false;
    return (
      formData.name !== originalFormData.name ||
      formData.whatsapp.replace(/\D/g, "") !== originalFormData.whatsapp.replace(/\D/g, "") ||
      formData.email !== originalFormData.email ||
      formData.birthDate !== originalFormData.birthDate
    );
  }, [formData, originalFormData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    setFormData(prev => ({ ...prev, whatsapp: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || loading || !user) {
      if (isModalOpen) setIsModalOpen(false);
      return;
    }

    setLoading(true)
    try {
      const updatedUser: User = {
        ...user,
        name: formData.name,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        birthDate: formData.birthDate,
      }

      await saveUser(updatedUser)
      updateUser(updatedUser)

      setOriginalFormData({
        name: updatedUser.name,
        whatsapp: updatedUser.whatsapp,
        email: updatedUser.email,
        birthDate: updatedUser.birthDate || "",
      })

      toast.success("Perfil atualizado! 🎉")
      setIsModalOpen(false);

    } catch {
      toast.error("Não foi possível atualizar o perfil.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Você foi deslogado!")
    router.push("/cliente/perfil")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <MainContent
        user={user}
        formData={formData}
        hasChanges={hasChanges}
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleWhatsappChange={handleWhatsappChange}
        handleLogout={handleLogout}
        router={router}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <NavbarApp />
    </div>
  )
}
