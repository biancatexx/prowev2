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
        profileImage: '',
        social_instagram: '',
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
        return { ...professional, address: mergedAddress, workingHours: mergedWorkingHours, operationType } as ProfessionalForm;
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

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
    );

    if (!authProfessional) return (
        <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
            <Card className="p-6 rounded-xl">
                <p className="text-xl font-bold mb-4">Acesso Negado</p>
                <p className="text-muted-foreground mb-6">Por favor, faça login como profissional para acessar esta página.</p>
                <Link href='/login'><Button onClick={() => logout()}>Ir para Login</Button></Link>
            </Card>
            <NavbarProfessional />
        </div>
    )

    // Funções de formatação
    const formatPhoneDisplay = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
        return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    };
    const formatWhatsappDisplay = (value: string) => {
        const digits = value.replace(/\D/g, "")
        if (!digits) return ""
        if (digits.length <= 2) return `(${digits}`
        if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`
        if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, phone: digits }));
    }

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, whatsapp: digits }));
    }

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [id]: value },
        }));
    }

    const handleOperationTypeChange = (value: ProfessionalForm["operationType"]) => {
        setFormData(prev => ({ ...prev, operationType: value }));
    }

    const handleWorkingHoursChange = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
        setFormData(prev => ({
            ...prev,
            workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], [field]: value } }
        }));
    }

    const handleToggleDay = (day: DayOfWeek, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], enabled: checked } }
        }));
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error("Selecione uma imagem válida."); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setNewImageFile(file);
            setFormData(prev => ({ ...prev, profileImage: base64String }));
        };
        reader.readAsDataURL(file);
    }

    const executeSave = async () => {
        if (loading) return;
        setLoading(true);

        // Validação de horários
        for (const day of dayKeys) {
            const schedule = formData.workingHours[day];
            if (schedule.enabled && schedule.start >= schedule.end) {
                toast.error(`O horário de início deve ser anterior ao de fim para ${dayNames[day]}.`);
                setLoading(false);
                return;
            }
        }

        try {
            const updatedFormData = { ...formData };

            if (newImageFile) {
                toast.info("Processando nova imagem de perfil...");
                setNewImageFile(null);
            }

            saveProfessional(updatedFormData as Professional);
            syncAvailabilityFromProfessional(updatedFormData as Professional);
            updateProfessional(updatedFormData as Professional);
            setOriginalFormData(updatedFormData);

            toast.success('Perfil e Configurações de Agenda atualizados!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar, tente mais tarde.');
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Você foi deslogado");
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Cabeçalho */}
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg">
                    <h1 className="text-2xl font-bold text-primary-foreground text-center">Perfil Profissional</h1>
                </div>
            </header>

            {/* Conteúdo */}
            <div className="container mx-auto max-w-screen-lg px-4 space-y-6">

                {/* Imagem de Perfil */}
                <div className="text-center flex justify-center -mb-4">
                    <div className="relative w-28 h-28">
                        <div className="w-28 h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-5xl font-bold shadow-xl border-4 border-white overflow-hidden">
                            {formData.profileImage ? (
                                <img
                                    src={formData.profileImage}
                                    alt={formData.name}
                                    className="w-full h-full object-cover rounded-full"
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
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formatPhoneDisplay(formData.phone)}
                                    onChange={handlePhoneChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    type="tel"
                                    value={formatWhatsappDisplay(formData.whatsapp)}
                                    onChange={handleWhatsappChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="social_instagram">Instagram</Label>
                                <Input id="social_instagram" type="social_instagram" value={formData.social_instagram} onChange={handleInputChange} />
                            </div>

                        </div>

                        <h3 className="font-semibold pt-2 border-t mt-4">Endereço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input id="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} />
                            </div>
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
                                <Label htmlFor="state">Estado</Label>
                                <Input id="state" value={formData.address.state} onChange={handleAddressChange} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Botões de ação */}
                <div className="flex justify-end items-center space-x-2 pb-4">
                    {hasChanges ? (
                        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                            <AlertDialogTrigger asChild>
                                <Button disabled={loading}>
                                    {loading ? "Salvando..." : (<><Save className="w-5 h-5 mr-1" /> Salvar Edição</>)}
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
                        <Button disabled variant="secondary">
                            <Save className="w-5 h-5 mr-1" /> Salvar Edição
                        </Button>
                    )}
                </div>

                {/* Logout */}
                <div className="mt-6 pt-4 border-t border-border text-end">
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                    </Button>
                </div>
            </div>

            <NavbarProfessional />
        </div>
    );
}
