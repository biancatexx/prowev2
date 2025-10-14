"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Importe ou crie seus componentes de Modal/Dialog
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog" 

// --- Configurações de Duração (Extraídas da Página de Cadastro) ---
const minDuration = 15 // min
const maxDuration = 180 // min
const stepDuration = 5 // min

// --- Funções Auxiliares (Extraídas da Página de Cadastro) ---

// Formata a duração de minutos para "Xh Ymin"
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

// Formata o valor numérico em string para o formato de Real (R$) para exibição no input de preço
const formatPriceInput = (value: string | number | undefined): string => {
  if (!value) return ""
  // Converte para string se for número
  const valueStr = typeof value === 'number' ? value.toFixed(2).replace('.', '') : String(value).replace('.', '')
  
  // remove tudo que não seja número
  const digits = valueStr.replace(/\D/g, "")
  if (!digits) return ""
  
  // Garante que o número sempre tenha pelo menos 3 dígitos (para R$ 0,00)
  const paddedDigits = digits.padStart(3, '0')

  // Insere a vírgula para os centavos
  const integerPart = paddedDigits.slice(0, -2)
  const decimalPart = paddedDigits.slice(-2)

  // Formata a parte inteira (milhares, etc.) e junta com os centavos
  const numberToFormat = Number(`${integerPart}.${decimalPart}`)
  return numberToFormat.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// --- Componente DetalhesServicoPage ---

export default function DetalhesServicoPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  const { professional: authProfessional, isLoading } = useAuth()

  const categories = getCategories()
  const [serviceData, setServiceData] = useState<Service | null>(null)
  const [initialServiceData, setInitialServiceData] = useState<Service | null>(null) // Para comparação
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para o modal de confirmação

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

    // Armazena tanto o estado atual quanto o inicial (para comparação)
    setServiceData(service)
    setInitialServiceData(service)
    setInitialLoad(false)
  }, [isLoading, authProfessional, serviceId, router])

  // --- Manipulação de Input ---

  // Controla todas as mudanças de input (texto e number simples)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setServiceData(prev => ({
      ...(prev as Service),
      [id]: id === "duration" || id === "price" ? Number(value) : value,
    }))
  }
  
  // Controla a mudança do Select
  const handleSelectChange = (value: string) => {
    setServiceData(prev => ({
      ...(prev as Service),
      category: value,
    }))
  }

  // Controla o input de preço formatado (reutilizado da página de cadastro)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Remove tudo que não for número (mantendo apenas os dígitos)
    const digits = rawValue.replace(/\D/g, "")
    // Converte para valor numérico (em reais com centavos)
    const numberValue = (Number(digits) / 100).toFixed(2) 
    
    setServiceData(prev => ({
      ...(prev as Service),
      price: Number(numberValue), // Armazena o valor como número para salvar
    }))
  }
  
  // Controla o input de range de duração (novo)
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setServiceData(prev => ({
        ...(prev as Service),
        duration: Number(e.target.value),
      }))
  }

  // Lógica para habilitar o botão de salvar
  const isServiceDataEqual = useMemo(() => {
      if (!serviceData || !initialServiceData) return true
      // Comparação simples de todas as propriedades relevantes. 
      // É importante converter duration e price para string para garantir a comparação
      // se a diferença for apenas de tipo (ex: number vs string), embora aqui sejam numbers.
      // O JSON.stringify é uma forma rápida, mas *não* a mais performática/segura para comparação de objetos complexos.
      // Para este caso simples, comparando apenas os campos principais:
      return (
          serviceData.name === initialServiceData.name &&
          serviceData.category === initialServiceData.category &&
          serviceData.duration === initialServiceData.duration &&
          serviceData.price === initialServiceData.price &&
          serviceData.description === initialServiceData.description
      )
  }, [serviceData, initialServiceData])

  const isSaveDisabled = isServiceDataEqual || loading || 
      !serviceData?.name || !serviceData?.category || 
      serviceData?.duration <= 0 || serviceData?.price <= 0

  // Salvar alterações
  const handleConfirmSave = async () => {
    if (isSaveDisabled) return 

    setLoading(true)
    setIsModalOpen(false) // Fecha o modal
    try {
      const professional = getProfessionalById(authProfessional!.id)
      if (!professional) throw new Error("Profissional não encontrado.")

      const updatedServices = professional.services.map(s =>
        s.id === serviceData!.id ? serviceData : s
      )

      const updatedProfessional: Professional = {
        ...professional,
        services: updatedServices,
      }

      saveProfessional(updatedProfessional)
      
      // Atualiza o estado inicial para refletir os dados salvos e desabilitar o botão
      setInitialServiceData(serviceData)
      toast.success("Serviço atualizado com sucesso!")
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

  // --- Renderização do Modal de Confirmação ---
  const ConfirmationModal = () => (
    // Você precisa ter um componente de Dialog/Modal. 
    // Vou usar uma estrutura de Dialog (ex: Shadcn/UI) como placeholder.
    // Substitua pelo seu componente real.
    // Exemplo de Placeholder:
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isModalOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-2">Confirmar Alterações</h2>
            <p className="text-sm text-gray-500 mb-4">Tem certeza que deseja salvar as alterações no serviço?</p>
            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                </Button>
                <Button onClick={handleConfirmSave} disabled={loading}>
                    {loading ? "Salvando..." : "Confirmar e Salvar"}
                </Button>
            </div>
        </div>
    </div>
  )

  // --- Renderização da Página Principal (Layout de Edição) ---

  return (
    <div className="">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Editar Serviço</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        {/* Usando o mesmo layout de Card/div da página de cadastro */}
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Edite seu Serviço</h2>
            <p className="text-muted-foreground">Todos os campos estão abertos para edição</p>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-lg border border-border"> {/* Adicionado borda para destacar como um bloco de formulário */}
            
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria <span className="text-red-600">*</span></Label>
              <Select onValueChange={handleSelectChange} value={serviceData.category} required>
                <SelectTrigger id="category" className="w-full h-10 px-3 rounded-md border border-input bg-background">
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
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do serviço <span className="text-red-600">*</span></Label>
              <Input
                id="name"
                value={serviceData.name}
                onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                placeholder="Ex: Corte feminino"
              />
            </div>

            {/* Duração (Input de Range) */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
              <div className="space-y-2 sm:col-span-5">
                <Label htmlFor="duration">
                  Duração <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium w-full sm:w-16 text-center text-muted-foreground">
                    {formatDuration(minDuration)}
                  </span>
                  <Input
                    id="duration"
                    type="range"
                    min={minDuration}
                    max={maxDuration}
                    step={stepDuration}
                    value={serviceData.duration}
                    onChange={handleDurationChange}
                    className="cursor-pointer custom-range-slider w-full"
                  />
                  <span className="text-sm font-medium w-full sm:w-auto text-center text-muted-foreground">
                    {formatDuration(maxDuration)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-1">
                <div className="flex items-center justify-center mt-2 sm:mt-4">
                  <span className="py-1 px-2 w-auto rounded-md font-semibold border border-input bg-primary text-base ring-offset-background text-zinc-900 text-sm">
                    {formatDuration(Number(serviceData.duration))}
                  </span>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) <span className="text-red-600">*</span></Label>
              <Input
                id="price"
                type="text"
                value={formatPriceInput(serviceData.price)} // Exibe o valor formatado
                onChange={handlePriceChange} // Atualiza o estado interno (em número)
                placeholder="50,00"
              />
            </div>

            {/* Descrição (Mantido como Input simples para consistência com o restante do código fornecido) */}
            <div className="space-y-2">
              <Label htmlFor="description">Observação (Descrição)</Label>
              <Input // Usando Input para consistência com o formulário de cadastro, embora Textarea seja comum aqui.
                id="description"
                value={serviceData.description || ""}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                placeholder="Informações adicionais"
              />
            </div>
            
            {/* Botão Salvar Edição */}
            <div className="pt-4">
                <Button 
                    onClick={() => {
                        // Faz a validação final antes de abrir o modal
                        if (isSaveDisabled) {
                            toast.error("Preencha todos os campos obrigatórios e faça alguma alteração para salvar.")
                        } else {
                            setIsModalOpen(true)
                        }
                    }} 
                    disabled={isSaveDisabled}
                    className=""
                >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Edição
                </Button>
            </div>

          </div>
        </div>
      </div>
      
      {/* O Modal de Confirmação */}
      <ConfirmationModal />
    </div>
  )
}