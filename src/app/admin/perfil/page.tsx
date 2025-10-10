'use client'

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save, LogOut } from "lucide-react"
// Importação atualizada para incluir syncAvailabilityFromProfessional
import { saveProfessional, syncAvailabilityFromProfessional, type Professional, type WorkingHoursMap, type DayOfWeek, Address } from "@/data/mockData" 
import NavbarProfessional from "@/components/NavbarProfessional"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import Link from "next/link"
import { Switch } from "@/components/ui/switch" 

// ===============================================
// 📌 TIPAGEM DO FORMULÁRIO
// ===============================================

interface ProfessionalForm extends Omit<Professional, 'address'> {
    address: Address;
}

const dayNames: { [key in DayOfWeek]: string } = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const dayKeys: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];


// ===============================================
// ⚙️ COMPONENTE PERFIL
// ===============================================

export default function Perfil() {
    const { professional: authProfessional, isLoading, updateProfessional, logout } = useAuth()

    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Horário padrão completo (fallback caso o authProfessional não tenha algum dia)
    const defaultWorkingHours: WorkingHoursMap = {
        monday: { enabled: true, start: "09:00", end: "18:00" },
        tuesday: { enabled: true, start: "09:00", end: "18:00" },
        wednesday: { enabled: true, start: "09:00", end: "18:00" },
        thursday: { enabled: true, start: "09:00", end: "18:00" },
        friday: { enabled: true, start: "09:00", end: "18:00" },
        saturday: { enabled: false, start: "09:00", end: "13:00" },
        sunday: { enabled: false, start: "00:00", end: "00:00" },
    };
    
    const initialProfessionalData: ProfessionalForm = {
        id: '', name: '', description: '', phone: '', email: '', profileImage: '', specialty: '', 
        status: 'active', whatsapp: '', userId: '', createdAt: "", experience_years: 0, services: [],
        workingHours: defaultWorkingHours,
        address: { street: '', number: '', city: '', state: '', neighborhood: '', zipCode: '' },
    }

    const initializeFormData = (professional: Professional): ProfessionalForm => {
        const mergedWorkingHours: WorkingHoursMap = {
            ...defaultWorkingHours,
            ...(professional.workingHours || {})
        };
        const mergedAddress: Address = {
            ...initialProfessionalData.address,
            ...(professional.address || {})
        };

        return {
            ...professional,
            address: mergedAddress,
            workingHours: mergedWorkingHours
        } as ProfessionalForm;
    };
    

    const [formData, setFormData] = useState<ProfessionalForm>(authProfessional 
        ? initializeFormData(authProfessional)
        : initialProfessionalData
    ); 

    useEffect(() => {
        if (authProfessional) {
            setFormData(initializeFormData(authProfessional)); 
        }
    }, [authProfessional]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
        );
    }

    if (!authProfessional) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
                <Card className="p-6 rounded-xl">
                    <p className="text-xl font-bold mb-4">Acesso Negado</p>
                    <p className="text-muted-foreground mb-6">Por favor, faça login como profissional para acessar esta página.</p>
                    <Link href='/login'><Button onClick={() => logout()}>Ir para Login</Button></Link>
                </Card>
                <NavbarProfessional />
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [id]: value,
            },
        }));
    };

    const handleWorkingHoursChange = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value,
                },
            },
        }));
    };

    const handleToggleDay = (day: DayOfWeek, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    enabled: checked,
                },
            },
        }));
    };

    const handleSave = () => {
        if (loading) return;
        setLoading(true);

        for (const day of dayKeys) {
            const schedule = formData.workingHours[day];
            if (schedule.enabled && schedule.start >= schedule.end) {
                toast.error(`O horário de início deve ser anterior ao de fim para ${dayNames[day]}.`);
                setLoading(false);
                return;
            }
        }

        try {
            // 1. SALVA OS DADOS DO PROFISSIONAL (Incluindo os Horários Granulares)
            saveProfessional(formData as Professional);
            
            // 2. SINCRONIZA A AGENDA DE AJUSTES (ProfessionalAvailability)
            // Isso garante que a tela de Ajustes reflita os dias habilitados e o novo horário padrão.
            syncAvailabilityFromProfessional(formData as Professional);
            
            // 3. ATUALIZA O CONTEXTO DE AUTENTICAÇÃO
            updateProfessional(formData as Professional);

            toast.success('Perfil e Configurações de Agenda atualizados!')
            setIsEditing(false)
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar, tente mais tarde.') 
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        logout();
        toast.success("Você foi deslogado")

    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg">
                    <h1 className="text-2xl font-bold text-primary-foreground text-center">Perfil Profissional</h1>
                </div>
            </header>

            <div className="container mx-auto max-w-screen-lg px-4 space-y-4">
                {/* Botões de Ação */}
                <div className="flex justify-end items-center">
                    <Button
                        size="sm"
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        disabled={loading}
                        className="w-32"
                    >
                        {loading ? "Salvando..." : isEditing ? (
                            <><Save className="w-5 h-5 mr-1" /> Salvar</>
                        ) : (
                            <><Edit2 className="w-5 h-5 mr-1" /> Editar</>
                        )}
                    </Button>
                </div>

                {/* Imagem de Perfil */}
                <div className="text-center flex justify-center -mb-4">
                    <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white z-10">
                        {/* Lógica de Imagem... */}
                        {formData.profileImage ? (
                            <img
                                src={formData.profileImage}
                                alt={formData.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = `https://placehold.co/96x96/25555d/fff?text=${formData.name.charAt(0)}`;
                                }}
                            />
                        ) : (
                            <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</span>
                        )}
                    </div>
                </div>

                {/* Formulário: Informações do Negócio e Contato */}
                <Card className="p-6 pt-16 -mt-12">
                    <h2 className="text-lg font-bold mb-4">Informações do Negócio</h2>
                    <div className="space-y-4">
                        {/* Campos (Nome, Descrição, Contato, Endereço)... */}
                        <div>
                            <Label htmlFor="name">Nome do Estabelecimento</Label>
                            <Input id="name" value={formData.name} disabled={!isEditing} onChange={handleInputChange}/>
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={formData.description} disabled={!isEditing} rows={3} onChange={handleInputChange}/>
                        </div>

                        <h3 className="font-semibold pt-2">Contato</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" type="tel" value={formData.phone} disabled={!isEditing} onChange={handleInputChange}/>
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} disabled={!isEditing} onChange={handleInputChange}/>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" type="tel" value={formData.whatsapp} disabled={!isEditing} onChange={handleInputChange}/>
                        </div>

                        <h3 className="font-semibold pt-2">Endereço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="street">Rua</Label>
                                <Input id="street" value={formData.address.street} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                            <div>
                                <Label htmlFor="number">Número</Label>
                                <Input id="number" value={formData.address.number} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input id="neighborhood" value={formData.address.neighborhood} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                            <div>
                                <Label htmlFor="city">Cidade</Label>
                                <Input id="city" value={formData.address.city} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                            <div>
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input id="zipCode" value={formData.address.zipCode} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                            <div>
                                <Label htmlFor="state">Estado</Label>
                                <Input id="state" value={formData.address.state} disabled={!isEditing} onChange={handleAddressChange}/>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Seção Horário de Funcionamento (Diário) - AQUI ESTÁ A LÓGICA DE EDIÇÃO DO HORÁRIO */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Horário de Funcionamento</h2>
                    <p className="text-sm text-muted-foreground mb-4">Defina o horário específico para cada dia da semana. Clique em "Editar" acima para alterar.</p>
                    <div className="space-y-4">
                        {dayKeys.map((dayKey) => {
                            const day = dayKey as DayOfWeek;
                            const schedule = formData.workingHours[day] || defaultWorkingHours[day]; 

                            return (
                                <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b last:border-b-0 pb-3 pt-1">
                                    <span className="font-medium w-32 text-left mb-2 sm:mb-0">{dayNames[day]}</span>
                                    
                                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                                        
                                        {/* Switch Habilita/Desabilita */}
                                        <div className="flex items-center space-x-2 w-[80px] justify-start">
                                            <Label htmlFor={`switch-${day}`}>Aberto</Label>
                                            <Switch
                                                id={`switch-${day}`}
                                                checked={schedule.enabled}
                                                onCheckedChange={(checked) => handleToggleDay(day, checked)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        
                                        {/* Horário de Início */}
                                        <Input
                                            type="time"
                                            value={schedule.start}
                                            disabled={!isEditing || !schedule.enabled}
                                            onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                                            className="w-24 text-center"
                                        />

                                        <span className="text-muted-foreground">até</span>
                                        
                                        {/* Horário de Fim */}
                                        <Input
                                            type="time"
                                            value={schedule.end}
                                            disabled={!isEditing || !schedule.enabled}
                                            onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                                            className="w-24 text-center"
                                        />
                                    </div>
                                    
                                    {/* Mensagem "Fechado" para visualização (no mobile) */}
                                    {!schedule.enabled && (
                                        <span className="text-sm text-red-500 sm:w-24 sm:text-right mt-2 sm:mt-0 absolute sm:static right-4">
                                            FECHADO
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
                {/* Fim da Seção Horário de Funcionamento */}

                <div className="mt-6 pt-4 border-t border-border text-end">
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                    </Button>
                </div>
            </div>

            <NavbarProfessional />
        </div>
    )
}