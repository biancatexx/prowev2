"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, User } from "lucide-react"
import { getStoredAppointments } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"

interface Client {
  whatsapp: string
  name: string
  appointmentsCount: number
  lastAppointment: string
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = () => {
    const appointments = getStoredAppointments()
    const clientsMap = new Map<string, Client>()

    appointments.forEach((apt) => {
      const existing = clientsMap.get(apt.clientWhatsapp)
      if (existing) {
        existing.appointmentsCount++
        if (apt.date > existing.lastAppointment) {
          existing.lastAppointment = apt.date
        }
      } else {
        clientsMap.set(apt.clientWhatsapp, {
          whatsapp: apt.clientWhatsapp,
          name: apt.clientName,
          appointmentsCount: 1,
          lastAppointment: apt.date,
        })
      }
    })

    setClients(Array.from(clientsMap.values()))
  }

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center mb-4">Clientes</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        {filteredClients.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</p>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <Link key={client.whatsapp} href={`/admin/clientes/${client.whatsapp}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.whatsapp}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {client.appointmentsCount} agendamento{client.appointmentsCount !== 1 ? "s" : ""} • Último:{" "}
                        {new Date(client.lastAppointment).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NavbarProfessional />
    </div>
  )
}
