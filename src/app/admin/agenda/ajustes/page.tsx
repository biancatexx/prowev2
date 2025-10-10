'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Ban, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// Importações necessárias
import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/CustomCalendar';
import { getProfessionalAvailability, saveProfessionalAvailability, getDefaultAvailability, DayOfWeek, ProfessionalAvailability, Professional, saveProfessional, WorkingHoursMap } from '@/data/mockData';
import NavbarProfessional from '@/components/NavbarProfessional';

// ===============================================
// 📌 CONSTANTES E TIPAGENS
// ===============================================

const dayNames: { [key in DayOfWeek]: string } = { monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira', thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo' };
const dayKeys: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Estendendo o tipo ProfessionalAvailability para incluir workingHoursMap para edição
interface AvailabilityForm extends ProfessionalAvailability {
    workingHoursMap: WorkingHoursMap; // Adicionamos o mapa de horários para edição granular
}

// Horário padrão completo (fallback)
const defaultWorkingHours: WorkingHoursMap = {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "13:00" },
    sunday: { enabled: false, start: "00:00", end: "00:00" },
};

// ===============================================
// ⚙️ COMPONENTE AJUSTES
// ===============================================

export default function AjustesPage() {
    const { professional: authProfessional, isLoading, updateProfessional } = useAuth();
    const [availability, setAvailability] = useState<AvailabilityForm | null>(null);
    const [originalAvailability, setOriginalAvailability] = useState<AvailabilityForm | null>(null); // Estado original para comparação

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 🔄 Lógica de Inicialização
    useEffect(() => {
        if (!authProfessional || isLoading) return;
        const professionalId = authProfessional.id;
        const stored = getProfessionalAvailability(professionalId);
        let defaultAvail = getDefaultAvailability(professionalId);

        // Se a configuração de agendamento NÃO existe, inicializamos do zero
        if (!stored) {
            // Usa o horário granular do perfil (authProfessional.workingHours)
            const initialData: AvailabilityForm = {
                ...defaultAvail,
                workingHours: { start: "09:00", end: "18:00" }, // Campo obsoleto, mantido por compatibilidade
                workingHoursMap: authProfessional.workingHours || defaultWorkingHours,
            };
            setAvailability(initialData);
            setOriginalAvailability(initialData);
        } else {
            // Se 'stored' existe, usamos, mas garantimos que 'workingHoursMap' existe e está completo.
            const mergedWorkingHoursMap: WorkingHoursMap = {
                ...defaultWorkingHours,
                // Usar o horário do perfil principal, que é a fonte de verdade para a granularidade
                ...(authProfessional.workingHours || {}),
                // Mesclar com qualquer horário específico salvo no 'stored' se a página usasse o horário granular
                // Para simplificar, vamos forçar o uso do horário do perfil como fonte inicial
            };

            const initialData: AvailabilityForm = {
                ...stored,
                // O workingHoursMap que vamos editar, iniciando com o dado do Perfil Principal
                workingHoursMap: mergedWorkingHoursMap,
            };
            setAvailability(initialData);
            setOriginalAvailability(initialData);
        }
    }, [authProfessional, isLoading]);

    const currentAvailability = availability as AvailabilityForm;

    // 🔍 Lógica para checar se houve alterações
    const hasChanges = useMemo(() => {
        if (!availability || !originalAvailability) return false;
        // Compara os campos: slotInterval, closedDates e workingHoursMap (granular)
        return (
            availability.slotInterval !== originalAvailability.slotInterval ||
            JSON.stringify(availability.closedDates) !== JSON.stringify(originalAvailability.closedDates) ||
            JSON.stringify(availability.workingHoursMap) !== JSON.stringify(originalAvailability.workingHoursMap)
        );
    }, [availability, originalAvailability]);


    if (isLoading || !authProfessional) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando configurações...</p></div>;
    if (!availability) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Inicializando agenda...</p></div>;

    const formatDateString = (date: Date) => date.toISOString().split("T")[0];

    // --- Handlers de Edição Granular ---

    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value >= 5 && value <= 120) setAvailability(prev => prev ? ({ ...prev, slotInterval: value }) : null);
        else if (e.target.value === "") setAvailability(prev => prev ? ({ ...prev, slotInterval: 0 }) : null);
    };

    // NOVO HANDLER: Atualiza o horário de um dia específico no workingHoursMap
    const handleWorkingHourChange = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
        setAvailability(prev => prev ? ({
            ...prev,
            workingHoursMap: {
                ...prev.workingHoursMap,
                [day]: {
                    ...prev.workingHoursMap[day],
                    [field]: value,
                },
            },
        }) : null);
    };

    // NOVO HANDLER: Atualiza o switch (habilitado/desabilitado) de um dia específico
    const handleToggleDay = (day: DayOfWeek, checked: boolean) => {
        setAvailability(prev => prev ? ({
            ...prev,
            workingHoursMap: {
                ...prev.workingHoursMap,
                [day]: {
                    ...prev.workingHoursMap[day],
                    enabled: checked,
                },
            },
        }) : null);
    };

    // --- Lógica de Salvamento ---

    const handleSaveHours = async () => {
        if (isSaving || !currentAvailability) return;
        setIsSaving(true);

        // 1. Validação de Intervalo
        if (currentAvailability.slotInterval < 5 || currentAvailability.slotInterval > 120) {
            toast.error("O intervalo de minutos deve ser entre 5 e 120.");
            setIsSaving(false);
            return;
        }

        // 2. Validação de Horário (Início < Fim)
        for (const day of dayKeys) {
            const schedule = currentAvailability.workingHoursMap[day];
            if (schedule.enabled && schedule.start >= schedule.end) {
                toast.error(`O horário de início deve ser anterior ao de fim para ${dayNames[day]}.`);
                setIsSaving(false);
                return;
            }
        }

        try {
            // A. SALVA OS PARÂMETROS DA AGENDA (Intervalo e Datas Bloqueadas)
            // Agora, a ProfessionalAvailability salva é mais simples, o horário granular vai para o Perfil
            const availabilityToSave: ProfessionalAvailability = {
                ...currentAvailability,
                workingHours: { start: "", end: "" }, // Zera o campo obsoleto
                workingDays: dayKeys.reduce((acc, day) => { // Mantém workingDays para compatibilidade, mas o workingHoursMap é a fonte
                    acc[day] = currentAvailability.workingHoursMap[day].enabled;
                    return acc;
                }, {} as { [key in DayOfWeek]: boolean }),
            };
            saveProfessionalAvailability(availabilityToSave);

            // B. ATUALIZA O PERFIL PRINCIPAL COM OS NOVOS HORÁRIOS GRANULARES
            const updatedProfessional: Professional = {
                ...authProfessional,
                workingHours: currentAvailability.workingHoursMap // Salva o novo mapa granular
            };

            // Salva o novo horário no mock data e no contexto de autenticação
            saveProfessional(updatedProfessional);
            updateProfessional(updatedProfessional);

            // C. Atualiza o estado original para desabilitar o botão de salvar
            setOriginalAvailability(currentAvailability);

            toast.success("Horários e parâmetros de agendamento salvos com sucesso!");

        } catch (e) {
            console.error(e);
            toast.error("Erro ao salvar configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Lógica de Bloqueio de Data (Mantida) ---

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) { setSelectedDate(undefined); return; }
        const dateStr = formatDateString(date);
        if (currentAvailability.closedDates.includes(dateStr)) setSelectedDate(undefined);
        else setSelectedDate(date);
    };

    const handleBlockDate = () => { if (!selectedDate) return; setShowBlockModal(true); }

    const confirmBlockDate = () => {
        if (!selectedDate || !currentAvailability) return;
        const dateStr = formatDateString(selectedDate);
        const newClosedDates = [...currentAvailability.closedDates, dateStr].sort();

        try {
            const updatedAvailability = { ...currentAvailability, closedDates: newClosedDates };
            saveProfessionalAvailability(updatedAvailability);
            setAvailability(updatedAvailability);
            setOriginalAvailability(prev => prev ? ({ ...prev, closedDates: newClosedDates }) : null); // Atualiza estado original
            toast.success(`Data ${dateStr} bloqueada com sucesso!`);
        } catch {
            toast.error("Erro ao bloquear data.");
        } finally {
            setShowBlockModal(false);
            setSelectedDate(undefined);
        }
    };

    const handleUnblockDate = (dateToUnblock: string) => {
        if (!currentAvailability) return;
        const newClosedDates = currentAvailability.closedDates.filter(d => d !== dateToUnblock);

        try {
            const updatedAvailability = { ...currentAvailability, closedDates: newClosedDates };
            saveProfessionalAvailability(updatedAvailability);
            setAvailability(updatedAvailability);
            setOriginalAvailability(prev => prev ? ({ ...prev, closedDates: newClosedDates }) : null); // Atualiza estado original
            toast.success(`Data ${dateToUnblock} desbloqueada com sucesso.`);
        }
        catch {
            toast.error("Erro ao desbloquear data.");
        }
    };

    const getDateStatus = (date: Date) => {
        if (currentAvailability.closedDates.includes(formatDateString(date))) {
            return "closed";
        }
        return "available";
    };

    // --- Componente de Renderização ---

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
                <div className="container mx-auto max-w-screen-lg px-4">
                    <h1 className="text-2xl font-bold text-primary-foreground text-center">Configuração da Agenda</h1>
                </div>
            </header>
            <main className="container mx-auto max-w-screen-lg px-4 space-y-6">
                <section className="border rounded-lg p-6 bg-white shadow-sm  ">
                    <h2 className="text-lg font-bold"><Ban className="w-5 h-5 mr-2 inline" />Bloquear dias</h2>
                    <p className="text-sm text-muted-foreground mb-4">Defina bloqueios de férias e folgas.</p>

                    <div className="flex flex-col md:flex-row gap-6">

                        <div className="md:w-1/2">
                            <CustomCalendar
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                getDateStatus={getDateStatus}
                            />
                        </div>

                        <div className="md:w-1/2 space-y-4">
                            <h3 className="text-lg font-medium">Ação para a Data Selecionada</h3>
                            {selectedDate ?
                                <div className="p-4 border rounded-md bg-gray-50 space-y-3">
                                    <p className="text-sm font-semibold">Data selecionada:</p>
                                    <p className="text-lg font-bold text-red-600">{selectedDate.toLocaleDateString('pt-BR')}</p>
                                    <Button onClick={handleBlockDate} className="w-full bg-red-600 hover:bg-red-700">Bloquear este Dia</Button>
                                    <p className="text-xs text-muted-foreground pt-2">A data será marcada como indisponível no seu perfil público.</p>
                                </div>
                                :
                                <p className="text-muted-foreground italic">Clique em um dia no calendário para bloqueá-lo.</p>
                            }

                            <div className="pt-4">
                                <h3 className="text-lg font-medium mb-2">📋 Datas Bloqueadas</h3>
                                <ScrollArea className="h-40 border rounded-md p-3 bg-white">
                                    {currentAvailability.closedDates.length > 0 ?
                                        <ul className="space-y-2">
                                            {currentAvailability.closedDates.map(dateStr =>
                                                <li key={dateStr} className="flex justify-between items-center text-sm">
                                                    <span>{new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-500 hover:text-blue-700 h-8"
                                                        onClick={() => handleUnblockDate(dateStr)}
                                                    >
                                                        Desbloquear
                                                    </Button>
                                                </li>
                                            )}
                                        </ul>
                                        :
                                        <p className="text-muted-foreground text-sm">Nenhuma data bloqueada.</p>
                                    }
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Seção Horário Padrão e Parâmetros */}
                <Card className="p-6 bg-white shadow-sm space-y-6">
                    <h2 className="text-lg font-bold"><Clock className="w-5 h-5 mr-2 inline" />Intervalo de agendamentos</h2>

                    {/* Intervalo */}
                    <div className="space-y-2 pb-4 border-b">
                        <Label htmlFor="slot-interval" className="font-medium">Intervalo de Minutos para Agendamento</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="slot-interval"
                                type="number"
                                value={currentAvailability.slotInterval || ""}
                                onChange={handleIntervalChange}
                                min={5}
                                max={120}
                                placeholder="Ex: 30"
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">minutos. (Mín: 5, Máx: 120).</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Define o tempo de duração que o cliente poderá selecionar.</p>
                    </div>

                    {/* Horário Granular por Dia da Semana (Adaptado da página Perfil) */}
                    <div className="pt-2">
                        <h2 className="text-lg font-bold">Horário de Funcionamento</h2>
                        <p className="text-sm text-muted-foreground mb-4">Defina o horário de trabalho específico e habilite/desabilite para cada dia da semana.</p>

                        <div className=" ">
                            {dayKeys.map((dayKey) => {
                                const day = dayKey as DayOfWeek;
                                // Pega o horário do novo workingHoursMap
                                const schedule = currentAvailability.workingHoursMap[day] || defaultWorkingHours[day];

                                return (
                                    <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b last:border-b-0 py-2">
                                        <span className="font-medium w-32 text-left mb-2 sm:mb-0">{dayNames[day]}</span>

                                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                                            {/* Switch Habilita/Desabilita */}
                                            <div className="flex items-center space-x-2 w-[100px] justify-end relative">
                                                <Label
                                                    htmlFor={`switch-${day}`}
                                                    className={`text-sm ${schedule.enabled ? "text-green-600" : "text-red-500"} sm:w-24 sm:text-right mt-2 sm:mt-0 absolute sm:static right-4 cursor-pointer`}
                                                >
                                                    {schedule.enabled ? "Aberto" : "Fechado"}
                                                </Label>
                                                <Switch
                                                    id={`switch-${day}`}
                                                    checked={schedule.enabled}
                                                    onCheckedChange={(checked) => handleToggleDay(day, checked)}
                                                    className="cursor-pointer"
                                                />
                                            </div>

                                            {/* Horário de Início */}
                                            <Input
                                                type="time"
                                                value={schedule.start}
                                                disabled={!schedule.enabled}
                                                onChange={(e) => handleWorkingHourChange(day, 'start', e.target.value)}
                                                className="w-24 text-center"
                                            />

                                            <span className="text-muted-foreground">até</span>

                                            {/* Horário de Fim */}
                                            <Input
                                                type="time"
                                                value={schedule.end}
                                                disabled={!schedule.enabled}
                                                onChange={(e) => handleWorkingHourChange(day, 'end', e.target.value)}
                                                className="w-24 text-center"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                </Card>
                <div className='text-end mb-4'>
                    {!hasChanges && <p className="text-xs text-muted-foreground mx-2 inline">Nenhuma alteração pendente.</p>}
                    <Button
                        onClick={handleSaveHours}
                        disabled={isSaving || currentAvailability.slotInterval < 5 || !hasChanges} // Habilitado apenas se houver alterações
                    >
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : (
                            <><Save className="w-5 h-5 mr-1" /> Salvar Configurações</>
                        )}
                    </Button>



                </div>

            </main>

            {/* Modal de Confirmação de Bloqueio (Mantido) */}
            <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center"><Ban className="w-5 h-5 mr-2" />Confirmar Bloqueio de Data</DialogTitle>
                        <DialogDescription>
                            Você tem certeza que deseja <strong>bloquear o dia {selectedDate?.toLocaleDateString('pt-BR')}</strong>?
                            <div className="mt-2 font-semibold">Esta ação tornará o dia completamente indisponível para novos agendamentos no seu perfil público.</div>
                            <div className="text-xs text-red-500 mt-2">(Se houver agendamentos existentes, você deverá cancelá-los manualmente.)</div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancelar</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={confirmBlockDate}>Sim, Bloquear Data</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <NavbarProfessional />
        </div>
    );
}