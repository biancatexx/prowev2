"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import NavbarProfessional from "@/components/NavbarProfessional"
import { getClientsByProfessional, type Client } from "@/data/mockData"
import { Button } from "@/components/ui/button"

export default function ClientesPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [professionalId, setProfessionalId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("mock_current_user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const profId = user.professionalId || "1"
        setProfessionalId(profId)

        const clientsList = getClientsByProfessional(profId)
        setClients(clientsList)
        setFilteredClients(clientsList)
      }
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.whatsapp.includes(searchTerm),
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchTerm, clients])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  }

  useEffect(() => {
    const handleStorage = () => {
      if (professionalId) {
        const clientsList = getClientsByProfessional(professionalId)
        setClients(clientsList)
        setFilteredClients(clientsList)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [professionalId])

  return (
    <div className="min-h-screen bg-background pb-20">

      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Clientes</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-screen-lg px-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <Button
            onClick={() => router.push("/admin/clientes/novo")}
              >
            + Cadastrar Cliente
          </Button>
        </div>
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Tente buscar por outro nome ou WhatsApp"
                : "Seus clientes aparecerão aqui após o primeiro agendamento"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/admin/clientes/${client.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${client.status === "ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {client.status}
                      </span>
                    </div>
                    {client.whatsapp && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Phone className="w-3 h-3" />
                        <span>{client.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {client.totalAppointments} agendamento{client.totalAppointments !== 1 ? "s" : ""}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold text-green-600">{formatCurrency(client.totalSpent)}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Última alteração em: <span className="italic">{formatDate(client.lastAppointment)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NavbarProfessional />
    </div>
  )
}
