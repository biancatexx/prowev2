"use client";
import { useEffect, useState, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, LogOut, Pen, Clock } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"

import { saveProfessional, syncAvailabilityFromProfessional, type Professional, type WorkingHoursMap, type DayOfWeek, Address } from "@/data/mockData"
import NavbarProfessional from "@/components/NavbarProfessional"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"


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


export default function Perfil() {
    const { professional: authProfessional, isLoading, updateProfessional, logout } = useAuth()

    const [loading, setLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // Não precisamos mais de newImageFile separado se vamos converter direto para Base64
    // Mas vamos mantê-lo para a lógica de `hasChanges` e para clareza sobre um "novo" upload.
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

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
        id: '',
        name: '',
        description: '',
        phone: '',
        email: '',
        profileImage: '', // Pode ser uma string Base64 ou URL real
        specialty: '',
        status: 'active',
        whatsapp: '',
        userId: '',
        createdAt: "",
        experience_years: 0,
        services: [],
        workingHours: defaultWorkingHours,
        operationType: 'agendamento',
        address: {
            street: '',
            number: '',
            city: '',
            state: '',
            neighborhood: '',
            zipCode: ''
        },
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

        const operationType = professional.operationType || initialProfessionalData.operationType;

        return {
            ...professional,
            address: mergedAddress,
            workingHours: mergedWorkingHours,
            operationType: operationType,
        } as ProfessionalForm;
    };


    const [formData, setFormData] = useState<ProfessionalForm>(authProfessional
        ? initializeFormData(authProfessional)
        : initialProfessionalData
    );
    const [originalFormData, setOriginalFormData] = useState<ProfessionalForm>(formData);

    useEffect(() => {
        if (authProfessional) {
            const initialData = initializeFormData(authProfessional);
            setFormData(initialData);
            setOriginalFormData(initialData);
        }
    }, [authProfessional]);


    const hasChanges = useMemo(() => {
        const isFormChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
        const isImageFilePending = newImageFile !== null;

        return isFormChanged || isImageFilePending;
    }, [formData, originalFormData, newImageFile]);

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


    const handleOperationTypeChange = (
        value: ProfessionalForm["operationType"]
    ) => {
        setFormData(prev => ({
            ...prev,
            operationType: value,
        }));
    };

    const handleWorkingHoursChange = (day: DayOfWeek, field: 'start' | 'end',
        value: string) => {
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

    // 📸 AJUSTADO: Função para lidar com a seleção da imagem (agora lê como Base64)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Por favor, selecione um arquivo de imagem válido.");
                return;
            }

            // FileReader para ler o arquivo como Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;

                // 1. Armazena o arquivo real para a lógica de `hasChanges`
                setNewImageFile(file); // Mantém o controle de que um novo arquivo foi selecionado

                // 2. Atualiza o profileImage no formData para a string Base64
                setFormData(prev => ({
                    ...prev,
                    profileImage: base64String,
                }));
            };
            reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados (Base64)
        }
    };

    const executeSave = async () => {
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
            let updatedFormData = { ...formData };

            // Se um novo arquivo foi selecionado, profileImage já foi atualizado para Base64 em handleImageChange
            // Então, só precisamos resetar newImageFile
            if (newImageFile) {
                toast.info("Processando nova imagem de perfil...");
                setNewImageFile(null); // Limpa o arquivo de upload pendente
            }

            saveProfessional(updatedFormData as Professional);
            syncAvailabilityFromProfessional(updatedFormData as Professional);
            updateProfessional(updatedFormData as Professional);
            setOriginalFormData(updatedFormData);

            toast.success('Perfil e Configurações de Agenda atualizados!')
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar, tente mais tarde.')
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
        }
    }

    const handleLogout = () => {
        logout();
        toast.success("Você foi deslogado")

    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    return (
        <div className="min-h-screen pb-20">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg">
                    <h1 className="text-2xl font-bold text-primary-foreground text-center">Perfil Profissional</h1>
                </div>
            </header>

            <div className="container mx-auto max-w-screen-lg px-4 space-y-6">


                <div className="text-center flex justify-center -mb-4">
                    <div className="relative w-28 h-28">
                        <div className="w-28 h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-5xl font-bold shadow-xl border-4 border-white overflow-hidden">
                            {formData.profileImage ? (
                                <img
                                    src={formData.profileImage}
                                    alt={formData.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        // Fallback para a inicial do nome
                                        target.src = `https://placehold.co/112x112/25555d/fff?text=${formData.name.charAt(0)}`;
                                    }}
                                />
                            ) : (
                                <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={triggerFileInput}
                            className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-accent-foreground 
                            border-2 border-white shadow-md transition-colors hover:bg-zinc-900 hover:text-white z-20"
                            aria-label="Alterar Imagem de Perfil"
                        >
                            <Pen className="w-4 h-4" />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />

                    </div>
                </div>

                {/* Informações do Negócio e Contato */}
                <Card className="p-6 pt-16 -mt-12">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Detalhes da Empresa</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome do Estabelecimento</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} />
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={formData.description} rows={3} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="specialty">Especialidade Principal</Label>
                            <Input id="specialty" value={formData.specialty || ''} onChange={handleInputChange} />
                        </div>

                        <h3 className="font-semibold pt-2 border-t mt-4">Contato</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} />
                            </div>
                        </div>

                        <h3 className="font-semibold pt-2 border-t mt-4">Endereço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="street">Rua</Label>
                                <Input id="street" value={formData.address.street} onChange={handleAddressChange} />
                            </div>
                            <div>
                                <Label htmlFor="number">Número</Label>
                                <Input id="number" value={formData.address.number} onChange={handleAddressChange} />
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input id="neighborhood" value={formData.address.neighborhood} onChange={handleAddressChange} />
                            </div>
                            <div>
                                <Label htmlFor="city">Cidade</Label>
                                <Input id="city" value={formData.address.city} onChange={handleAddressChange} />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input id="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} />
                            </div>
                            <div>
                                <Label htmlFor="state">Estado</Label>
                                <Input id="state" value={formData.address.state} onChange={handleAddressChange} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Horários de Funcionamento e Tipo de Operação */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4 border-b pb-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">Horários de Funcionamento</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Defina o horário de abertura e fechamento para cada dia da semana.
                    </p>
                    <div className="space-y-3">
                        {dayKeys.map((dayKey) => {
                            const day = dayKey as DayOfWeek;
                            const schedule = formData.workingHours[day] || defaultWorkingHours[day];

                            return (
                                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-b-0 py-3 gap-2" >
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium w-28 text-left">{dayNames[day]}</span>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`switch-${day}`}
                                                checked={schedule.enabled}
                                                onCheckedChange={(checked) => handleToggleDay(day, checked)}
                                                className="cursor-pointer"
                                            />
                                            <Label
                                                htmlFor={`switch-${day}`}
                                                className={`text-sm ${schedule.enabled ? "text-green-600 font-bold" : "text-red-500"} `}
                                            >
                                                {schedule.enabled ? "Aberto" : "Fechado"}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="time"
                                            value={schedule.start}
                                            disabled={!schedule.enabled}
                                            onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                                            className="w-24 text-center"
                                        />
                                        <span className="text-muted-foreground">até</span>
                                        <Input
                                            type="time"
                                            value={schedule.end}
                                            disabled={!schedule.enabled}
                                            onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                                            className="w-24 text-center"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tipo de Operação (Rádio Buttons) */}
                    <div className="pt-6 border-t mt-6 border-border flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Tipo de Atendimento</h3>
                            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                                Escolha como prefere gerenciar o fluxo de clientes.
                            </p>
                        </div>

                        <div className="flex space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="operationType"
                                    value="fila"
                                    checked={formData.operationType === "fila"}
                                    onChange={(e) => handleOperationTypeChange(e.target.value as ProfessionalForm["operationType"])}
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <span
                                    className={`text-sm font-medium ${formData.operationType === "fila" ? "text-primary font-bold" : "text-muted-foreground"}`}
                                >
                                    Fila (Por ordem de chegada)
                                </span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="operationType"
                                    value="agendamento"
                                    checked={formData.operationType === "agendamento"}
                                    onChange={(e) => handleOperationTypeChange(e.target.value as ProfessionalForm["operationType"])}
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <span
                                    className={`text-sm font-medium ${formData.operationType === "agendamento" ? "text-primary font-bold" : "text-muted-foreground"}`}
                                >
                                    Agendamento (Com hora marcada)
                                </span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Botões de Ação */}
                <div className="flex justify-end items-center space-x-2 pb-4">
                    {/* Botão SALVAR HABILITADO / MODAL */}
                    {hasChanges ? (
                        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                            <AlertDialogTrigger asChild>
                                <Button disabled={loading}
                                >
                                    {loading ? "Salvando..." : (
                                        <><Save className="w-5 h-5 mr-1" /> Salvar Edição</>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Edições</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Você tem certeza que deseja salvar todas as alterações feitas no seu perfil e horários de funcionamento?
                                        {newImageFile &&
                                            <span className="text-primary font-bold block mt-2">Uma nova imagem de perfil será enviada.</span>
                                        }
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={executeSave} disabled={loading}>
                                        {loading ? "Salvando..." : "Confirmar e Salvar"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        /* Botão SALVAR DESABILITADO */
                        <Button disabled={true} variant="secondary" >
                            <Save className="w-5 h-5 mr-1" /> Salvar Edição
                        </Button>
                    )}
                </div>
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