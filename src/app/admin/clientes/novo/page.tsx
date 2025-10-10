'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react" // Adicionei Save para o botão principal
import { Card } from "@/components/ui/card" // Componente Card
import { Input } from "@/components/ui/input" // Componente Input
import { Button } from "@/components/ui/button" // Componente Button
import { Label } from "@/components/ui/label" // Componente Label
// Você pode precisar de Select/Dropdown para o status, mas vou usar um <select> simples se Select não estiver disponível no escopo
import { saveClient } from "@/data/mockData"
import type { Client } from "@/data/mockData"
import { toast } from "sonner"

// Função de formatação de WhatsApp (ajustada para ser externa e reutilizável)
const formatWhatsapp = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
};

export default function NovoClientePage() {
    const router = useRouter()

    const [form, setForm] = useState<{
        name: string
        whatsapp: string
        email?: string
        birthDate?: string
        status: "ativo" | "inativo"
    }>({
        name: "",
        whatsapp: "",
        email: "",
        birthDate: "",
        status: "ativo",
    })

    const [loading, setLoading] = useState(false)

    // Oculta a lógica de formatação de input (que estava incompleta e errada)
    // Usaremos a função formatWhatsapp apenas para exibição
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        // Lógica especial para WhatsApp: salva apenas os dígitos
        if (id === 'whatsapp') {
            const digits = value.replace(/\D/g, "").slice(0, 11)
            setForm(prev => ({ ...prev, [id]: digits }))
        } else {
            setForm(prev => ({ ...prev, [id]: value }))
        }
    }

    const handleSave = () => {
        if (!form.name.trim() || form.whatsapp.replace(/\D/g, "").length < 10) {
            toast.error("Preencha o nome e um número de WhatsApp válido (com DDD).")
            return
        }

        setLoading(true)

        try {
            const currentUserStr = localStorage.getItem("mock_current_user")
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
            const professionalId = currentUser?.professionalId || "1"

            const newClient: Client = {
                // Remove caracteres não numéricos para o ID
                id: form.whatsapp.replace(/\D/g, ""),
                name: form.name.trim(),
                whatsapp: form.whatsapp,
                email: form.email?.trim() || undefined,
                birthDate: form.birthDate || undefined,
                status: form.status,
                totalAppointments: 0,
                totalSpent: 0,
                // Garantir formato YYYY-MM-DD
                lastAppointment: new Date().toISOString().split("T")[0],
                professionalId: professionalId,
            }

            saveClient(newClient)

            window.dispatchEvent(new Event("storage"))


            toast.success("Cliente salvo com sucesso! 🎉")
            router.push("/admin/clientes")
        } catch (error) {
            console.error("Erro ao salvar cliente:", error)
            toast.error("Erro ao salvar cliente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg px-4 flex items-center">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost" // Estilo mais discreto (pode ser "ghost" ou um estilo personalizado com bg-white)
                        size="icon"
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md mr-4 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-primary" />
                    </Button>
                    <h1 className="text-2xl font-bold text-primary-foreground text-center flex-grow">Novo Cliente</h1>
                </div>
            </header>

            <main className="container mx-auto max-w-screen-lg px-4">
                <Card className="p-6 space-y-4">

                    {/* Nome */}
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="Nome completo do cliente"
                            required
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <Label htmlFor="whatsapp">WhatsApp (Obrigatório)</Label>
                        <Input
                            id="whatsapp"
                            type="tel"
                            // Usa a formatação apenas para exibição
                            value={formatWhatsapp(form.whatsapp)}
                            onChange={handleInputChange}
                            placeholder="(99) 99999-9999"
                            required
                        />
                    </div>

                    {/* E-mail */}
                    <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                            id="birthDate"
                            type="date"
                            value={form.birthDate}
                            onChange={handleInputChange}
                            // Estilo para garantir que o input de data se pareça com os outros
                            className="bg-background"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        {/* Mantive o select simples por não ter o componente Select importado no escopo */}
                        <select
                            id="status"
                            value={form.status}
                            onChange={handleInputChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                "Salvando..."
                            ) : (
                                <><Save className="w-5 h-5 mr-1" /> Salvar Cliente</>
                            )}
                        </Button>
                    </div>
                </Card>
            </main>
            {/* O componente NavbarProfessional foi removido pois não faz sentido para a página NovoCliente */}
        </div>
    )
}