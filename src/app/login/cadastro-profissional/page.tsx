"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Check, EyeOff, Eye, Camera } from "lucide-react"
import {
  saveProfessional,
  saveUser,
  saveProfessionalAvailability,
  getDefaultAvailability,
  getCategories,
  type Professional,
  type Service,
  type User,
  type WorkingHoursMap,
  type DayOfWeek,
} from "@/data/mockData" // Supondo que você tenha este arquivo de mock data
import { useAuth } from "@/contexts/AuthContext" // Supondo que você tenha este contexto de autenticação 
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

// --- Constantes
const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

// --- Tipagem customizada para o estado de WorkingHours
type SafeWorkingHoursMap = {
  [K in DayOfWeek]: WorkingHoursMap[K] & {
    intervals: { start: string; end: string }[]
  }
}

// --- Componente Principal
export default function CadastroProfissionalPage() {
  const router = useRouter()
  // CORREÇÃO: Adicionado 'logout' para garantir que o usuário anterior seja deslogado
  const { login, logout } = useAuth() // <--- MODIFICAÇÃO AQUI

  // --- Estados de Controle de Fluxo
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [operationType, setOperationType] = useState<"agendamento" | "fila">("agendamento")

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const minDuration = 5;
  const maxDuration = 240;
  const stepDuration = 5;
  // --- Funções de Formatação
  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return value
  }
  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8) // mantém só números (até 8 dígitos)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatPriceInput = (value: string): string => {
    if (!value) return "";
    // remove tudo que não seja número
    const digits = value.replace(/\D/g, "");
    const number = Number(digits) / 100; // divide por 100 para ter centavos
    return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, "");

    const numberValue = (Number(digits) / 100).toFixed(2);
    setCurrentService({
      ...currentService,
      price: numberValue,
    });
  };
  // 💡 MODIFICAÇÃO 1: Adicionar instagramProfile ao estado basicInfo
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    instagramProfile: "", // 🆕 Campo adicionado
  })

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsapp(e.target.value)
    setBasicInfo({ ...basicInfo, whatsapp: formatted })
  }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      // Cria uma URL temporária para pré-visualização.
      setProfileImageUrl(URL.createObjectURL(file))
    } else {
      setProfileImageFile(null)
      setProfileImageUrl(null)
    }
  }

  // Passo 2: Endereço
  const [address, setAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  // Passo 3: Serviços
  const [services, setServices] = useState<Service[]>([])
  const [currentService, setCurrentService] = useState({
    category: "",
    name: "",
    duration: String(minDuration),
    price: "",
    description: "",
  })

  const categories = getCategories() // Função mockada para obter categorias

  // Passo 4: Horários de Atendimento
  const [workingHours, setWorkingHours] = useState<SafeWorkingHoursMap>({
    monday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    tuesday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    wednesday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    thursday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    friday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    // Finais de semana desabilitados por padrão
    saturday: { enabled: false, start: "09:00", end: "18:00", intervals: [] },
    sunday: { enabled: false, start: "09:00", end: "18:00", intervals: [] },
  })

  // --- Funções de Manipulação de Serviços (Passo 3)
  const handleAddService = () => {
    if (!currentService.category || !currentService.name || !currentService.duration || !currentService.price) {
      toast.error("Campos obrigatórios");
      return
    }
    const newService: Service = {
      id: Date.now().toString(),
      category: currentService.category,
      name: currentService.name,
      duration: Number.parseInt(currentService.duration),
      price: Number.parseFloat(currentService.price),
      description: currentService.description,
    }
    setServices([...services, newService])
    setCurrentService({ category: "", name: "", duration: String(minDuration), price: "", description: "" })
    toast.success("Serviço adicionado! ✅")
  }

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  // --- Funções de Manipulação de Horários (Passo 4)
  // Adicionar intervalo (almoço, pausa, etc.) - Atualmente oculto (hidden) no JSX, mas a função existe
  const handleAddInterval = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: [...prev[day].intervals, { start: "12:00", end: "13:00" }],
      },
    }))
  }

  const handleRemoveInterval = (day: DayOfWeek, index: number) => {
    setWorkingHours((prev) => {
      const updated = [...prev[day].intervals]
      updated.splice(index, 1)
      return { ...prev, [day]: { ...prev[day], intervals: updated } }
    })
  }

  const handleUpdateInterval = (day: DayOfWeek, index: number, field: "start" | "end", value: string) => {
    setWorkingHours((prev) => {
      const updated = [...prev[day].intervals]
      updated[index][field] = value
      return { ...prev, [day]: { ...prev[day], intervals: updated } }
    })
  }

  // --- Funções de Validação
  const validateStep1 = () => {
    // ⚠️ instagramProfile é opcional, então não é verificado aqui.
    if (!basicInfo.name || !basicInfo.whatsapp || !basicInfo.email || !basicInfo.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return false
    }
    if (!/\S+@\S+\.\S+/.test(basicInfo.email)) {
      toast.error("E-mail inválido");
      return false;
    }
    return true
  }

  const validateStep2 = () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state || !address.zipCode) {
      toast.error("Preencha todos os campos obrigatórios");
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (services.length === 0) {
      toast.error("Adicione pelo menos um serviço");
      return false
    }
    return true
  }

  // 🆕 FUNÇÃO DE VALIDAÇÃO PARA O PASSO 4
  const validateStep4 = () => {
    // 1. Verifica o tipo de operação (agendamento ou fila)
    if (!operationType) {
      toast.error("Preencha os campos obrigatórios");
      return false
    }

    // 2. Verifica se pelo menos um dia de trabalho está habilitado
    const hasEnabledDay = DAYS_OF_WEEK.some(day => workingHours[day.key].enabled);
    if (!hasEnabledDay) {
      toast.error("Os horários são campos obrigatórios");
      return false;
    }

    // 3. Validação dos horários (Início e Fim) para dias habilitados
    let isValidTimeRange = true;
    DAYS_OF_WEEK.forEach(day => {
      const dayHours = workingHours[day.key];
      if (dayHours.enabled) {
        if (!dayHours.start || !dayHours.end) {
          isValidTimeRange = false;
          toast.error("Horários obrigatórios");
        }
        else if (dayHours.start >= dayHours.end) {
          isValidTimeRange = false;
          toast.error("Horários inválidos");
        }
        // Validação de intervalos (opcional, mas bom ter)
        dayHours.intervals.forEach(interval => {
          if (interval.start >= interval.end) {
            isValidTimeRange = false;
            toast.error("Intervalo inválido");
          }
        });
      }
    });

    if (!isValidTimeRange) return false;

    return true
  }
  // FIM 🆕 FUNÇÃO DE VALIDAÇÃO PARA O PASSO 4

  // --- Navegação e Submissão
  const handleNext = () => {
    let isValid = true
    if (step === 1) isValid = validateStep1()
    if (step === 2) isValid = validateStep2()
    if (step === 3) isValid = validateStep3()
    if (step === 4) isValid = validateStep4() // 🆕 Adiciona a validação do passo 4

    if (!isValid) return

    if (step < 4) {
      setStep(step + 1)
    } else {
      // Se for o passo 4 e for válido, chama o handleSubmit
      handleSubmit();
    }
  }

  const handleSubmit = async () => {
    // ⚠️ Garantir que a validação do passo 4 seja feita se o botão de finalizar for clicado diretamente
    if (!validateStep4()) return;

    setLoading(true)
    try {
      const professionalId = Date.now().toString()
      const userId = `user-${professionalId}`

      // ⚠️ SIMULAÇÃO DE UPLOAD:
      // Na vida real, você enviaria profileImageFile para um servidor
      const simulatedImageUrl = profileImageUrl || "https://picsum.photos/200/200?random=" + professionalId;

      // 1. Salvar Usuário (conta de login)
      const newUser: User = {
        id: userId,
        name: basicInfo.name,
        whatsapp: basicInfo.whatsapp.replace(/\D/g, ""),
        email: basicInfo.email,
        password: basicInfo.password,
        createdAt: new Date().toISOString(),
        type: "professional",
        profileImage: simulatedImageUrl, // 🆕 SALVA A IMAGEM NO USER
        // ❌ Não salvamos o Instagram aqui, pois o mock User não possui este campo,
        // mas ele é salvo em 'Professional'
      }
      saveUser(newUser)

      // 2. Salvar Profissional (dados de negócio)
      const newProfessional: Professional = {
        id: professionalId,
        userId,
        name: basicInfo.name,
        whatsapp: basicInfo.whatsapp.replace(/\D/g, ""),
        email: basicInfo.email,
        password: basicInfo.password,
        address,
        services,
        // Converte SafeWorkingHoursMap para WorkingHoursMap para salvar no mockData
        workingHours: Object.fromEntries(
          Object.entries(workingHours).map(([day, data]) => [
            day,
            { enabled: data.enabled, start: data.start, end: data.end, intervals: data.intervals.map(i => ({ start: i.start, end: i.end })) },
          ])
        ) as WorkingHoursMap,
        createdAt: new Date().toISOString(),
        status: "active",
        specialty: "Geral",
        description: "Profissional de beleza e bem-estar",
        experience_years: 0,
        // 💡 MODIFICAÇÃO 3: Salvar o nome do perfil do Instagram
        social_instagram: basicInfo.instagramProfile || "", // 🆕 Salva o nome do perfil
        social_facebook: "",
        phone: basicInfo.whatsapp.replace(/\D/g, ""),
        operationType: operationType, // 🆕 SALVA O TIPO DE OPERAÇÃO
        profileImage: simulatedImageUrl, // 🆕 SALVA A IMAGEM NO PROFESSIONAL
      }
      saveProfessional(newProfessional)

      // 3. Salvar Disponibilidade (para o sistema de agendamento)
      const availability = getDefaultAvailability(professionalId)
      availability.workingDays = Object.fromEntries(
        DAYS_OF_WEEK.map((day) => [day.key, workingHours[day.key].enabled])
      ) as { [key in DayOfWeek]: boolean }

      // Define as horas de trabalho padrão (simplificado para o mock)
      const firstEnabledDayKey = DAYS_OF_WEEK.find((day) => workingHours[day.key].enabled)?.key
      availability.workingHours = firstEnabledDayKey
        ? { start: workingHours[firstEnabledDayKey].start, end: workingHours[firstEnabledDayKey].end }
        : { start: "09:00", end: "18:00" }

      saveProfessionalAvailability(availability)

      // 4. Logar e Redirecionar
      // 🚨 CORREÇÃO APLICADA: Desloga a sessão atual (se houver) antes de logar o novo usuário
      await logout(); // <--- CHAMA O LOGOUT

      await login(basicInfo.email, basicInfo.password)
      toast.success("Cadastro realizado com sucesso!");
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Erro no cadastro:", error)
      toast.error("Não foi possível realizar o cadastro. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  // --- Renderização do Componente
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg text-center">
          <Link href="/login" className="flex items-center gap-2 text-primary-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">

        {/* Etapas de progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 w-full">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s < step ? "bg-green-500 text-white" : s === step ? "bg-zinc-900 text-white" : "bg-primary text-primary-foreground"
                    }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-green-500" : "bg-primary"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Profissional</span>
            <span>Endereço</span>
            <span>Serviços</span>
            <span>Horários</span>
          </div>
        </div>

        <Card className="p-6">

          {/* Step 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Profissional</h2>
                <p className="text-muted-foreground">Suas informações pessoais</p>
              </div>

              {/* 🆕 CAMPO: UPLOAD DE FOTO DE PERFIL */}
              <div className="flex flex-col items-center gap-2 mb-6">
                <Label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="relative w-32 h-32 rounded-full border-2 border-primary overflow-hidden group">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Foto de Perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Alterar</span>
                    </div>
                  </div>
                </Label>
                <Input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">Foto de Perfil (Opcional)</p>
              </div>
              {/* FIM: NOVO CAMPO */}

              <div className="space-y-2">
                <Label>Nome do estabelecimento <span className="text-red-600">*</span></Label>
                <Input
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="Seu Salão/Estúdio"
                />
              </div>

              {/* 💡 MODIFICAÇÃO 2: Adicionar campo para nome do perfil do Instagram */}
              <div className="space-y-2">
                <Label>Nome de Perfil do Instagram (Opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    value={basicInfo.instagramProfile}
                    onChange={(e) => setBasicInfo({ ...basicInfo, instagramProfile: e.target.value })}
                    placeholder="seunome.profissional"
                    className="pl-8" // Aumenta o padding esquerdo para o "@"
                  />
                </div>
              </div>
              {/* FIM DA MODIFICAÇÃO */}

              <div className="space-y-2">
                <Label>WhatsApp  <span className="text-red-600">*</span></Label>
                <Input
                  type="tel"
                  value={basicInfo.whatsapp}
                  onChange={handleWhatsappChange}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2 relative">
                <Label>E-mail  <span className="text-red-600">*</span></Label>
                <Input
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, email: e.target.value.toLowerCase() })
                  }
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              <div className="space-y-2 relative">
                <Label>Senha  <span className="text-red-600">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={basicInfo.password}
                    onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
                    placeholder="Sua senha secreta"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Step 2: Endereço */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Endereço</h2>
                <p className="text-muted-foreground">Onde você atende seus clientes</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP  <span className="text-red-600">*</span></Label>
                <Input
                  id="zipCode"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress({ ...address, zipCode: formatCep(e.target.value) })
                  }
                  placeholder="99999-999"
                  maxLength={9}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Rua  <span className="text-red-600">*</span></Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número  <span className="text-red-600">*</span></Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro  <span className="text-red-600">*</span></Label>
                <Input
                  id="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade  <span className="text-red-600">*</span></Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado  <span className="text-red-600">*</span></Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Serviços */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Serviços</h2>
                <p className="text-muted-foreground">Adicione pelo menos um serviço</p>
              </div>

              {/* Formulário para Adicionar Serviço */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria  <span className="text-red-600">*</span></Label>
                  <select
                    id="category"
                    value={currentService.category}
                    onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nome do serviço  <span className="text-red-600">*</span></Label>
                  <Input
                    id="serviceName"
                    value={currentService.name}
                    onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                    placeholder="Ex: Corte feminino"
                  />
                </div>
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
                        value={currentService.duration}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            duration: e.target.value,
                          })
                        }
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
                        {formatDuration(Number(currentService.duration))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) <span className="text-red-600">*</span></Label>
                  <Input
                    id="price"
                    type="text"
                    value={formatPriceInput(currentService.price)}
                    onChange={handlePriceChange}
                    placeholder="50,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Observação</Label>
                  <Input
                    id="description"
                    value={currentService.description}
                    onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                    placeholder="Informações adicionais"
                  />
                </div>
                <Button onClick={handleAddService} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Serviço
                </Button>
              </div>

              {/* Lista de Serviços Adicionados */}
              {services.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Serviços adicionados ({services.length})</h3>
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.category} • {service.duration} min • R$ {Number(service.price).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveService(service.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Horários de Atendimento */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Horários de Atendimento</h2>
                <p className="text-muted-foreground">Configure seus horários de trabalho</p>
              </div>

              {/* 🆕 Tipo de Funcionamento */}
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50 ">
                <Label htmlFor="operationType" className="font-bold">
                  Tipo de Funcionamento *
                </Label>
                <p className="text-sm text-muted-foreground">
                  Escolha como seus clientes serão atendidos.
                </p>
                <select
                  id="operationType"
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as "agendamento" | "fila")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="agendamento">📅 Agendamento (Reservas de horário)</option>
                  <option value="fila">🚶 Fila (Atendimento por ordem de chegada)</option>
                </select>
              </div>
              {/* FIM: NOVO CAMPO */}

              {/* Configuração de Horários por Dia */}
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const dayHours = workingHours[day.key]
                  return (
                    <div key={day.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={dayHours.enabled}
                            onCheckedChange={(checked) =>
                              setWorkingHours((prevWorkingHours) => ({
                                ...prevWorkingHours,
                                [day.key]: { ...dayHours, enabled: checked as boolean },
                              }))
                            }
                            id={`day-${day.key}`}
                          />
                          <Label htmlFor={`day-${day.key}`} className="font-medium cursor-pointer">{day.label}</Label>
                        </div>
                        {dayHours.enabled && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={dayHours.start}
                              onChange={(e) =>
                                setWorkingHours((prevWorkingHours) => ({
                                  ...prevWorkingHours,
                                  [day.key]: { ...dayHours, start: e.target.value },
                                }))
                              }
                              className="w-28"
                            />
                            <span>até</span>
                            <Input
                              type="time"
                              value={dayHours.end}
                              onChange={(e) =>
                                setWorkingHours((prevWorkingHours) => ({
                                  ...prevWorkingHours,
                                  [day.key]: { ...dayHours, end: e.target.value },
                                }))
                              }
                              className="w-28"
                            />
                          </div>
                        )}
                      </div>
                      {/*
                      // Ocultado por solicitação (embora as funções existam):
                      {dayHours.enabled && dayHours.intervals.length > 0 && (
                        <div className="pl-6 space-y-2 border-l ml-3 pt-2">
                          <h4 className="text-sm font-semibold mb-1">Intervalos/Pausas:</h4>
                          {dayHours.intervals.map((interval, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={interval.start}
                                onChange={(e) => handleUpdateInterval(day.key, index, "start", e.target.value)}
                                className="w-24"
                              />
                              <span>a</span>
                              <Input
                                type="time"
                                value={interval.end}
                                onChange={(e) => handleUpdateInterval(day.key, index, "end", e.target.value)}
                                className="w-24"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="w-7 h-7"
                                onClick={() => handleRemoveInterval(day.key, index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {dayHours.enabled && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleAddInterval(day.key)}
                          // hidden // Mantido como referência, mas oculto no layout
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar Intervalo
                        </Button>
                      )}
                      */}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Botões de Navegação */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
              className="w-1/3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <Button onClick={handleNext} disabled={loading} className="w-2/3 ml-4">
              {loading ? (
                "Finalizando..."
              ) : step < 4 ? (
                "Próximo Passo"
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" /> Concluir Cadastro
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Link para Login */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Faça login
          </Link>
        </p>
      </main>
    </div>
  )
}