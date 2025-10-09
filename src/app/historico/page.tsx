"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, History, Calendar, Clock, DollarSign, Loader2, UserIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext" // Caminho corrigido para o AuthContext
import { getAppointmentsByUserId, type MockAppointment } from "@/data/mockData" // Função correta
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import NavbarApp from "@/components/NavbarApp"

// Componente Header
const Header = () => (
    <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
      <div className="container mx-auto max-w-screen-lg text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Histórico de Agendamentos
        </h1>
      </div>
    </header>
)

// Função auxiliar para formatar a duração
const formatDuration = (minutes: number) => {
    if (!minutes) return "0min"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? `${h}h ` : ""}${m}min`
}

// Componente principal
export default function HistoricoPage() {
    const router = useRouter()
    // 🔑 Usa o AuthContext para o estado do usuário e carregamento
    const { user, isLoading } = useAuth() 
    
    const [appointments, setAppointments] = useState<MockAppointment[]>([])
    const [loadingData, setLoadingData] = useState(true) // Novo estado para carregamento de dados

    // 🔑 Efeito para carregar o histórico assim que o 'user' estiver disponível
    useEffect(() => {
        setLoadingData(true)
        if (user) {
            // Verifica se o usuário tem um ID (Todos os clientes devem ter um ID)
            if (user.id) {
                // 1. Carrega os agendamentos usando o ID do usuário logado
                const data = getAppointmentsByUserId(user.id) 
                
                // 2. Ordena por data de criação (mais recente primeiro)
                setAppointments(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            } else {
                setAppointments([])
                toast.error("ID do cliente não encontrado. Refaça o login.")
            }
        } else {
            setAppointments([]) // Limpa se o usuário não estiver logado
        }
        setLoadingData(false)
    }, [user]) // Recarrega sempre que o estado do usuário muda

    
    // --- LÓGICA DE CARREGAMENTO E REDIRECIONAMENTO ---
    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-lg">Carregando histórico...</p>
            </div>
        )
    }

    // 🔑 Se o usuário não estiver logado, exibe o cartão de Login
    if (!user) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <Header />
                <main className="container mx-auto max-w-screen-lg px-4">
                    <Card className="p-8 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Histórico indisponível</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Entre na sua conta para ver seus agendamentos passados e futuros.
                        </p>
                        <Button onClick={() => router.push("/login")}>
                            Fazer Login
                        </Button>
                    </Card>
                </main>
                <NavbarApp />
            </div>
        )
    }
    
    // --- CONTEÚDO DA PÁGINA (USUÁRIO LOGADO) ---
    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <Header />

            <main className="container mx-auto max-w-screen-lg px-4">
            <h2 className="text-2xl font-semibold mt-6 mb-4 px-4">
                Histórico de {user.name.split(' ')[0]}
            </h2>

            {appointments.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground m-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-lg font-medium">Nenhum agendamento encontrado.</p>
                    <p className="text-sm mt-2">Agende um serviço para ver seu histórico aqui!</p>
                </Card>
            ) : (
                <div className="space-y-4 px-4">
                    {appointments.map((appointment) => (
                        <Card key={appointment.id} className="p-5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold">
                                    {appointment.professionalName}
                                </h3>
                                {/* Status do Agendamento */}
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    appointment.status === "agendado" ? "bg-blue-100 text-blue-700" :
                                    appointment.status === "confirmado" ? "bg-green-100 text-green-700" :
                                    appointment.status === "cancelado" ? "bg-red-100 text-red-700" :
                                    "bg-zinc-100 text-zinc-700" // Concluído ou outro
                                }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground border-t pt-3 mt-3">
                                <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data:</p>
                                <p className="font-medium text-right text-foreground">
                                    {format(new Date(appointment.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                </p>
                                
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> Horário:</p>
                                <p className="font-medium text-right text-foreground">{appointment.time}</p>

                                <p className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Total:</p>
                                <p className="font-medium text-right text-foreground">R$ {appointment.totalPrice.toFixed(2)}</p>

                                <p>Duração:</p>
                                <p className="font-medium text-right text-foreground">{formatDuration(appointment.totalDuration)}</p>
                            </div>
                            
                            <div className="mt-4 border-t pt-3">
                                <p className="text-sm font-semibold mb-2">Serviços:</p>
                                <ul className="list-disc ml-5 text-sm space-y-1">
                                    {appointment.services.map((service, index) => (
                                        <li key={index} className="text-muted-foreground">{service.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </main>
            <NavbarApp />
        </div>
    )
}