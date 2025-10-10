"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomCalendar } from "@/components/CustomCalendar"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit2, Plus, X, Trash2, CalendarCheck, LayoutGrid, Loader2, CalendarIcon, Clock, ChevronUp, PersonStanding, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  saveAppointment,
  getLastClientNameByWhatsapp,
  isDateAvailable,
  getProfessionalById,
  getProfessionals,
  Professional,
  ensureClientExists,
} from "@/data/mockData"

// --- FUNÇÃO DE AJUDA ---
const readProfessionalIdFromStorage = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("mock_logged_professional_id")
}

// --- COMPONENTE PRINCIPAL ---
export default function ProfessionalAgendamento() {
  const router = useRouter()

  const [loggedProfessionalId, setLoggedProfessionalId] = useState<string | null>(null);

  // Estados
  const [date, setDate] = useState<Date | undefined>(undefined) // Definido como undefined para começar
  const [selectedTime, setSelectedTime] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cliente, setCliente] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [suggestedName, setSuggestedName] = useState<string | null>(null)

  // ESTADO REINTEGRADO: Controle da expansão do seletor de Data e Horário
  const [isDateTimeExpanded, setIsDateTimeExpanded] = useState(true);

  // Referências
  const whatsappRef = useRef<HTMLInputElement>(null)
  const clienteRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // Hook useEffect para carregar o ID do localStorage e bookingData
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = readProfessionalIdFromStorage()
      setLoggedProfessionalId(storedId);

      // --- CORREÇÃO: Carrega dados do agendamento vindo da navegação ---
      const storedBooking = localStorage.getItem("booking_data")
      if (storedBooking) {
        try {
          const data = JSON.parse(storedBooking)
          // Define a data, se presente e válida
          if (data.selectedDate) setDate(new Date(data.selectedDate))
          // Define o horário, se presente
          if (data.selectedTime) setSelectedTime(data.selectedTime)
          // Define os serviços, se presentes
          if (data.selectedServices && Array.isArray(data.selectedServices)) setSelectedServices(data.selectedServices)
          // Define o nome, se presente
          if (data.clientName) setCliente(data.clientName)
          // Define o whatsapp, se presente
          if (data.whatsapp) setWhatsapp(data.whatsapp)

          localStorage.removeItem("booking_data")
        } catch (error) {
          console.error("Erro ao parsear dados de agendamento do localStorage:", error)
          localStorage.removeItem("booking_data")
        }
      }
    }
  }, [])

  // EFEITO REINTEGRADO: Alternar expansão (contração automática)
  useEffect(() => {
    // Se a data E o horário estão selecionados E a seção está expandida, contrai
    if (date && selectedTime && isDateTimeExpanded) {
      const timer = setTimeout(() => setIsDateTimeExpanded(false), 500);
      return () => clearTimeout(timer);
    } 
    // Se um dos dois não está selecionado E a seção está contraída, expande
    else if ((!date || !selectedTime) && !isDateTimeExpanded) {
      setIsDateTimeExpanded(true);
    }
  }, [date, selectedTime, isDateTimeExpanded]);


  const professional: Professional | undefined = useMemo(() => {
    if (!loggedProfessionalId) return undefined;

    const foundProfessional = getProfessionalById(loggedProfessionalId) ?? undefined;
    if (!foundProfessional && getProfessionals().length > 0 && process.env.NODE_ENV === 'development') {
      console.warn(`[MOCK INFO] Profissional com ID "${loggedProfessionalId}" não encontrado. Usando primeiro mock.`);
      return getProfessionals()[0];
    }

    return foundProfessional;
  }, [loggedProfessionalId]);

  // Hook useMemo para serviços disponíveis
  const availableServices = useMemo(() => {
    return professional ? professional.services : []
  }, [professional])


  // ----------------------------------------------------
  // --- LÓGICA DE RENDERIZAÇÃO E VALIDAÇÃO ---
  // ----------------------------------------------------

  if (loggedProfessionalId === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Carregando dados do profissional...</p>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="container mx-auto max-w-md px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">❌ Profissional Não Encontrado</h1>
        <p className="mt-4 text-muted-foreground">
          O sistema buscou o ID: <b>{loggedProfessionalId}</b>, mas ele não existe na sua lista de mocks (`mockData.ts`).
        </p>
        <p className="mt-2 text-sm">
          Verifique se o ID está sendo escrito corretamente pela página de **Login/Perfil** no `localStorage` ou se o mock está configurado.
        </p>
        <Button className="mt-4" onClick={() => router.push("/admin/login")}>Ir para Login / Corrigir ID</Button>
      </div>
    )
  }

  // Cálculos (dependem de `professional` estar definido)
  const totalPrice = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0)
  const totalDuration = selectedServices.reduce((s, sv) => s + (Number(sv.duration) || 0), 0)

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0min"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? `${h}h ` : ""}${m}min`
  }
  
  const formatWhatsapp = (rawValue: string) => {
    let formattedValue = rawValue;
    formattedValue = formattedValue.replace(/^(\d{2})(\d)/g, "($1) $2")
    formattedValue = formattedValue.replace(/(\d{5})(\d)/, "$1-$2")
    return formattedValue;
  }

  // --- HANDLERS (mantidos/ajustados) ---
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, "")
    if (rawValue.length > 11) rawValue = rawValue.slice(0, 11)

    const formattedValue = formatWhatsapp(rawValue);
    setWhatsapp(formattedValue);

    if (rawValue.length >= 10) {
      const lastClientName = getLastClientNameByWhatsapp(formattedValue)
      if (lastClientName) {
        setSuggestedName(lastClientName)
        setCliente(lastClientName)
      } else {
        setSuggestedName(null)
      }
    } else {
      setSuggestedName(null)
    }
  }

  const toggleServiceSelection = (service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) return prev.filter((s) => s.id !== service.id)
      return [...prev, service]
    })
  }

  const handleClearServices = () => {
    setSelectedServices([])
    toast.success("Serviços limpos")
  }

  const handleClearDateTime = () => {
    setDate(undefined)
    setSelectedTime("")
    setIsDateTimeExpanded(true)
    toast.success("Data e horário limpos")
  }

  const handleEditDateTime = () => {
    setIsDateTimeExpanded(true);
  }

  const handleCollapseDateTime = () => {
    setIsDateTimeExpanded(false);
  }

  const handleOpenServicesModal = () => setShowServicesModal(true)
  const handleCloseServicesModal = () => setShowServicesModal(false)

  const handleConfirm = () => {
    if (!cliente) {
      toast.error("Preencha o nome do cliente")
      clienteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      clienteRef.current?.focus()
      return
    }
    if (selectedServices.length === 0) {
      toast.error("Selecione pelo menos um serviço")
      return
    }
    if (!date) {
      toast.error("Selecione a data")
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!selectedTime) {
      toast.error("Selecione o horário")
      timesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setShowModal(true)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      if (!date || !selectedTime || !cliente || selectedServices.length === 0) {
        toast.error("Preencha todos os campos obrigatórios")
        setLoading(false)
        return
      }

      const cleanWhatsapp = whatsapp.replace(/\D/g, "")

      const clientId = ensureClientExists(cliente, cleanWhatsapp)

      const newAppointment = {
        id: `apt-${Date.now()}`,
        professionalId: professional.id,
        professionalName: professional.name,
        clientId,
        clientName: cliente,
        clientWhatsapp: cleanWhatsapp,
        services: selectedServices.map((s) => ({
          id: String(s.id),
          name: String(s.name),
          price: Number(s.price),
          duration: Number(s.duration),
        })),
        date: date.toISOString().split("T")[0],
        time: String(selectedTime),
        totalPrice: Number(totalPrice),
        totalDuration: Number(totalDuration),
        status: "agendado" as const,
        createdAt: new Date().toISOString(),
      }

      saveAppointment(newAppointment)
      toast.success("Agendamento criado com sucesso!")

      setTimeout(() => {
        router.push("/admin/agenda")
      }, 500)
    } catch (error) {
      console.error("[v0] Erro ao criar agendamento:", error)
      toast.error("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  const getDateStatus = (checkDate: Date) => {
    return isDateAvailable(professional.id, checkDate) ? ("available" as const) : ("unavailable" as const)
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="container mx-auto max-w-screen-lg pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-20">
        <div className="flex items-center px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">Novo Agendamento ({professional.name})</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Serviços */}
      <div className="bg-card rounded-2xl border p-5 mb-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold"> <LayoutGrid className="inline w-4 h-4 text-primary mb-1 mr-1" /> Serviços</h2>
          <div className="flex gap-2 pl-6">
            {selectedServices.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearServices}>
                <Trash2 className="w-4 h-4" /> Limpar dados
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleOpenServicesModal}>
              {selectedServices.length === 0 ? (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Selecionar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </>
              )}
            </Button>
          </div>
        </div>
        {selectedServices.length === 0 ? (
          <div className="pl-6">
             <p className="text-sm text-muted-foreground">Nenhum serviço selecionado</p>
          </div>
        ) : (
          <div className="pl-6">
            {selectedServices.map((s, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{s.name}</span>
                <span>R$ {s.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold">Total: R$ {totalPrice.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Data e Horário */}
      <div className="bg-card rounded-2xl border p-5 mb-4" ref={calendarRef}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold"> <CalendarCheck className="inline w-4 h-4 text-primary mb-1 mr-1" /> Data e horário</h2>
          <div className="flex gap-2 pl-6">
            {/* Botão Limpar visível */}
            {(date || selectedTime) && (
              <Button variant="ghost" size="sm" onClick={handleClearDateTime}>
                <Trash2 className="w-4 h-4" /> Limpar dados
              </Button>
            )}
            {/* NOVO BOTÃO: Recolher - Visível se expandido e já houver data selecionada */}
            {isDateTimeExpanded && date && (
              <Button variant="outline" size="sm" onClick={handleCollapseDateTime}>
                <ChevronUp className="w-4 h-4 mr-1" /> Recolher
              </Button>
            )}
            {/* Botão Editar - Visível se preenchido E contraído */}
            {date && selectedTime && !isDateTimeExpanded && (
              <Button variant="outline" size="sm" onClick={handleEditDateTime}>
                <Edit2 className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
          </div>
        </div>

        {/* Seletores de Data e Horário - VISÍVEIS SOMENTE se isDateTimeExpanded for TRUE */}
        <div className="pl-6">
          {isDateTimeExpanded && (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Card className="border">
                  <CustomCalendar
                    selected={date}
                    onSelect={setDate}
                    getDateStatus={getDateStatus}
                  />
                </Card>
              </div>
              <div className="flex-1" ref={timesRef}>
                <Card className="border p-3 h-full flex flex-col items-center justify-center">
                  <TimeSlotPicker
                    professionalId={professional.id}
                    selectedDate={date}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    totalDuration={totalDuration}
                  /></Card>
              </div>
            </div>
          )}
        </div>
        <div className="pl-6 mt-4">
          <div className="flex items-center justify-between gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20">
            <div className="flex-1 text-sm text-foreground flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-4">
                {date || selectedTime ? (
                  <>
                    {date && (
                      <div className="flex items-center gap-1 font-medium">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span>{date.toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{selectedTime}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Selecione uma data e um horário.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cliente */}
      <div className="bg-card rounded-2xl border p-5 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold mb-2"><PersonStanding className="inline w-4 h-4 text-primary mb-1 mr-1" /> Cliente</h2>
          <div className="w-10" />
        </div>

        <div className="space-y-3 lg:flex lg:gap-4 lg:space-y-0 pl-6">
          <div className="flex-1">
            <Label>WhatsApp (opcional)</Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              placeholder="(00) 00000-0000"
              ref={whatsappRef}
            />
            {suggestedName && <p className="text-xs text-green-600 mt-1">✓ Cliente encontrado: {suggestedName}</p>}
          </div>
          <div className="flex-1">
            <Label>
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              ref={clienteRef}
              placeholder="Nome completo do cliente"
              className={suggestedName ? "bg-primary/10 font-medium" : ""}
            />
          </div>
        </div>
      </div>

      {/* Botão fixado */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10 rounded-t-3xl">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="text-center">
            <Button
              className="w-full max-w-md bg-zinc-900 hover:bg-zinc-800 text-zinc-50"
              onClick={handleConfirm}
              disabled={loading || selectedServices.length === 0 || !date || !selectedTime || !cliente}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Agendamento (R$ {totalPrice.toFixed(2)})
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Serviços (mantido) */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="font-bold text-xl">Selecionar Serviços</h2>
              <button onClick={handleCloseServicesModal} className="p-1 hover:bg-accent rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {availableServices.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhum serviço cadastrado para este profissional.</p>
              ) : (
                availableServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id)
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleServiceSelection(service)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/20 border-primary" : "hover:bg-primary/10"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isSelected} onChange={() => { }} className="w-4 h-4" />
                            <h3 className="font-semibold">{service.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{service.category}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-medium text-primary">R$ {service.price.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">{formatDuration(service.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              {/* Botão Limpar */}
              {selectedServices.length > 0 && (
                <Button
                  variant="ghost"
                  className="mb-2"
                  onClick={handleClearServices}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Limpar Seleção
                </Button>
              )}
              {/* Confirmar */}
              <Button onClick={handleCloseServicesModal} className="w-full">
                Confirmar Seleção ({selectedServices.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação (mantido) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="text-center border-b pb-3">
              <h2 className="font-bold text-xl">Confirmar Agendamento</h2>
            </div>
            <p className="font-semibold border-b pb-3">
              Profissional: <span className="font-normal">{professional.name}</span>
            </p>
            
            <div className="space-y-2">
              <p className="font-semibold">Cliente: <span className="font-normal">{cliente}</span></p>
              {whatsapp && <p className="font-semibold">WhatsApp: <span className="font-normal">{whatsapp}</span></p>}
              <p className="font-semibold">Data: <span className="font-normal">{date?.toLocaleDateString("pt-BR")} às {selectedTime}</span></p>
            </div>

            <p className="font-semibold border-t pt-3">Serviços:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {selectedServices.map((s, i) => (
                <li key={i}>{s.name} - R$ {s.price.toFixed(2)}</li>
              ))}
            </ul>
            <div className="font-bold text-lg border-t pt-3 flex justify-between">
              <span>Total ({formatDuration(totalDuration)}):</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 justify-end border-t pt-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
                Voltar e Editar
              </Button>
              <Button onClick={handleFinish} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirmar Agendamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}