"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { ArrowLeft, History, Calendar, Clock, DollarSign, Loader2, UserIcon, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
// 🔑 IMPORTAÇÃO ATUALIZADA: Incluindo deleteAppointment
import { getAppointmentsByUserId, type MockAppointment, deleteAppointment } from "@/data/mockData"
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
    const { user, isLoading } = useAuth()

    const [appointments, setAppointments] = useState<MockAppointment[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // ESTADO: Para controlar o agendamento a ser excluído e o estado do modal
    const [appointmentToDelete, setAppointmentToDelete] = useState<MockAppointment | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false) // Estado de carregamento da exclusão

    // Efeito para carregar o histórico assim que o 'user' estiver disponível
    useEffect(() => {
        setLoadingData(true)
        if (user) {
            if (user.id) {
                // A função getAppointmentsByUserId agora lê do localStorage, refletindo as exclusões
                const data = getAppointmentsByUserId(user.id)
                setAppointments(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            } else {
                setAppointments([])
                toast.error("ID do cliente não encontrado. Refaça o login.")
            }
        } else {
            setAppointments([])
        }
        setLoadingData(false)
    }, [user])

    // Função que simula a exclusão do agendamento
    const handleDeleteAppointment = async () => {
        if (!appointmentToDelete) return

        setIsDeleting(true)
        // SIMULAÇÃO de API: Tempo de espera
        await new Promise(resolve => setTimeout(resolve, 500))

        // 🔑 MUDANÇA CRÍTICA: Chama a função que salva a exclusão no localStorage
        deleteAppointment(appointmentToDelete.id)

        // 1. Remove o agendamento da lista local (estado) para atualização imediata na UI
        setAppointments(prev => prev.filter(app => app.id !== appointmentToDelete.id))

        // 2. Fecha o modal e limpa o estado
        setIsDeleting(false)
        setIsModalOpen(false)
        setAppointmentToDelete(null)

        // 3. Notificação de sucesso
        toast.success(`Agendamento com ${appointmentToDelete.professionalName} excluído com sucesso.`)
    }

    // --- LÓGICA DE CARREGAMENTO E REDIRECIONAMENTO (Inalterada) ---
    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-lg">Carregando histórico...</p>
            </div>
        )
    }

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

    // --- COMPONENTE MODAL DE CONFIRMAÇÃO ---
    const DeletionConfirmationModal = () => (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-600">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                        Você tem certeza que deseja **excluir permanentemente** este agendamento? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                {appointmentToDelete && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                        <p className="font-semibold text-red-800">Agendamento de {format(new Date(appointmentToDelete.date), "dd/MM/yyyy", { locale: ptBR })} às {appointmentToDelete.time}</p>
                        <p className="text-red-700">Com: {appointmentToDelete.professionalName}</p>
                    </div>
                )}
                <DialogFooter className="mt-4 flex flex-col sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse">
                    <Button
                        onClick={handleDeleteAppointment}
                        variant="destructive"
                        disabled={isDeleting}
                        className="w-full sm:w-auto mb-2 sm:mb-0"
                        type="button" // 🔑 CORREÇÃO AQUI: Garante que o botão não reative o modal
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : "Excluir Agendamento"}
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(false)}
                        variant="outline"
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                        type="button" // Adicionado por segurança
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    // --- CONTEÚDO DA PÁGINA (USUÁRIO LOGADO) ---
    return (
        <div className="min-h-screen bg-background pb-24">
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
                                <div
                                    className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 "
                                >
                                    {/* Coluna esquerda — Data e Profissional */}
                                    <div>
                                        <p className="font-medium text-foreground">
                                            <span className="text-xl text-primary">• </span>
                                            {format(new Date(appointment.date), "dd 'de' MMM, yyyy", { locale: ptBR })} - {appointment.time}
                                        </p>
                                        <h3 className="text-lg font-bold">{appointment.professionalName}</h3>
                                    </div>

                                    {/* Coluna direita — Status + Botão */}
                                    <div
                                        className="flex items-center sm:justify-end flex-wrap gap-2"
                                    >
                                        {/* Status */}
                                        <span
                                            className={`text-sm font-medium px-3 py-1 rounded-full ${appointment.status === "agendado"
                                                ? "bg-blue-100 text-blue-700"
                                                : appointment.status === "confirmado"
                                                    ? "bg-green-100 text-green-700"
                                                    : appointment.status === "cancelado"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-zinc-100 text-zinc-700"
                                                }`}
                                        >
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>

                                        {/* Botão de Excluir */}
                                        {(appointment.status === "agendado" || appointment.status === "confirmado") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                type="button"
                                                onClick={() => {
                                                    setAppointmentToDelete(appointment);
                                                    setIsModalOpen(true);
                                                }}
                                                title="Excluir Agendamento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>


                                <div className="mt-4 border-t pt-3 grid grid-cols-2 gap-y-2 ">
                                    <p className="text-sm font-semibold">Serviços</p>
                                    <div>
                                        <p className="font-medium text-right text-foreground">{formatDuration(appointment.totalDuration)}</p>
                                    </div>
                                    <ul className="list-disc ml-5 text-sm space-y-1">
                                        {appointment.services.map((service, index) => (
                                            <li key={index} className="text-muted-foreground">{service.name}</li>
                                        ))}
                                    </ul>

                                </div>
                                <div className="mt-4 border-t pt-3 grid grid-cols-2 gap-y-2 ">
                                    <p className="text-sm font-semibold mb-2"> Valor Total</p>
                                    <p className="font-medium text-right text-foreground">R$ {appointment.totalPrice.toFixed(2)}</p>

                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            {/* Renderiza o Modal de Confirmação */}
            <DeletionConfirmationModal />
            <NavbarApp />
        </div>
    )
}