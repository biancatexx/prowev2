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
import { ArrowLeft, Edit2, Plus, X, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  saveAppointment,
  getLastClientNameByWhatsapp,
  isDateAvailable,
  getProfessionalById,
  getProfessionals, 
  Professional, 
} from "@/data/mockData"

// --- FUNÇÃO DE AJUDA ---
// Lê o ID do localStorage (apenas para client-side)
const readProfessionalIdFromStorage = (): string | null => {
  if (typeof window === "undefined") return null 
  return localStorage.getItem("mock_logged_professional_id")
}

// --- COMPONENTE PRINCIPAL ---
export default function ProfessionalAgendamento() {
  const router = useRouter()
  
  // 1. CHAME TODOS OS HOOKS INCONDICIONALMENTE NO TOPO
  // O ID é inicializado como null. Ele será populado no useEffect.
  const [loggedProfessionalId, setLoggedProfessionalId] = useState<string | null>(null);
  
  // Estados
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cliente, setCliente] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [suggestedName, setSuggestedName] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<any>(null) 

  // Referências (Hooks useRef)
  const whatsappRef = useRef<HTMLInputElement>(null)
  const clienteRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // Hook useEffect (deve ser chamado incondicionalmente)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Carrega o ID logado do localStorage
      const storedId = readProfessionalIdFromStorage();
      setLoggedProfessionalId(storedId);

      // 2. Carrega bookingData (se vier de outra tela)
      const storedBooking = localStorage.getItem("booking_data")
      if (storedBooking) {
        const data = JSON.parse(storedBooking)
        setBookingData(data)
        if (data.selectedDate) setDate(new Date(data.selectedDate))
        if (data.selectedTime) setSelectedTime(data.selectedTime)
        if (data.selectedServices) setSelectedServices(data.selectedServices)
        localStorage.removeItem("booking_data")
      }
    }
  }, [])
  
  // Hook useMemo (deve ser chamado incondicionalmente)
  const professional: Professional | undefined = useMemo(() => {
    if (!loggedProfessionalId) {
        return undefined; // Não tenta buscar se o ID ainda não foi carregado
    }
    
    // 1. Tenta usar o profissional do estado temporário (bookingData)
    let foundProfessional = bookingData?.professional;
    
    // 2. Se não encontrou no estado, busca pelo ID Logado
    if (!foundProfessional) {
        foundProfessional = getProfessionalById(loggedProfessionalId);
    }
    
    // 3. Fallback para um ID de teste se o ID Logado não retornar um profissional válido
    if (!foundProfessional && getProfessionals().length > 0) {
        const firstMockId = getProfessionals()[0].id;
        if (firstMockId !== loggedProfessionalId) {
             console.warn(`[MOCK INFO] ID "${loggedProfessionalId}" não encontrado. Revertendo temporariamente para o primeiro ID: "${firstMockId}".`);
             foundProfessional = getProfessionals()[0];
        }
    }

    return foundProfessional;
  }, [bookingData, loggedProfessionalId]) as Professional | undefined;


  // Hook useMemo (deve ser chamado incondicionalmente)
  const availableServices = useMemo(() => {
    // Retorna o array de serviços se o professional existir, ou um array vazio.
    return professional ? professional.services : []; 
  }, [professional])


  // ----------------------------------------------------
  // --- A PARTIR DAQUI, COMEÇA A LÓGICA CONDICIONAL ---
  // ----------------------------------------------------

  // Verifica a existência do ID lido
  if (!loggedProfessionalId) {
    // Isso é importante, pois o `useMemo` acima pode retornar `undefined` se o ID for `null`.
    // Mas esta verificação garante que a mensagem de "Aguardando Login" apareça antes de qualquer erro.
    return (
        <div className="container mx-auto max-w-md px-4 py-6 text-center">
             <h1 className="text-2xl font-bold text-yellow-600">Aguardando Login</h1>
             <p className="mt-4 text-muted-foreground">O ID do profissional logado está sendo carregado...</p>
             <p className="mt-2 text-sm">Se esta mensagem persistir, o ID não foi definido no `localStorage`.</p>
             <Button className="mt-4" onClick={() => router.push("/admin/login")}>Ir para Login</Button>
        </div>
    );
  }

  // Verifica se o profissional foi encontrado com o ID lido
  if (!professional) {
    return (
        <div className="container mx-auto max-w-md px-4 py-6 text-center">
             <h1 className="text-2xl font-bold text-destructive">❌ Profissional Não Encontrado</h1>
             <p className="mt-4 text-muted-foreground">O sistema buscou o ID: **{loggedProfessionalId}**, mas ele não existe na sua lista de mocks (`mockData.ts`).</p>
             <p className="mt-2 text-sm">Verifique se o ID está sendo escrito corretamente pela página de **Perfil** no `localStorage`.</p>
             <Button className="mt-4" onClick={() => router.push("/admin/login")}>Ir para Login / Corrigir ID</Button>
        </div>
    );
  }
  
  // Se chegarmos aqui, `professional` está definido e o componente pode renderizar a UI.

  // Cálculos
  const totalPrice = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0)
  const totalDuration = selectedServices.reduce((s, sv) => s + (Number(sv.duration) || 0), 0)

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0min"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? `${h}h ` : ""}${m}min`
  }

  // --- HANDLERS (mantidos) ---
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2")
    value = value.replace(/(\d{5})(\d)/, "$1-$2")
    setWhatsapp(value)

    if (value.replace(/\D/g, "").length >= 10) {
      const lastClientName = getLastClientNameByWhatsapp(value)
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
    toast.success("Data e horário limpos")
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

      const newAppointment = {
        id: `apt-${Date.now()}`,
        professionalId: String(professional.id),
        professionalName: String(professional.name),
        clientName: String(cliente),
        clientWhatsapp: String(cleanWhatsapp || "N/A"),
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
    <div className="container mx-auto max-w-md px-4 py-6 mb-16">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-20">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Novo Agendamento ({professional.name})</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Serviços */}
      <div className="bg-card rounded-2xl border p-5 mb-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Serviços</h2>
          <div className="flex gap-2">
            {selectedServices.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearServices}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleOpenServicesModal}>
              {selectedServices.length === 0 ? (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Selecionar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" /> Editar ({selectedServices.length})
                </>
              )}
            </Button>
          </div>
        </div>
        {selectedServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço selecionado</p>
        ) : (
          <>
            {selectedServices.map((s, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{s.name}</span>
                <span>R$ {s.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold">Total: R$ {totalPrice.toFixed(2)}</div>
          </>
        )}
      </div>

      {/* Data e Horário */}
      <div className="bg-card rounded-2xl border p-5 mb-4" ref={calendarRef}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Data e Horário</h2>
          {(date || selectedTime) && (
            <Button variant="ghost" size="sm" onClick={handleClearDateTime}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Card className="border shadow-sm">
          <CustomCalendar selected={date} onSelect={setDate} getDateStatus={getDateStatus} />
        </Card>
        <div className="mt-3" ref={timesRef}>
          <TimeSlotPicker
            professionalId={professional.id}
            selectedDate={date}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
          />
        </div>
      </div>

      {/* Cliente */}
      <div className="bg-card rounded-2xl border p-5 mb-4">
        <h2 className="text-lg font-semibold mb-2">Cliente</h2>
        <div className="space-y-3">
          <div>
            <Label>WhatsApp (opcional)</Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              placeholder="(00) 00000-0000"
              ref={whatsappRef}
            />
            {suggestedName && <p className="text-sm text-green-600 mt-1">✓ Cliente encontrado: {suggestedName}</p>}
          </div>
          <div>
            <Label>
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              ref={clienteRef}
              placeholder="Nome completo do cliente"
            />
          </div>
        </div>
      </div>

      {/* Botão fixado */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10">
        <div className="container mx-auto max-w-md">
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={handleConfirm}
            disabled={loading || selectedServices.length === 0 || !date || !selectedTime}
          >
            Confirmar Agendamento (R$ {totalPrice.toFixed(2)})
          </Button>
        </div>
      </div>

      {/* Modal Serviços (mantido) */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="font-bold text-xl">Selecionar Serviços</h2>
              <button onClick={handleCloseServicesModal} className="p-1 hover:bg-accent rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {availableServices.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhum serviço cadastrado para este profissional.</p>
              ) : (
                availableServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id)
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleServiceSelection(service)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-4 h-4" />
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
              <Button onClick={handleCloseServicesModal} className="w-full" disabled={selectedServices.length === 0}>
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
            <p>
              <b>Profissional:</b> {professional.name}
            </p>
            <p>
              <b>Serviços:</b>
            </p>
            <ul className="list-disc pl-5">
              {selectedServices.map((s, i) => (
                <li key={i}>
                  {s.name} - R$ {s.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p>
              <b>Duração:</b> {formatDuration(totalDuration)}
            </p>
            <p>
              <b>Total:</b> R$ {totalPrice.toFixed(2)}
            </p>
            <p>
              <b>Cliente:</b> {cliente}
            </p>
            {whatsapp && (
              <p>
                <b>WhatsApp:</b> {whatsapp}
              </p>
            )}
            <p>
              <b>Data:</b> {date?.toLocaleDateString("pt-BR")} às {selectedTime}
            </p>

            <div className="flex gap-2 justify-center border-t pt-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleFinish} disabled={loading}>
                {loading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}