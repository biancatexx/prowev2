"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit2, Save } from "lucide-react"
import {
  getCategories,
  getProfessionalById,
  saveProfessional,
  type Service,
  type Professional,
} from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DetalhesServicoPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  const { professional: authProfessional, isLoading } = useAuth()

  const categories = getCategories()
  const [serviceData, setServiceData] = useState<Service | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Carregar dados do serviço
  useEffect(() => {
    if (isLoading || !authProfessional || !serviceId) return

    const professional = getProfessionalById(authProfessional.id)
    if (!professional) {
      toast.error("Profissional não encontrado.")
      router.push("/servicos")
      return
    }

    const service = professional.services.find(s => s.id === serviceId)
    if (!service) {
      toast.error("Serviço não encontrado.")
      router.push("/servicos")
      return
    }

    setServiceData(service)
    setInitialLoad(false)
  }, [isLoading, authProfessional, serviceId, router])

  // Manipulação de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setServiceData(prev => ({
      ...(prev as Service),
      [id]: id === "duration" || id === "price" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setServiceData(prev => ({
      ...(prev as Service),
      category: value,
    }))
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!serviceData || !serviceData.name || !serviceData.category || serviceData.duration <= 0 || serviceData.price <= 0) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)
    try {
      const professional = getProfessionalById(authProfessional!.id)
      if (!professional) throw new Error("Profissional não encontrado.")

      const updatedServices = professional.services.map(s =>
        s.id === serviceData.id ? serviceData : s
      )

      const updatedProfessional: Professional = {
        ...professional,
        services: updatedServices,
      }

      saveProfessional(updatedProfessional)
      toast.success("Serviço atualizado com sucesso!")
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar alterações.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || initialLoad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados do serviço...</p>
      </div>
    )
  }

  if (!serviceData) return null

  return (
    <div className="">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Detalhes do Serviço</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        <Card className="p-6 space-y-6">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            {isEditing ? (
              <Select onValueChange={handleSelectChange} value={serviceData.category} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={serviceData.category} disabled />
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={serviceData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {/* Duração e Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={serviceData.duration}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={serviceData.price}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={serviceData.description || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            {isEditing ? (
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
