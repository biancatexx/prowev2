"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import {
    getCategories,
    getProfessionalById,
    saveProfessional,
    type Service,
} from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { defaultCategories } from "@/data/mockData" // Importar as categorias padrão

// Gerar um ID único simples
const generateServiceId = () => `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`

export default function AdicionarServicoPage() {
    const router = useRouter()
    const { professional: authProfessional, isLoading } = useAuth()
    const [loading, setLoading] = useState(false)

    const categories = getCategories()

    const [serviceData, setServiceData] = useState<Omit<Service, 'id' | 'professionalId'>>({
        category: "",
        name: "",
        duration: 0,
        price: 0,
        description: "",
    })

    // Se os dados ainda estão carregando ou o profissional não está logado
    if (isLoading || !authProfessional) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setServiceData(prev => ({
            ...prev,
            [id]: id === 'duration' || id === 'price' ? Number(value) : value,
        }))
    }

    const handleSelectChange = (value: string) => {
        setServiceData(prev => ({
            ...prev,
            category: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!serviceData.name || !serviceData.category || serviceData.duration <= 0 || serviceData.price <= 0) {
            toast.error("Preencha todos os campos obrigatórios (Nome, Categoria, Duração e Preço).")
            setLoading(false)
            return
        }

        try {
            // 1. Obter os dados atuais do profissional
            const professional = getProfessionalById(authProfessional.id)

            if (!professional) {
                toast.error("Erro: Profissional não encontrado.")
                setLoading(false)
                return
            }

            // 2. Criar o novo objeto Service
            const newService: Service = {
                id: generateServiceId(),
                category: serviceData.category,
                name: serviceData.name,
                duration: serviceData.duration,
                price: serviceData.price,
                description: serviceData.description,
                professionalId: professional.id, // Adicionar o ID do profissional (opcional, mas bom para consistência)
            }

            // 3. Adicionar o novo serviço à lista de serviços do profissional
            const updatedServices = [...professional.services, newService]

            // 4. Criar o objeto Professional atualizado
            const updatedProfessional = {
                ...professional,
                services: updatedServices,
            }

            // 5. Salvar o profissional atualizado
            saveProfessional(updatedProfessional)

            toast.success(`Serviço "${newService.name}" adicionado com sucesso! 🎉`)
            router.push("./") // Redirecionar para a página de perfil
        } catch (error) {
            console.error("Erro ao adicionar serviço:", error)
            toast.error("Ocorreu um erro ao salvar o serviço.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg">
                    <div className="flex justify-start items-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-primary-foreground">Adicionar Novo Serviço</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-screen-lg px-4">
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">


                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria*</Label>
                            <Select onValueChange={handleSelectChange} value={serviceData.category} required>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Selecione a Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.icon} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Serviço*</Label>
                            <Input
                                id="name"
                                value={serviceData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Ex: Corte Feminino, Manicure"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duração (minutos)*</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={serviceData.duration > 0 ? serviceData.duration : ""}
                                    onChange={handleInputChange}
                                    min="5"
                                    required
                                    placeholder="Ex: 60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (R$)*</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={serviceData.price > 0 ? serviceData.price : ""}
                                    onChange={handleInputChange}
                                    min="0.01"
                                    required
                                    placeholder="Ex: 80.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (Opcional)</Label>
                            <Textarea
                                id="description"
                                value={serviceData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Detalhes sobre o serviço"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Salvando..." : "Salvar Serviço"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}