"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus } from "lucide-react"
import {
  getProfessionalById,
  saveProfessional,
  type Professional,
  type Service,
} from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

// Componente da Página de Serviços
export default function ServicosPage() {
  const router = useRouter()
  // Adicionado 'logout' para ser usado na tela de Acesso Negado
  const { professional: authProfessional, isLoading, logout } = useAuth() 
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  // 1. Carregar dados e manter o estado local
  useEffect(() => {
    if (authProfessional) {
      // Usamos getProfessionalById para ter a versão mais atualizada dos serviços
      const currentProfessionalData = getProfessionalById(authProfessional.id)
      setProfessional(currentProfessionalData)
    }
  }, [authProfessional])

  // Lógica de exclusão
  const confirmDelete = (service: Service) => {
    if (professional && professional.services.length <= 1) {
      toast.error("Você deve manter pelo menos um serviço cadastrado.")
      return
    }
    setServiceToDelete(service)
    setIsModalOpen(true)
  }

  const handleDelete = () => {
    if (!professional || !serviceToDelete) return

    const updatedServices = professional.services.filter(
      (s) => s.id !== serviceToDelete.id
    )

    const updatedProfessional: Professional = {
      ...professional,
      services: updatedServices,
    }

    try {
      // 2. Salvar no mockData
      saveProfessional(updatedProfessional)

      // 3. Atualizar o estado local
      setProfessional(updatedProfessional)

      toast.success(`Serviço "${serviceToDelete.name}" excluído com sucesso.`)
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
      toast.error("Ocorreu um erro ao excluir o serviço.")
    } finally {
      setIsModalOpen(false)
      setServiceToDelete(null)
    }
  }

  // Novo bloco de Acesso Negado
  if (!isLoading && !authProfessional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
        <Card className="p-6 rounded-xl">
          <p className="text-xl font-bold mb-4">Acesso Negado</p>
          <p className="text-muted-foreground mb-6">Por favor, faça login como profissional para acessar esta página.</p>
          {/* O Link e o onClick={() => logout()} são opcionais, mas seguem o padrão da página de Perfil */}
          <Link href='/login'><Button onClick={() => logout()}>Ir para Login</Button></Link>
        </Card>
        <NavbarProfessional />
      </div>
    )
  }
  // Bloco de Carregamento
  if (isLoading || !professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando serviços...</p>
        <NavbarProfessional />
      </div>
    )
  }

  const services = professional.services

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Serviços</h1>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
        <div className="">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Lista de Serviços ({services.length})</h2>
            <Link href="./servicos/novo" passHref>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {services.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum serviço cadastrado.</p>
            ) : (
              services.map((service) => (

                <div
                  key={service.id}
                  className="mb-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow flex justify-between items-center"
                >
                  <Link href={`./servicos/detalhes/${service.id}`} passHref>
                    {/* Informações do Serviço */}
                    <div className="flex-1 min-w-0 pr-4 w-full">
                      <p className="font-semibold truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.category} | R$ {service.price.toFixed(2)} | {service.duration}min
                      </p>
                    </div>
                  </Link>
                  {/* Ações */}
                  <div className="flex space-x-2">
                    <Link href={`./servicos/detalhes/${service.id}`} passHref>
                      <Button variant="outline" size="icon" className="w-8 h-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => confirmDelete(service)}
                      disabled={services.length <= 1} // Desabilita se for o último
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

              ))
            )}
          </div>
        </div>
      </div>

      <NavbarProfessional />

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o serviço "{serviceToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}