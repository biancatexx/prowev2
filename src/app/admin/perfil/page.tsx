"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save, LogOut } from "lucide-react"
import { getMockServices, saveProfessional, type Professional } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

// Tipagem para o estado do formulário (mantida inalterada)
interface ProfessionalForm extends Omit<Professional, 'address'> {
  address: { 
    street: string; 
    number: string; 
    city: string; 
    state: string; 
    neighborhood: string; 
    zipCode: string; 
    country: string 
  };
}

export default function Perfil() {
  const { professional: authProfessional, isLoading, updateProfessional, logout } = useAuth()
 
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // CORREÇÃO: Removida a propriedade 'category' para resolver o erro
  // "Object literal may only specify known properties".
  const initialProfessionalData: ProfessionalForm = {
    id: '',
    name: '',
    description: '',
    phone: '',
    email: '',
    profileImage: '',
    specialty: '',
    status: 'active',
    whatsapp: '',
    userId: '', 
    workingHours: {} as any, 
    address: { street: '', number: '', city: '', state: '', neighborhood: '', zipCode: '', country: '' },
    createdAt: "",
    experience_years: 0,
    services: []
  }

  const [formData, setFormData] = useState<ProfessionalForm>(authProfessional ? {
   
    ...authProfessional,
     
    address: {
        ...initialProfessionalData.address,
        ...(authProfessional.address || {}) // Sobrescreve com os dados do profissional
    } as ProfessionalForm['address']
  } as ProfessionalForm : initialProfessionalData); // Adicionado type assertion para garantir conformidade

  // Inicializa/Atualiza o estado do formulário quando os dados do contexto mudam
  useEffect(() => {
    if (authProfessional) {
      setFormData({
        ...authProfessional,
        address: {
            ...initialProfessionalData.address,
            ...(authProfessional.address || {})
        } as ProfessionalForm['address']
      } as ProfessionalForm); // Adicionado type assertion aqui também
    }
  }, [authProfessional]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (!authProfessional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
        <Card className="p-6">
          <p className="text-xl font-bold mb-4">Acesso Negado</p>
          <p className="text-muted-foreground mb-6">Por favor, faça login como profissional para acessar esta página.</p>
          <Button onClick={() => logout()}>Ir para Login</Button>
        </Card>
      </div>
    )
  }

  const services = getMockServices().filter((s) => s.professionalId === authProfessional.id)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [id]: value,
      },
    }));
  };

  const handleSave = () => {
    if (loading) return;
    setLoading(true);

    try {
      // Omitindo campos que não são editáveis pelo formulário (se necessário),
      // mas passando o objeto completo para o saveProfessional.
      saveProfessional(formData as Professional);
      
      updateProfessional(formData as Professional);

      toast.success('Perfil atualizado!')
      setIsEditing(false)
    } catch (error) {
      toast.success('Erro ao salvar, tente mais tarde.')
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
    toast.success("Você foi deslogado")
    
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Perfil Profissional</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
        {/* Botões de Ação */}
        <div className="flex justify-between items-center">
          <Button variant="destructive" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>

          <Button
            size="sm"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
            className="w-32"
          >
            {loading ? "Salvando..." : isEditing ? (
              <><Save className="w-5 h-5 mr-1" /> Salvar</>
            ) : (
              <><Edit2 className="w-5 h-5 mr-1" /> Editar</>
            )}
          </Button>
        </div>

        {/* Imagem de Perfil */}
        <div className="text-center flex justify-center -mb-4">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white z-10">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt={formData.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; 
                  target.src = `https://placehold.co/96x96/25555d/fff?text=${formData.name.charAt(0)}`;
                }}
              />
            ) : (
              <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</span>
            )}
          </div>
        </div>
        
        {/* Formulário */}
        <Card className="p-6 pt-16 -mt-12">
          <h2 className="text-lg font-bold mb-4">Informações do Negócio</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Estabelecimento</Label>
              <Input 
                id="name" 
                value={formData.name} 
                disabled={!isEditing} 
                onChange={handleInputChange} 
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                disabled={!isEditing} 
                rows={3} 
                onChange={handleInputChange} 
              />
            </div>
            
            <h3 className="font-semibold pt-2">Contato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={formData.phone} 
                  disabled={!isEditing} 
                  onChange={handleInputChange} 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email} 
                  disabled={!isEditing} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* Campo whatsapp */}
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input 
                id="whatsapp" 
                type="tel"
                value={formData.whatsapp} 
                disabled={!isEditing} 
                onChange={handleInputChange} 
              />
            </div>

            <h3 className="font-semibold pt-2">Endereço</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Rua</Label>
                <Input 
                  id="street" 
                  value={formData.address.street} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input 
                  id="number" 
                  value={formData.address.number} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input 
                  id="neighborhood" 
                  value={formData.address.neighborhood} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input 
                  id="city" 
                  value={formData.address.city} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input 
                  id="zipCode" 
                  value={formData.address.zipCode} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  value={formData.address.state} 
                  disabled={!isEditing} 
                  onChange={handleAddressChange} 
                />
              </div>
            </div>
          </div>
        </Card>

     
      </div>

      <NavbarProfessional />
    </div>
  )
}
