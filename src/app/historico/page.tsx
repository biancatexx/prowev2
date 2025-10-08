"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, CreditCard, Check, UserIcon } from "lucide-react"
import { getAppointments } from "@/data/mockData"
import NavbarApp from "@/components/NavbarApp"
import { useAuth } from "@/contexts/AuthContext"

export default function HistoricoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.whatsapp) {
      setLoading(true)
      const allAppointments = getAppointments()
      const userWhatsappClean = user.whatsapp.replace(/\D/g, "")
      const filtered = allAppointments.filter(
        (apt) => apt.clientWhatsapp === userWhatsappClean,
      )
      setAppointments(filtered)
      setLoading(false)
    } else if (user === null) {
      setLoading(false)
    }
  }, [user])

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

  // Header sempre visível
  const Header = () => (
    <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
      <div className="container mx-auto max-w-screen-lg text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Agendamentos
        </h1>
      </div>
    </header>
  )

  // Main dependendo do estado de autenticação
  const MainContent = () => {
    if (loading && user !== null) {
      return (
        <main className="container mx-auto max-w-screen-lg text-center">
          <p className="mt-8">Aguarde, carregando histórico...</p>
        </main>
      )
    }

    if (!user) {
      return (
        <main className="container mx-auto max-w-screen-lg text-center">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Entre na sua conta para visualizar seu histórico de agendamentos
            </p>
            <Button onClick={() => router.push("/login")}  >
              Fazer Login
            </Button>
          </Card>
        </main>
      )
    }

    return (
      <main className="container mx-auto max-w-screen-lg text-center">
        <p className=" text-zinc-600">Olá, {user.name.split(" ")[0]}! Seu histórico completo.</p>
        <div className="space-y-4 mt-4">
          {appointments.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Nenhum Agendamento</h2>
              <p className="text-sm text-muted-foreground">Você ainda não possui agendamentos no seu histórico.</p>
              <Button onClick={() => router.push("/")} className="w-full mt-4">
                Agendar Agora
              </Button>
            </Card>
          ) : (
            appointments.map((appointment) => {
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
                      <Calendar className="w-4 h-4 text-zinc-900" />
                      <span>{appointment.date?.split("T")[0] || appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-900" />
                      <span>{appointment.time} ({appointment.totalDuration || appointment.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-zinc-900">
                        R$ {appointment.totalPrice || appointment.price}
                      </span>
                    </div>
                  </div>

                  {appointment.status === "concluido" && !appointment.paid && (
                    <div className="pt-4 border-t border-border flex gap-3 mt-4">
                      <Button className="flex-1 rounded-xl bg-zinc-900 text-white hover:bg-zinc-900">
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
            })
          )}
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <MainContent />
      <NavbarApp />
    </div>
  )
}
