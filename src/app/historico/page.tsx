"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, CreditCard, Check, UserIcon, MoreVertical, Trash2 } from "lucide-react"
// Importado useToast para notificação
import { useToast } from "@/hooks/use-toast" 
// Assumindo que você tem um componente Modal básico
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

// NOTE: Para simular a exclusão em um ambiente de mock data, 
// vamos definir uma função para manipular o array localmente.
const getAppointments = (): any[] => {
    // Simulando o carregamento dos dados mockados do localStorage (para "persistência" básica de mock)
    const stored = localStorage.getItem("mock_appointments");
    if (stored) {
        return JSON.parse(stored);
    }
    // Dados iniciais de mock se não houver nada no storage
    return [
        { id: "1", date: "2024-11-20", time: "10:00", services: [{ name: "Corte de Cabelo" }], totalPrice: "50,00", totalDuration: 60, professionalName: "Dr. Léo", status: "agendado", clientWhatsapp: "5511987654321", paid: false },
        { id: "2", date: "2024-10-15", time: "14:30", services: [{ name: "Massagem Terapêutica" }], totalPrice: "120,00", totalDuration: 90, professionalName: "Dra. Ana", status: "concluido", clientWhatsapp: "5511987654321", paid: true },
        { id: "3", date: "2024-12-01", time: "16:00", services: [{ name: "Manicure" }], totalPrice: "30,00", totalDuration: 45, professionalName: "Maria", status: "confirmado", clientWhatsapp: "5511987654321", paid: false },
    ];
}

// Simula a remoção do agendamento e salva no localStorage
const deleteAppointmentFromMock = (id: string, currentList: any[]): any[] => {
    const updatedList = currentList.filter(apt => apt.id !== id);
    localStorage.setItem("mock_appointments", JSON.stringify(updatedList));
    return updatedList;
};


import NavbarApp from "@/components/NavbarApp"
import { useAuth } from "@/contexts/AuthContext"

// Componente Modal de Confirmação
const DeleteConfirmationModal = ({ isOpen, onClose, appointment, onDelete, loading }: { isOpen: boolean, onClose: () => void, appointment: any | null, onDelete: () => void, loading: boolean }) => {
    if (!appointment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-600">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                        Você tem certeza que deseja excluir o agendamento abaixo? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 p-4 border border-red-200 bg-red-50 rounded-lg text-sm">
                    <p className="font-bold text-lg text-zinc-900">
                        {appointment.professionalName || appointment.professional}
                    </p>
                    <p className="text-zinc-700">
                        Serviços: {appointment.services ? appointment.services.map((s: any) => s.name).join(", ") : appointment.service}
                    </p>
                    <div className="flex justify-between text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {appointment.date?.split("T")[0] || appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 sm:space-y-2 pt-4">
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={onDelete} 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Excluindo..." : "Excluir Permanentemente"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={loading}
                        className="w-full"
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function HistoricoPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { toast } = useToast()

    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
    const [isDeleting, setIsDeleting] = useState(false) // Novo estado para exclusão

    const loadAppointments = useCallback(() => {
        if (user?.whatsapp) {
            setLoading(true)
            // Inicializa ou carrega os mocks (simulando fetch)
            const allAppointments = getAppointments()
            const userWhatsappClean = user.whatsapp.replace(/\D/g, "")
            
            const filtered = allAppointments.filter(
                (apt) => apt.clientWhatsapp === userWhatsappClean,
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordena por data mais recente primeiro
            
            setAppointments(filtered)
            setLoading(false)
        } else if (user === null) {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        // Para garantir que os dados mockados iniciais existam no localStorage se for a primeira vez
        if (!localStorage.getItem("mock_appointments")) {
            getAppointments(); // Executa a função para popular o mock inicial
        }
        loadAppointments();
    }, [loadAppointments])

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

    // Handlers para o Modal de Exclusão
    const handleOpenDeleteModal = (appointment: any) => {
        setSelectedAppointment(appointment);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleDeleteAppointment = () => {
        if (!selectedAppointment) return;

        setIsDeleting(true);
        try {
            // 1. Simula a exclusão e atualiza o mock global
            const updatedList = deleteAppointmentFromMock(selectedAppointment.id, getAppointments());
            
            // 2. Atualiza o estado local filtrado para o usuário atual
            const userWhatsappClean = user?.whatsapp?.replace(/\D/g, "")
            const filtered = updatedList.filter(
                (apt) => apt.clientWhatsapp === userWhatsappClean
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setAppointments(filtered);
            handleCloseDeleteModal();
            
            toast({
                title: "Agendamento Excluído",
                description: "O agendamento foi removido com sucesso.",
                variant: "destructive"
            });
        } catch (error) {
            console.error("Erro ao excluir agendamento:", error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir o agendamento.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

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
                <main className="container mx-auto max-w-screen-lg text-center px-4">
                    <Card className="p-8 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Entre na sua conta para visualizar seu histórico de agendamentos
                        </p>
                        <Button onClick={() => router.push("/login")} >
                            Fazer Login
                        </Button>
                    </Card>
                </main>
            )
        }

        return (
            <main className="container mx-auto max-w-screen-lg text-center px-4">
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
                            // A exclusão só é permitida se o status for "agendado" ou "confirmado"
                            const canDelete = appointment.status === "agendado" || appointment.status === "confirmado";

                            return (
                                <div
                                    key={appointment.id}
                                    className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all text-left"
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
                                        <div className="flex items-center gap-2">
                                            {/* Status */}
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                                                <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                                                <span className={`font-medium text-xs ${statusConfig.textColor}`}>{statusConfig.label}</span>
                                            </div>

                                            {/* Botão de Opções/Excluir */}
                                            {canDelete && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleOpenDeleteModal(appointment)}
                                                    className="w-10 h-10 rounded-full text-zinc-600 hover:bg-zinc-100 text-center"
                                                >
                                                     <Trash2 className="w-5 h-5 mr-2" />
                                                </Button>
                                            )}
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
            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                appointment={selectedAppointment}
                onDelete={handleDeleteAppointment}
                loading={isDeleting}
            />
        </div>
    )
}
