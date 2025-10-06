"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Edit2, Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { saveAppointment, mockProfessionals, mockServices } from "@/data/mockData"

export default function Agendamento() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id as string

  const isProfessional = searchParams?.get("from") === "professional"

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("booking_data")
      if (stored) {
        const data = JSON.parse(stored)
        setBookingData(data)
        if (data.selectedDate) {
          setDate(new Date(data.selectedDate))
        }
        if (data.selectedTime) {
          setSelectedTime(data.selectedTime)
        }
        if (!isProfessional && data.selectedServices) {
          setSelectedServices(data.selectedServices)
        }
        // Clear after loading
        localStorage.removeItem("booking_data")
      }
    }
  }, [isProfessional])

  // Refs para scroll/foco
  const whatsappRef = useRef<HTMLInputElement>(null)
  const clienteRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  const professional = bookingData?.professional ||
    mockProfessionals.find((p) => p.id === id) || {
      id: id || "1",
      name: "Studio Beleza Premium",
      address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    }

  const availableServices = mockServices.filter((s) => s.professionalId === id)

  const totalPrice = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0)
  const totalDuration = selectedServices.reduce((s, sv) => s + (Number(sv.duration) || 0), 0)

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0min"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? `${h}h ` : ""}${m}min`
  }

  const availableTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"]

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2")
    value = value.replace(/(\d{5})(\d)/, "$1-$2")
    setWhatsapp(value)
  }

  const toggleServiceSelection = (service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) {
        return prev.filter((s) => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

  const handleOpenServicesModal = () => {
    setShowServicesModal(true)
  }

  const handleCloseServicesModal = () => {
    setShowServicesModal(false)
  }

  const handleConfirm = () => {
    if (!cliente) {
      toast.error("Preencha o WhatsApp")
      whatsappRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      whatsappRef.current?.focus()
      return
    }
    if (!isProfessional && !whatsapp) {
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
      if (!date || !selectedTime || !cliente) {
        toast.error("Preencha todos os campos obrigatórios")
        setLoading(false)
        return
      }

      if (!isProfessional && !whatsapp) {
        toast.error("Preencha o WhatsApp")
        setLoading(false)
        return
      }

      const cleanWhatsapp = whatsapp.replace(/\D/g, "")

      const newAppointment = {
        id: `apt-${Date.now()}`,
        professionalId: String(professional.id),
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
        status: "agendado",
        createdAt: new Date().toISOString(),
      }

      saveAppointment(newAppointment)

      toast.success("Agendamento criado com sucesso!")

      setTimeout(() => {
        if (isProfessional) {
          router.push("/admin/agenda")
        } else {
          router.push("/agendamento-sucesso")
        }
      }, 500)
    } catch (error) {
      console.error("[v0] Erro ao criar agendamento:", error)
      toast.error("Erro ao criar agendamento. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6 mb-16">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-20">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Novo Agendamento</h1>
          <div className="w-10" />
        </div>
      </div>

      {!cliente && (
        <div className="bg-card rounded-2xl border p-5 mb-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Estabelecimento</h2>
          <p className="font-medium">{professional.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {professional.address}
          </p>
        </div>
      )}

      {/* Serviços */}
      <div className="bg-card rounded-2xl border p-5 mb-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Serviços</h2>
          {selectedServices.length === 0 ? (
            <Button variant="outline" size="sm" onClick={handleOpenServicesModal}>
              <Plus className="w-4 h-4 mr-1" /> Selecionar
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleOpenServicesModal}>
              <Edit2 className="w-4 h-4 mr-1" /> {isProfessional ? "Selecionar" : "Editar"}
            </Button>
          )}
        </div>
        {selectedServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço selecionado</p>
        ) : (
          <>
            {selectedServices.map((s, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{s.name}</span>
                <span>R$ {s.price}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold">Total: R$ {totalPrice}</div>
          </>
        )}
      </div>

      {/* Data e Horário */}
      <div className="bg-card rounded-2xl border p-5 mb-4" ref={calendarRef}>
        <h2 className="text-lg font-semibold mb-2">Data e Horário</h2>
        <Card className="border shadow-sm h-full flex justify-center">
          <Calendar selected={date} onSelect={setDate} />
        </Card>
        <div className="grid grid-cols-3 gap-2 mt-3" ref={timesRef}>
          {availableTimes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`py-2 rounded-xl border ${selectedTime === t ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cliente */}
      <div className="bg-card rounded-2xl border p-5 mb-4">
        <h2 className="text-lg font-semibold mb-2">Cliente</h2>
        <div className="space-y-3">
          <div>
            <Label>WhatsApp {!isProfessional && <span className="text-destructive">*</span>}</Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              placeholder="(00) 00000-0000"
              ref={whatsappRef}
            />
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

      {/* Botão Fixado */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10">
        <div className="container mx-auto max-w-md">
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={handleConfirm}
            disabled={loading}
          >
            Confirmar Agendamento
          </Button>
        </div>
      </div>

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
              {availableServices.map((service) => {
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
                          <span className="text-sm font-medium text-primary">R$ {service.price}</span>
                          <span className="text-sm text-muted-foreground">{formatDuration(service.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 mt-4">
              <Button onClick={handleCloseServicesModal} className="w-full">
                Confirmar Seleção ({selectedServices.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="text-center border-b pb-3">
              <h2 className="font-bold text-xl">Confirmar Agendamento</h2>
            </div>
            {!isProfessional && (
              <>
                <p>
                  <b>Estabelecimento:</b> {professional.name}
                </p>
                <p>
                  <b>Endereço:</b> {professional.address}
                </p>
              </>
            )}
            <p>
              <b>Serviços:</b>
            </p>
            <ul className="list-disc pl-5">
              {selectedServices.map((s, i) => (
                <li key={i}>
                  {s.name} - R$ {s.price}
                </li>
              ))}
            </ul>
            <p>
              <b>Duração:</b> {formatDuration(totalDuration)}
            </p>
            <p>
              <b>Total:</b> R$ {totalPrice}
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
