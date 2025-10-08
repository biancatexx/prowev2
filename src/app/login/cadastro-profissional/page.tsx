"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react"
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
  type DayOfWeek, // Importar DayOfWeek
} from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [ // Usar DayOfWeek aqui
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

// ✅ Tipagem segura para garantir intervals sempre definido
type SafeWorkingHoursMap = {
  [K in DayOfWeek]: WorkingHoursMap[K] & { // Usar DayOfWeek aqui
    intervals: { start: string; end: string }[]
  }
}

export default function CadastroProfissionalPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Step 2: Address
  const [address, setAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  // Step 3: Services
  const [services, setServices] = useState<Service[]>([])
  const [currentService, setCurrentService] = useState({
    category: "",
    name: "",
    duration: "",
    price: "",
    description: "",
  })

  // Step 4: Working Hours
  const [workingHours, setWorkingHours] = useState<SafeWorkingHoursMap>({
    monday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    tuesday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    wednesday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    thursday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    friday: { enabled: true, start: "09:00", end: "18:00", intervals: [] },
    saturday: { enabled: false, start: "09:00", end: "18:00", intervals: [] },
    sunday: { enabled: false, start: "09:00", end: "18:00", intervals: [] },
  })
  const categories = getCategories()

  const handleAddService = () => {
    if (!currentService.category || !currentService.name || !currentService.duration || !currentService.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do serviço.",
        variant: "destructive",
      })
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
    setCurrentService({ category: "", name: "", duration: "", price: "", description: "" })

    toast({
      title: "Serviço adicionado!",
      description: "Continue adicionando ou avance para a próxima etapa.",
    })
  }

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const handleAddInterval = (day: DayOfWeek) => { // Usar DayOfWeek aqui
    setWorkingHours((prevWorkingHours) => ({
      ...prevWorkingHours,
      [day]: {
        ...prevWorkingHours[day],
        intervals: [...prevWorkingHours[day].intervals, { start: "12:00", end: "13:00" }],
      },
    }))
  }

  const handleRemoveInterval = (day: DayOfWeek, index: number) => { // Usar DayOfWeek aqui
    setWorkingHours((prevWorkingHours) => {
      const newIntervals = [...prevWorkingHours[day].intervals];
      newIntervals.splice(index, 1);
      return {
        ...prevWorkingHours,
        [day]: { ...prevWorkingHours[day], intervals: newIntervals },
      };
    });
  };

  const handleUpdateInterval = (day: DayOfWeek, index: number, field: "start" | "end", value: string) => { // Usar DayOfWeek aqui
    setWorkingHours((prevWorkingHours) => {
      const newIntervals = [...prevWorkingHours[day].intervals];
      newIntervals[index][field] = value;
      return {
        ...prevWorkingHours,
        [day]: { ...prevWorkingHours[day], intervals: newIntervals },
      };
    });
  };


  const validateStep1 = () => {
    if (!basicInfo.name || !basicInfo.whatsapp || !basicInfo.email || !basicInfo.password) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos.", variant: "destructive" })
      return false
    }
    if (basicInfo.password !== basicInfo.confirmPassword) {
      toast({ title: "Senhas não conferem", description: "As senhas devem ser iguais.", variant: "destructive" })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state || !address.zipCode) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos do endereço.", variant: "destructive" })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (services.length === 0) {
      toast({ title: "Adicione pelo menos um serviço", description: "É necessário cadastrar pelo menos um serviço.", variant: "destructive" })
      return false
    }
    return true
  }

  const handleNext = () => {
    if ((step === 1 && !validateStep1()) || (step === 2 && !validateStep2()) || (step === 3 && !validateStep3())) return
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const professionalId = Date.now().toString()
      const userId = `user-${professionalId}`

      const newUser: User = {
        id: userId,
        name: basicInfo.name,
        whatsapp: basicInfo.whatsapp.replace(/\D/g, ""),
        email: basicInfo.email,
        password: basicInfo.password,
        createdAt: new Date().toISOString(),
        type: "professional",
      }
      saveUser(newUser)

      const newProfessional: Professional = {
        id: professionalId,
        userId,
        name: basicInfo.name,
        whatsapp: basicInfo.whatsapp.replace(/\D/g, ""),
        email: basicInfo.email,
        password: basicInfo.password,
        address,
        services,
        // Garante que workingHours tenha o tipo WorkingHoursMap esperado pelo mockData
        workingHours: Object.fromEntries(
          Object.entries(workingHours).map(([day, data]) => [
            day,
            {
              enabled: data.enabled,
              start: data.start,
              end: data.end,
              intervals: data.intervals, // Inclui intervals
            },
          ])
        ) as WorkingHoursMap, // Faz o cast para WorkingHoursMap
        createdAt: new Date().toISOString(),
        status: "active",
        specialty: "Geral", // Exemplo, pode ser um campo no Step 1
        description: "Profissional de beleza e bem-estar", // Exemplo
        experience_years: 0, // Exemplo
        social_instagram: "",
        social_facebook: "",
        phone: basicInfo.whatsapp.replace(/\D/g, ""),
      }
      saveProfessional(newProfessional)

      const availability = getDefaultAvailability(professionalId)
      availability.workingDays = Object.fromEntries(
        DAYS_OF_WEEK.map((day) => [day.key, workingHours[day.key].enabled]) // Mapeia corretamente DayOfWeek
      ) as { [key in DayOfWeek]: boolean };


      const firstEnabledDayKey = DAYS_OF_WEEK.find((day) => workingHours[day.key].enabled)?.key;

      if (firstEnabledDayKey) {
        availability.workingHours = {
          start: workingHours[firstEnabledDayKey].start,
          end: workingHours[firstEnabledDayKey].end,
        };
      } else {
        // Se nenhum dia estiver habilitado, defina um valor padrão ou lance um erro
        availability.workingHours = { start: "09:00", end: "18:00" };
      }
      saveProfessionalAvailability(availability)

      await login(basicInfo.email, basicInfo.password)
      toast({ title: "Cadastro realizado!", description: "Bem-vindo ao sistema." })
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro", description: "Não foi possível realizar o cadastro.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary via-primary to-accent p-6">
        <div className="container mx-auto max-w-2xl">
          <Link href="/login" className="flex items-center gap-2 text-primary-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        {/* Etapas de progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s < step ? "bg-green-500 text-white" : s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-green-500" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Dados Básicos</span>
            <span>Endereço</span>
            <span>Serviços</span>
            <span>Horários</span>
          </div>
        </div>

        <Card className="p-6">
          {/* Passos (Steps) */}
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Dados Básicos</h2>
                <p className="text-muted-foreground">Informações principais do profissional</p>
              </div>
              {["name", "whatsapp", "email", "password", "confirmPassword"].map((field) => {
                const labels: Record<string, string> = {
                  name: "Nome completo *",
                  whatsapp: "WhatsApp *",
                  email: "E-mail *",
                  password: "Senha *",
                  confirmPassword: "Confirmar senha *",
                }
                const placeholders: Record<string, string> = {
                  name: "Seu nome",
                  whatsapp: "(11) 98765-4321",
                  email: "seu@email.com",
                  password: "••••••••",
                  confirmPassword: "••••••••",
                }
                return (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{labels[field]}</Label>
                    <Input
                      id={field}
                      type={field.includes("password") ? "password" : field === "email" ? "email" : field === "whatsapp" ? "tel" : "text"}
                      value={basicInfo[field as keyof typeof basicInfo]}
                      onChange={(e) => setBasicInfo({ ...basicInfo, [field]: e.target.value })}
                      placeholder={placeholders[field]}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Endereço</h2>
                <p className="text-muted-foreground">Onde você atende seus clientes</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
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

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Serviços</h2>
                <p className="text-muted-foreground">Adicione pelo menos um serviço</p>
              </div>
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
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
                  <Label htmlFor="serviceName">Nome do serviço *</Label>
                  <Input
                    id="serviceName"
                    value={currentService.name}
                    onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                    placeholder="Ex: Corte feminino"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={currentService.duration}
                      onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={currentService.price}
                      onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                      placeholder="50.00"
                    />
                  </div>
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

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Horários de Atendimento</h2>
                <p className="text-muted-foreground">Configure seus horários de trabalho</p>
              </div>

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
                          />
                          <span className="font-medium">{day.label}</span>
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

                      {dayHours.enabled && (
                        <div className="ml-6 space-y-3">
                          {dayHours.intervals.map((interval, index) => ( // Removido 'any'
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={interval.start}
                                onChange={(e) => handleUpdateInterval(day.key, index, "start", e.target.value)}
                                className="w-28"
                              />
                              <span>até</span>
                              <Input
                                type="time"
                                value={interval.end}
                                onChange={(e) => handleUpdateInterval(day.key, index, "end", e.target.value)}
                                className="w-28"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveInterval(day.key, index)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddInterval(day.key)}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Intervalo
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={handleNext}>Próximo</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Cadastrando..." : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}