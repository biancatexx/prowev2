"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import {
  getCategories,
  getProfessionalById,
  saveProfessional,
  type Service,
  type Professional,
} from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditarServicoPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string // Captura o ID do serviço da URL
  const { professional: authProfessional, isLoading } = useAuth()

  const categories = getCategories()

  const [serviceData, setServiceData] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // 1. Efeito para carregar os dados do serviço
  useEffect(() => {
    if (isLoading || !authProfessional || !serviceId) return

    const professional = getProfessionalById(authProfessional.id)
    if (!professional) {
      toast.error("Erro: Profissional não encontrado.")
      router.push("./servicos")
      return
    }

    const serviceToEdit = professional.services.find(s => s.id === serviceId)

    if (!serviceToEdit) {
      toast.error("Erro: Serviço não encontrado.")
      router.push("./servicos")
      return
    }

    // Define o estado com os dados do serviço a ser editado
    setServiceData(serviceToEdit)
    setInitialLoad(false)
  }, [isLoading, authProfessional, serviceId, router])

  // Lógica de manipulação do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setServiceData(prev => ({
      ...(prev as Service), // Garantia de que prev não é null
      [id]: id === 'duration' || id === 'price' ? Number(value) : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setServiceData(prev => ({
      ...(prev as Service),
      category: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!serviceData || !serviceData.name || !serviceData.category || serviceData.duration <= 0 || serviceData.price <= 0) {
      toast.error("Preencha todos os campos obrigatórios.")
      setLoading(false)
      return
    }

    try {
      // 2. Obter os dados ATUAIS do profissional para evitar sobrescrever
      const professional = getProfessionalById(authProfessional!.id)
      if (!professional) throw new Error("Profissional não encontrado durante a edição.")

      // 3. Encontrar o índice e substituir o serviço
      const updatedServices = professional.services.map(s =>
        s.id === serviceData.id ? serviceData : s
      )

      // 4. Criar o objeto Professional atualizado
      const updatedProfessional: Professional = {
        ...professional,
        services: updatedServices,
      }

      // 5. Salvar o profissional atualizado
      saveProfessional(updatedProfessional)

      toast.success(`Serviço "${serviceData.name}" atualizado com sucesso!`)
      router.push("./servicos/") // Redirecionar para a listagem
    } catch (error) {
      console.error("Erro ao salvar serviço:", error)
      toast.error("Ocorreu um erro ao salvar as alterações do serviço.")
    } finally {
      setLoading(false)
    }
  }

  // Estados de carregamento
  if (isLoading || initialLoad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados do serviço...</p>
      </div>
    )
  }

  // Se o serviceData for null após a tentativa de carregamento (erro de rota)
  if (!serviceData) {
    return null // Redirecionamento já foi feito no useEffect
  }

  return (
    <div className="">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex justify-start items-center mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary-foreground">Editar Serviço</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">


            <div className="space-y-2">
              <Label htmlFor="category">Categoria*</Label>
              <Select onValueChange={handleSelectChange} value={serviceData.category} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço*</Label>
              <Input
                id="name"
                value={serviceData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: Corte Feminino, Manicure"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)*</Label>
                <Input
                  id="duration"
                  type="number"
                  value={serviceData.duration}
                  onChange={handleInputChange}
                  min="5"
                  required
                  placeholder="Ex: 60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={serviceData.price}
                  onChange={handleInputChange}
                  min="0.01"
                  required
                  placeholder="Ex: 80.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={serviceData.description || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Detalhes sobre o serviço"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}