"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { saveClient } from "@/data/mockData"
import type { Client } from "@/data/mockData"

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

    const handleSave = () => {
        // pega o professionalId do usuário logado
        const currentUserStr = typeof window !== "undefined" ? localStorage.getItem("mock_current_user") : null
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
        const professionalId = currentUser?.professionalId || "1"

        const newClient: Client = {
            id: form.whatsapp.replace(/\D/g, ""),
            name: form.name,
            whatsapp: form.whatsapp,
            email: form.email,
            birthDate: form.birthDate || undefined,
            status: form.status,
            totalAppointments: 0,
            totalSpent: 0,
            lastAppointment: new Date().toISOString().split("T")[0],
        }

        // salva no storage (inclui professionalId indiretamente via ensureClientExists)
        saveClient(newClient)

        // opcional: força recarregar a lista de clientes na página anterior
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"))
        }

        router.push("/admin/clientes")
    }

    const formatWhatsapp = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11)
        if (digits.length <= 2) return `(${digits}`
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }


    return (
        <div className="min-h-screen bg-background pb-8">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-6 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-primary-foreground text-center">Novo Cliente</h1>
                </div>
            </header>

            <main className="container mx-auto max-w-screen-lg px-4">
                <Card className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Nome completo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">WhatsApp</label>
                        <Input
                            value={formatWhatsapp(form.whatsapp)}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 11)
                                setForm({ ...form, whatsapp: digits })
                            }}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">E-mail</label>
                        <Input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="exemplo@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                        <Input
                            type="date"
                            value={form.birthDate}
                            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as "ativo" | "inativo" })}
                            className="border rounded-md px-3 py-2 w-full"
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90"
                    >
                        Salvar Cliente
                    </button>
                </Card>
            </main>
        </div>
    )
}
