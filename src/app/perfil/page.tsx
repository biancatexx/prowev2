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
} from "@/components/ui/alert-dialog" // Componentes do Modal
import { UserIcon, LogOut, Save } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { saveUser, type User } from "@/data/mockData"
import NavbarApp from "@/components/NavbarApp"
import { toast } from "sonner"

interface FormDataState {
  name: string;
  whatsapp: string;
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

interface MainContentProps {
  user: User | null;
  formData: FormDataState;
  hasChanges: boolean;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  router: any;
  // NOVO: Props para controlar o modal
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const MainContent = ({ user, formData, hasChanges, loading, handleSubmit, handleInputChange, handleLogout, router, isModalOpen, setIsModalOpen }: MainContentProps) => {
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
        <div className="text-end">
          {/* ALTERAÇÃO: AlertDialog controlado pelo estado isModalOpen */}
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
                {/* Usamos AlertDialogCancel para fechar o modal no cancelamento */}
                <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel> 
                
                {/* ALTERAÇÃO: AlertDialogAction com onClick, que é onde a submissão ocorre.
                   O fechamento deve ser manual dentro do handleSubmit. */}
                <AlertDialogAction onClick={handleSubmit} disabled={loading} asChild>
                   {/* Usar asChild e Button separado garante que o botão de ação 
                   não feche o modal imediatamente, dando tempo para a lógica assíncrona */}
                  <Button disabled={loading}>
                    {loading ? "Salvando..." : "Sim, Salvar"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Imagem de Perfil */}
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
            <Input id="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input id="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
          </div>
        </Card>
      </div>

      <div className="mt-6 pt-4 border-t border-border text-end">
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
  // NOVO ESTADO: Controla a abertura/fechamento do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    whatsapp: "",
    email: "",
    birthDate: "",
  })

  const [originalFormData, setOriginalFormData] = useState<FormDataState | null>(null)

  // 1. Inicializa o formulário e os dados originais
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

  // 2. Calcula se há alterações no formulário
  const hasChanges = useMemo(() => {
    if (!originalFormData) return false;

    return (
      formData.name !== originalFormData.name ||
      formData.whatsapp.replace(/\D/g, "") !== originalFormData.whatsapp.replace(/\D/g, "") ||
      formData.email !== originalFormData.email ||
      formData.birthDate !== originalFormData.birthDate
    );
  }, [formData, originalFormData])

  // Função para lidar com a mudança de inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  // Funçao de submissão (chamada pelo AlertDialogAction)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!hasChanges || loading || !user) {
      // Garante que se a lógica falhar (e.g., sem usuário), o modal ainda feche
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

      // 1. Simula a chamada assíncrona (aqui saveUser pode ser assíncrono)
      await saveUser(updatedUser) 
      // 2. Atualiza o contexto global
      updateUser(updatedUser)

      // 3. Atualiza os dados originais após o sucesso do salvamento
      setOriginalFormData({
        name: updatedUser.name,
        whatsapp: updatedUser.whatsapp,
        email: updatedUser.email,
        birthDate: updatedUser.birthDate || "",
      })
      
      toast.success("Perfil atualizado! 🎉")
      // AÇÃO CHAVE: Fechar o modal APENAS após o sucesso do salvamento
      setIsModalOpen(false); 

    } catch (error) {
      toast.error("Não foi possível atualizar o perfil.")
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
        hasChanges={hasChanges}
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleLogout={handleLogout}
        router={router}
        // Passando os estados de controle do modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <NavbarApp />
    </div>
  )
}