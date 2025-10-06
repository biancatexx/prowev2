"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, CreditCard, Check } from "lucide-react"
import { getAppointments } from "@/data/mockData"
import { Nav } from "react-day-picker"
import NavbarApp from "@/components/NavbarApp"

export default function HistoricoPage() {
  const [whatsapp, setWhatsapp] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    if (showHistory && whatsapp) {
      // Filtra agendamentos pelo WhatsApp
      const allAppointments = getAppointments()
      const filtered = allAppointments.filter((apt) => apt.clientWhatsapp === whatsapp.replace(/\D/g, ""))
      setAppointments(filtered)
    }
  }, [showHistory, whatsapp])

  const handleSearch = () => {
    if (whatsapp) {
      setShowHistory(true)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "agendado":
        return { label: "Agendado", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" }
      case "confirmado":
        return { label: "Confirmado", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" }
      case "concluido":
        return { label: "Concluído", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" }
      case "cancelado":
        return { label: "Cancelado", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" }
      default:
        return { label: status, color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container text-center mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-zinc-800 mb-1">Meus Agendamentos</h1>
          <p className="text-muted-foreground">Acompanhe todos os seus agendamentos</p>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-lg px-4 py-6">
        {/* Busca por WhatsApp */}
        {!showHistory && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-300 to-purple-200 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-10 h-10 text-purple-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Consultar Agendamentos</h2>
                <p className="text-muted-foreground text-sm">Digite seu WhatsApp para visualizar seu histórico</p>
              </div>
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="h-14 text-lg text-center"
                />
                <Button
                  onClick={handleSearch}
                  className="w-full h-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900"
                  disabled={!whatsapp}
                >
                  Consultar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Agendamentos */}
        {showHistory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl border border-border p-4 shadow-sm">
              <div>
                <p className="text-sm text-muted-foreground">Buscando agendamentos de:</p>
                <p className="font-semibold text-lg">{whatsapp}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(false)} className="rounded-full">
                Alterar
              </Button>
            </div>

            {appointments.length === 0 && (
              <p className="text-center text-muted-foreground mt-6">
                Nenhum agendamento encontrado para este WhatsApp.
              </p>
            )}

            {appointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status)
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{appointment.professionalName || appointment.professional}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.services
                          ? appointment.services.map((s: any) => s.name).join(", ")
                          : appointment.service}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                      <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                      <span className={`font-medium text-xs ${statusConfig.textColor}`}>{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-800" />
                      <span>{appointment.date?.split("T")[0] || appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-800" />
                      <span>
                        {appointment.time} ({appointment.totalDuration || appointment.duration} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-zinc-800">
                        R$ {appointment.totalPrice || appointment.price}
                      </span>
                    </div>
                  </div>

                  {appointment.status === "concluido" && !appointment.paid && (
                    <div className="pt-4 border-t border-border flex gap-3 mt-4">
                      <Button className="flex-1 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900">
                        <CreditCard className="mr-2 w-4 h-4" />
                        Pagar com Cartão
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-xl bg-transparent">
                        Pagar com PIX
                      </Button>
                    </div>
                  )}

                  {appointment.paid && (
                    <div className="pt-4 border-t border-border flex items-center gap-2 text-green-600 mt-4">
                      <Check className="w-5 h-5" />
                      <span className="font-medium text-sm">Pagamento confirmado</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
      <NavbarApp />
    </div>
  )
}
