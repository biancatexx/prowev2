"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, MessageCircle, Calendar } from "lucide-react"
import { getStoredAppointments } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"

export default function ClienteDetalhes() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [client, setClient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    loadClientData()
  }, [id])

  const loadClientData = () => {
    const allAppointments = getStoredAppointments()
    const clientAppointments = allAppointments.filter((apt) => apt.clientWhatsapp === id)

    if (clientAppointments.length > 0) {
      const firstApt = clientAppointments[0]
      setClient({
        name: firstApt.clientName,
        whatsapp: firstApt.clientWhatsapp,
        totalAppointments: clientAppointments.length,
        totalSpent: clientAppointments.reduce((sum, apt) => sum + apt.totalPrice, 0),
      })
      setAppointments(clientAppointments)
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cliente não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <button onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <div className="text-center">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-primary">{client.name.charAt(0)}</span>
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">{client.name}</h1>
            <p className="text-primary-foreground/90">{client.whatsapp}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Agendamentos</p>
            <p className="text-2xl font-bold">{client.totalAppointments}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Gasto</p>
            <p className="text-2xl font-bold">R$ {client.totalSpent}</p>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-transparent" variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Ligar
          </Button>
          <Button className="flex-1 bg-transparent" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Agendamentos
          </h2>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold">{new Date(apt.date).toLocaleDateString("pt-BR")}</p>
                  <span className="text-sm text-primary font-medium">{apt.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{apt.services.map((s: any) => s.name).join(", ")}</p>
                <p className="text-sm font-semibold text-green-600 mt-1">R$ {apt.totalPrice}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <NavbarProfessional />
    </div>
  )
}
