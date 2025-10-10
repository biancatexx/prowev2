// pages/admin/clientes/[id].tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
// Importe initializeMocks para garantir que os dados de base existam
import { getClientById, getAppointmentsByProfessional, type Client, type MockAppointment, initializeMocks } from "@/data/mockData" 

export default function ClienteDetalhePage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params?.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [appointments, setAppointments] = useState<MockAppointment[]>([])
    const [professionalId, setProfessionalId] = useState<string | null>(null)

    // A função de carregamento agora é memorizada e depende de profId e clientId
    const loadClientData = useCallback((profId: string, currentClientId: string) => {
        if (!currentClientId || !profId) return;

        // 1. Carregar dados do cliente
        const clientData = getClientById(profId, currentClientId)
        setClient(clientData)

        if (clientData) {
            // 2. Carregar agendamentos (filtra pelo clientId que veio do getClientsByProfessional)
            const allAppointments = getAppointmentsByProfessional(profId)
            
            // NOTE: A função getClientsByProfessional usa o ID do usuário (apt.clientId) ou o whatsapp.
            // Para garantir que filtramos corretamente, usamos o ID do cliente retornado.
            const clientAppointments = allAppointments.filter((apt) => apt.clientId === clientData.id)
            
            setAppointments(
                clientAppointments.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            )
        }


    }, []) // Dependências vazias, pois usa profId e currentClientId como argumentos

    // useEffect para inicialização e carregamento do professionalId
    useEffect(() => {
        // Garante que os mocks existam
        initializeMocks(); 
        
        if (typeof window !== "undefined") {
            const currentUser = localStorage.getItem("mock_current_user")
            let profId = "1" // Padrão se não houver usuário logado
            if (currentUser) {
                const user = JSON.parse(currentUser)
                profId = user.professionalId || "1"
            }
            setProfessionalId(profId)
        }
    }, [])

    // useEffect para carregar dados e escutar mudanças
    useEffect(() => {
        if (professionalId && clientId) {
            // Carrega os dados assim que ambos os IDs estiverem disponíveis
            loadClientData(professionalId, clientId)
        }

        const handleStorageChange = () => {
            if (professionalId && clientId) {
                loadClientData(professionalId, clientId)
            }
        }

        // Adiciona o listener para o evento 'storage'
        window.addEventListener("storage", handleStorageChange)
        
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [clientId, professionalId, loadClientData]) // ✅ ADICIONADO professionalId e loadClientData (memorizada)

    // --- Restante do código permanece igual ---
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
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

    if (!client) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Carregando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg px-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-primary-foreground mb-1">{client.name}</h1>
                        <span
                            className={`inline-block text-xs px-3 py-1 rounded-full ${client.status === "ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {client.status}
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-screen-lg px-4 space-y-4">
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Informações de Contato</h2>
                    <div className="space-y-3">
                        {client.whatsapp && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <span>{client.whatsapp}</span>
                            </div>
                        )}
                        {!client.whatsapp && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-5 h-5" />
                                <span className="italic">WhatsApp não cadastrado</span>
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <span>{client.email}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Estatísticas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{client.totalAppointments}</p>
                                <p className="text-sm text-muted-foreground">Agendamentos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(client.totalSpent)}</p>
                                <p className="text-sm text-muted-foreground">Total gasto</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Último agendamento: {formatDate(client.lastAppointment)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Histórico de Agendamentos</h2>
                    <div className="space-y-3">
                        {appointments.map((appointment) => {
                            const statusConfig = getStatusConfig(appointment.status)
                            return (
                                <div key={appointment.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold">{appointment.services.map((s) => s.name).join(", ")}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(appointment.date)} às {appointment.time}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                                            <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                                            <span className={`font-medium text-xs ${statusConfig.textColor}`}>{statusConfig.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{appointment.totalDuration} min</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(appointment.totalPrice)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </main>
        </div>
    )
}