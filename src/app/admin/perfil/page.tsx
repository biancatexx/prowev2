"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save } from "lucide-react"
import { mockServices } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext" // Importação adicionada

export default function Perfil() {
  const { professional: authProfessional, isLoading } = useAuth() // Usa o hook de autenticação
  const [isEditing, setIsEditing] = useState(false)
  // Define um estado para o formulário, inicializando com os dados de authProfessional
  // Usa o profissional do contexto se disponível, ou um objeto vazio para evitar o erro de build
  const [professionalData, setProfessionalData] = useState(authProfessional || {
    id: '',
    name: '',
    description: '',
    address: { street: '' },
    phone: '',
    email: '',
    profileImage: ''
  });

  // Atualiza o estado quando os dados do contexto de autenticação são carregados
  useEffect(() => {
    if (authProfessional) {
      setProfessionalData(authProfessional);
    }
  }, [authProfessional]);
  // Se os dados ainda estão carregando ou o profissional não está logado, mostra o "Carregando..."
  if (isLoading || !authProfessional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  // A partir daqui, professionalData tem certeza de ter dados válidos do profissional.
  const services = mockServices.filter((s) => s.professionalId === professionalData.id)

  const handleSave = () => {
    // Lógica para salvar os dados (usando professionalData)
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
            {/* CORRIGIDO: Agora usa professionalData e sabe que ele existe */}
            {professionalData.profileImage ? (
              <img
                src={professionalData.profileImage}
                alt={professionalData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Garantia de que professionalData.name existe antes de usar charAt
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold">
                <span>{professionalData.name ? professionalData.name.charAt(0).toUpperCase() : 'P'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Informações do Negócio</h2>
          <div className="space-y-4">
            <div>
              <Label>Nome do Estabelecimento {professionalData.id}</Label>
              <Input value={professionalData.name} disabled={!isEditing} />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea value={professionalData.description} disabled={!isEditing} rows={3} />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={professionalData.address?.street} disabled={!isEditing} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={professionalData.phone} disabled={!isEditing} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={professionalData.email} disabled={!isEditing} />
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