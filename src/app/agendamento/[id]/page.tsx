"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomCalendar } from "@/components/CustomCalendar"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Edit2, Plus, X, Trash2, CalendarCheck, House, LayoutGrid, Loader2, LogOut, AlertTriangle, CalendarIcon, Clock, ChevronUp, PersonStanding } from "lucide-react" // Importado ChevronUp
import { Card } from "@/components/ui/card"
import {
  saveAppointment,
  getMockProfessionals,
  getMockServices,
  isDateAvailable,
  getUserByWhatsapp,
  getLastClientNameByWhatsapp,
  ensureClientExists,
  User
} from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"

const LOCAL_STORAGE_KEY = 'agendamento_whatsapp';

// Interface para o modal de logout
interface LogoutModalState {
  show: boolean;
  newWhatsapp: string;
  newClientName: string;
}

export default function AgendamentoPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const id = params?.id as string

  const { user, loginClient, logout } = useAuth();

  const isProfessionalView = pathname.includes("/admin/")

  const [bookingData, setBookingData] = useState<any>(null)

  // Estados do agendamento
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cliente, setCliente] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [redirectToBack, setRedirectToBack] = useState(false)

  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<LogoutModalState>({ show: false, newWhatsapp: '', newClientName: '' });

  // ESTADO: Controle da expansão do seletor de Data e Horário
  const [isDateTimeExpanded, setIsDateTimeExpanded] = useState(true);

  // Refs para scroll/foco
  const whatsappRef = useRef<HTMLInputElement>(null)
  const clienteRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // EFEITO: Alternar expansão (contração automática)
  useEffect(() => {
    if (date && selectedTime && isDateTimeExpanded) {
      // Contrai após 500ms da seleção de ambos
      const timer = setTimeout(() => setIsDateTimeExpanded(false), 500);
      return () => clearTimeout(timer);
    } else if (!date || !selectedTime) {
      // Expande se um dos dois for limpo
      setIsDateTimeExpanded(true);
    }
  }, [date, selectedTime]);


  // EFEITO 1: Carregar valor persistido e dados do AuthContext
  useEffect(() => {
    // 1. Carregar valor do Local Storage ao montar
    const savedWhatsapp = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedWhatsapp) {
      setWhatsapp(formatWhatsapp(savedWhatsapp));
    }

    // 2. Se o usuário ESTIVER logado via AuthContext, sobrescreve e preenche os campos
    if (user && user.whatsapp) {
      setFoundUser(user);
      let rawValue = user.whatsapp.replace(/\D/g, "")
      setWhatsapp(formatWhatsapp(rawValue))
      const lastName = getLastClientNameByWhatsapp(user.whatsapp);
      setCliente(lastName || user.name);
      // toast.success(`Bem-vindo(a), ${user.name.split(' ')[0]}! Informações preenchidas.`);
    } else {
      // 3. Se deslogado, limpa foundUser, mas mantém whatsapp do localStorage
      setFoundUser(null);
      if (!savedWhatsapp) setWhatsapp("");
      setCliente("");
    }
  }, [user]);

  // Efeito para carregar dados do bookingData (restante do fluxo)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("booking_data")
      if (stored) {
        const data = JSON.parse(stored)
        setBookingData(data)
        if (data.selectedDate) setDate(new Date(data.selectedDate))
        if (data.selectedTime) setSelectedTime(data.selectedTime)
        if (!isProfessionalView && data.selectedServices) setSelectedServices(data.selectedServices)
        localStorage.removeItem("booking_data")
      }
    }
  }, [isProfessionalView])


  const professional = bookingData?.professional || getMockProfessionals().find((p) => p.id === id)

  // Efeito de redirecionamento se profissional não existe
  useEffect(() => {
    if (!professional) {
      toast.error("Profissional não encontrado")
      setRedirectToBack(true)
    }
  }, [professional])

  useEffect(() => {
    if (redirectToBack) {
      router.back()
    }
  }, [redirectToBack, router])

  const availableServices = getMockServices().filter((s) => s.professionalId === id)
  const totalPrice = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0)
  const totalDuration = selectedServices.reduce((s, sv) => s + (Number(sv.duration) || 0), 0)

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0min"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? `${h}h ` : ""}${m}min`
  }

  // Função para formatar o whatsapp
  const formatWhatsapp = (rawValue: string) => {
    let formattedValue = rawValue;
    formattedValue = formattedValue.replace(/^(\d{2})(\d)/g, "($1) $2")
    formattedValue = formattedValue.replace(/(\d{5})(\d)/, "$1-$2")
    return formattedValue;
  }

  // FUNÇÃO: Lida com a mudança no Input e SALVA NO LOCAL STORAGE
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, "")
    if (rawValue.length > 11) rawValue = rawValue.slice(0, 11)

    const formattedValue = formatWhatsapp(rawValue);
    setWhatsapp(formattedValue);

    // Salva o valor puro (sem formatação) para facilitar a busca/login
    localStorage.setItem(LOCAL_STORAGE_KEY, rawValue);
  }

  // FUNÇÃO: Verifica o usuário ao sair do campo (onBlur)
  const handleWhatsappBlur = async () => {
    if (isProfessionalView) return

    const cleanWhatsappValue = whatsapp.replace(/\D/g, "")

    if (cleanWhatsappValue.length >= 10) {
      const found = getUserByWhatsapp(cleanWhatsappValue);

      // 1. Usuário logado e digitou um WhatsApp DIFERENTE
      if (user && user.whatsapp.replace(/\D/g, "") !== cleanWhatsappValue) {
        setShowLogoutModal({
          show: true,
          newWhatsapp: cleanWhatsappValue,
          newClientName: found ? (getLastClientNameByWhatsapp(found.whatsapp) || found.name) : cliente,
        });
        return;
      }

      // 2. Usuário DESLOGADO: tenta forçar o login
      if (!user) {
        const loginSuccess = await loginClient(cleanWhatsappValue);

        if (loginSuccess) {
          const loggedUser = getUserByWhatsapp(cleanWhatsappValue);
          if (loggedUser) {
            setFoundUser(loggedUser);
            const lastName = getLastClientNameByWhatsapp(loggedUser.whatsapp);
            setCliente(lastName || loggedUser.name || "");
            toast.success(`${loggedUser.name.split(' ')[0] || 'Cliente'} logado. Confirme os dados.`);
          }
        } else {
          setFoundUser(null);
          setCliente("");
        }
      }

      clienteRef.current?.focus();
    } else {
      // WhatsApp incompleto, limpa estados (mantém user logado se estava)
      setFoundUser(user || null);
      setCliente(user?.name || "");
    }
  }

  // FUNÇÃO: Lidar com Desconexão
  const handleLogoutAndSwitch = async () => {
    // 1. Desloga o usuário atual
    logout();
    toast.info("Sessão encerrada.");

    // 2. O useEffect já cuidou de setar o novo WhatsApp no campo (via localStorage)
    setCliente(showLogoutModal.newClientName);

    // 3. Tenta logar com o novo WhatsApp 
    await loginClient(showLogoutModal.newWhatsapp);

    // 4. Fecha o modal
    setShowLogoutModal({ show: false, newWhatsapp: '', newClientName: '' });
  }

  // Função para Deslogar pelo Botão
  const handleButtonLogout = () => {
    logout();
    // O whatsapp digitado é mantido pelo localStorage/state
    toast.info("Você foi desconectado. Preencha seus dados para agendar.");
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

  // FUNÇÃO: Limpar Data e Horário e EXPANDIR
  const handleClearDateTime = () => {
    setDate(undefined)
    setSelectedTime("")
    setIsDateTimeExpanded(true) // Garante que expande ao limpar
    toast.success("Data e horário limpos")
  }

  // FUNÇÃO: Expandir a seção para edição
  const handleEditDateTime = () => {
    setIsDateTimeExpanded(true);
  }

  // 🔑 NOVA FUNÇÃO: Recolher a seção manualmente
  const handleCollapseDateTime = () => {
    setIsDateTimeExpanded(false);
  }

  const handleOpenServicesModal = () => setShowServicesModal(true)
  const handleCloseServicesModal = () => setShowServicesModal(false)

  const handleConfirm = () => {
    // ... (Validações inalteradas) ...
    if (!isProfessionalView && !whatsapp.replace(/\D/g, "")) {
      toast.error("Preencha o WhatsApp")
      whatsappRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      whatsappRef.current?.focus()
      return
    }
    if (!isProfessionalView && whatsapp.replace(/\D/g, "").length < 8) {
      toast.error("Preencha um WhatsApp válido (mínimo 8 dígitos).")
      whatsappRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      whatsappRef.current?.focus()
      return
    }

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

  // FUNÇÃO FINALIZAR
  const handleFinish = async () => {
    setLoading(true)
    try {
      if (!date || !selectedTime || !cliente) {
        toast.error("Preencha todos os campos obrigatórios")
        setLoading(false)
        return
      }

      const cleanWhatsapp = whatsapp.replace(/\D/g, "")
      if (!isProfessionalView && cleanWhatsapp.length === 0) {
        toast.error("O WhatsApp é obrigatório para o cliente.")
        setLoading(false)
        return
      }

      const clientIdFromEnsure = ensureClientExists(
        String(cliente),
        cleanWhatsapp,
        foundUser?.email || user?.email,
        foundUser?.birthDate || user?.birthDate
      );

      if (!isProfessionalView && !user) {
        await loginClient(cleanWhatsapp);
      }

      const finalClientId = user?.id || clientIdFromEnsure;

      const newAppointment = {
        id: `apt-${Date.now()}`,
        professionalId: String(professional.id),
        professionalName: String(professional.name),
        clientId: String(finalClientId),
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

      // Limpa o whatsapp do localStorage após o sucesso (para não preencher o próximo)
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      setTimeout(() => {
        if (isProfessionalView) router.push("/admin/agenda")
        else router.push(`/agendamento/${professional.id}/sucesso`)
      }, 500)
    } catch (error) {
      console.error("[v0] Erro ao criar agendamento:", error)
      toast.error("Erro ao criar agendamento. Tente novamente.")
      setLoading(false)
    }
  }

  const getDateStatus = (checkDate: Date) => {
    if (!isDateAvailable(id, checkDate)) {
      return "unavailable" as const
    }
    return "available" as const
  }

  if (!professional && !redirectToBack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Carregando dados do profissional...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-screen-lg pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-20">
        <div className="flex items-center  px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-center">Novo Agendamento</h1>
          <div className="text-center">
          </div>
        </div>
      </div>

      {/* Estabelecimento */}
      {!isProfessionalView && professional && (
        <div className="bg-card rounded-2xl border p-5 mb-4 mt-4">
          <h2 className="text-lg font-semibold mb-2"><House className="inline w-4 h-4 text-primary mb-1 mr-1" /> Estabelecimento</h2>
          <div className="pl-6">
            <p className="font-medium">{professional.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {`${professional.address.street}, ${professional.address.number} - ${professional.address.city}`}
            </p>
          </div>
        </div>
      )}

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
                  <Edit2 className="w-4 h-4 mr-1" /> {isProfessionalView ? "Selecionar" : "Editar"}
                </>
              )}
            </Button>
          </div>
        </div>
        {selectedServices.length === 0 ? (
          <div className="flex gap-2 pl-6">
            <p className="text-sm text-muted-foreground">Nenhum serviço selecionado</p>
          </div>
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

          <h2 className="text-lg font-semibold"> <CalendarCheck className="inline w-4 h-4 text-primary mb-1 mr-1" /> Data e horário</h2>
          <div className="gap-2 pl-6">
            {/* Botão Limpar visível */}
            {(date || selectedTime) && (
              <Button variant="ghost" size="sm" onClick={handleClearDateTime}>
                <Trash2 className="w-4 h-4" /> Limpar dados
              </Button>
            )}

            {/* 🔑 NOVO BOTÃO: Recolher - Visível se expandido e já houver data selecionada */}
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
              <div>
                <Card className="border flex-1">
                  <CustomCalendar
                    selected={date}
                    onSelect={setDate}
                    getDateStatus={getDateStatus}
                  />
                </Card>
              </div>

              <div className="flex-1" ref={timesRef}>
                <Card className="border flex-1 p-3 h-full itens-center justify-center">
                  <TimeSlotPicker
                    professionalId={id}
                    selectedDate={date}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    totalDuration={totalDuration}
                  /></Card>
              </div>
            </div>
          )}
        </div>
        <div className="gap-2 pl-6 mt-4">
          <div className="flex items-center justify-between gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20 mb-4">
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
          {/* Layout Responsivo: flex-col por padrão, lg:flex-row para telas grandes */}
          {user && !isProfessionalView ? (
            <Button onClick={handleButtonLogout} variant="destructive" size="sm" className="flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        <div className="space-y-3 lg:flex lg:gap-4 lg:space-y-0 pl-6">
          <div className="flex-1">
            <Label>WhatsApp {!isProfessionalView && <span className="text-destructive">*</span>}</Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              onBlur={handleWhatsappBlur}
              placeholder="(00) 00000-0000"
              ref={whatsappRef}
              className={user ? "bg-primary/10 font-medium" : ""}
            />
          </div>
          <div className="flex-1">
            <Label>
              Nome <span className="text-destructive">*</span>
              {user && <span className="text-xs text-primary ml-2">(Logado)</span>}
              {foundUser && !user && <span className="text-xs text-primary ml-2">(Auto)</span>}
            </Label>
            <Input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              ref={clienteRef}
              placeholder="Nome completo do cliente"
              className={foundUser ? "bg-primary/10 font-medium" : ""}
            />
          </div>
        </div>
      </div>

      {/* Botão fixado */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10">
        <div className="container mx-auto max-w-screen-lg">
          <div className="text-center">
            <Button
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Agendamento
            </Button>
          </div>

        </div>
      </div>

      {/* Serviços Modal (Inalterado) */}
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
              {availableServices.map((service: any) => {
                const isSelected = selectedServices.some((s) => s.id === service.id)
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleServiceSelection(service)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/20 border-primary" : "hover:bg-primary/10 "}`}
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
              })}
            </div>

            {selectedServices.length > 0 && (
              <Button
                variant="ghost"
                className="mb-2"
                onClick={handleClearServices}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Limpar Seleção
              </Button>
            )}

            <Button onClick={handleCloseServicesModal} className="w-full">
              Confirmar Seleção ({selectedServices.length})
            </Button>
          </div>
        </div>
      )}

      {/* Confirmação Modal (Inalterado) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="text-center border-b pb-3">
              <h2 className="font-bold text-xl">Confirmar Agendamento</h2>
            </div>
            {!isProfessionalView && professional && (
              <div className="border-b pb-3">
                <div className="font-medium text-lg"> <House className="inline mr-2" /> {professional.name}</div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {`${professional.address.street}, ${professional.address.number} - ${professional.address.city}`}
                </p>
              </div>
            )}

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

            <div className="flex flex-wrap gap-2 justify-end border-t pt-3">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Voltar e Editar
              </Button>

              <Button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL: Confirmação de Troca de Usuário */}
      {showLogoutModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center text-red-500 border-b pb-3">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <h2 className="font-bold text-xl">Troca de Usuário</h2>
            </div>

            <p className="text-sm text-foreground">
              Você está logado como <span className="font-semibold text-primary">{user?.name}</span>.
              O WhatsApp digitado (<span className="font-semibold">{formatWhatsapp(showLogoutModal.newWhatsapp)}</span>) é diferente.
            </p>
            <p className="text-sm text-muted-foreground">
              Deseja sair da conta atual para agendar como este novo usuário (ou cliente)?
            </p>

            <div className="flex gap-3 justify-end pt-3">
              <Button variant="outline" onClick={() => setShowLogoutModal({ show: false, newWhatsapp: '', newClientName: '' })}>
                Manter {user?.name.split(' ')[0]}
              </Button>
              <Button variant="destructive" onClick={handleLogoutAndSwitch}>
                Sair e Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}