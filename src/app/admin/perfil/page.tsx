"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save } from "lucide-react"
import { mockProfessionals, mockServices } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"
import { toast } from "sonner"

export default function Perfil() {
  const [isEditing, setIsEditing] = useState(false)
  const [professional, setProfessional] = useState(mockProfessionals[0])

  const services = mockServices.filter((s) => s.professionalId === professional.id)

  const handleSave = () => {
    toast.success("Perfil atualizado com sucesso!")
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary-foreground">Perfil</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="text-primary-foreground"
            >
              {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </Button>
          </div>
          <div className="text-center">
            <img
              src={professional.profileImage || "/placeholder.svg"}
              alt={professional.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-card"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Informações do Negócio</h2>
          <div className="space-y-4">
            <div>
              <Label>Nome do Estabelecimento {professional.id}</Label>
              <Input value={professional.name} disabled={!isEditing} />
            </div>
             
            <div>
              <Label>Descrição</Label>
              <Textarea value={professional.description} disabled={!isEditing} rows={3} />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={professional.address.street} disabled={!isEditing} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={professional.phone} disabled={!isEditing} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={professional.email} disabled={!isEditing} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Serviços Cadastrados</h2>
            <Button size="sm">Adicionar Serviço</Button>
          </div>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">R$ {service.price}</p>
                    <p className="text-sm text-muted-foreground">{service.duration}min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <NavbarProfessional />
    </div>
  )
}
