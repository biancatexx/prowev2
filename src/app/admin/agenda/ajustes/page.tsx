'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Ban, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/CustomCalendar';
import NavbarProfessional from '@/components/NavbarProfessional';
import { cn } from '@/lib/utils';
import { getProfessionalAvailability, saveProfessionalAvailability, getDefaultAvailability, DayOfWeek, ProfessionalAvailability } from '@/data/mockData';

const dayNames: { [key in DayOfWeek]: string } = { monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira', thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo' };
const dayKeys: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function AjustesPage() {
  const { professional: authProfessional, isLoading } = useAuth();
  const [availability, setAvailability] = useState<ProfessionalAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authProfessional || isLoading) return;
    const professionalId = authProfessional.id;
    const stored = getProfessionalAvailability(professionalId);
    let defaultAvail = getDefaultAvailability(professionalId);
    if (!stored) defaultAvail.workingHours = { start: authProfessional.workingHours.monday.start, end: authProfessional.workingHours.monday.end };
    if (!stored) dayKeys.forEach(day => { defaultAvail.workingDays[day] = authProfessional.workingHours[day].enabled });
    setAvailability(stored || defaultAvail);
  }, [authProfessional, isLoading]);

  if (isLoading || !authProfessional) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando configurações...</p></div>;
  if (!availability) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Inicializando agenda...</p></div>;

  const currentAvailability = availability as ProfessionalAvailability;
  const formatDateString = (date: Date) => date.toISOString().split("T")[0];

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 5 && value <= 120) setAvailability(prev => prev ? ({ ...prev, slotInterval: value }) : null);
    else if (e.target.value === "") setAvailability(prev => prev ? ({ ...prev, slotInterval: 0 }) : null);
  };
  const handleWorkingHourChange = (field: 'start' | 'end', value: string) => setAvailability(prev => prev ? ({ ...prev, workingHours: { ...prev.workingHours, [field]: value } }) : null);
  const handleToggleDay = (day: DayOfWeek, checked: boolean) => setAvailability(prev => prev ? ({ ...prev, workingDays: { ...prev.workingDays, [day]: checked } }) : null);

  const handleSaveHours = async () => {
    if (isSaving || !currentAvailability) return;
    setIsSaving(true);
    try {
      if (currentAvailability.slotInterval < 5 || currentAvailability.slotInterval > 120) { toast.error("O intervalo de minutos deve ser entre 5 e 120."); return; }
      saveProfessionalAvailability(currentAvailability);
      toast.success("Horários e parâmetros de agendamento salvos com sucesso!");
    } catch { toast.error("Erro ao salvar configurações."); } finally { setIsSaving(false); }
  };

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
      toast.success(`Data ${dateStr} bloqueada com sucesso!`);
    } catch { toast.error("Erro ao bloquear data."); } finally { setShowBlockModal(false); setSelectedDate(undefined); }
  };

  const handleUnblockDate = (dateToUnblock: string) => {
    if (!currentAvailability) return;
    const newClosedDates = currentAvailability.closedDates.filter(d => d !== dateToUnblock);
    try { const updatedAvailability = { ...currentAvailability, closedDates: newClosedDates }; saveProfessionalAvailability(updatedAvailability); setAvailability(updatedAvailability); toast.success(`Data ${dateToUnblock} desbloqueada com sucesso.`); }
    catch { toast.error("Erro ao desbloquear data."); }
  };

  const getDateStatus = (date: Date) => currentAvailability.closedDates.includes(formatDateString(date)) ? "closed" : "available";

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Configuração da Agenda </h1>
        </div>
      </header>
      <main className="container mx-auto max-w-screen-lg px-4 space-y-4">

        <Card className="p-6 bg-white shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center text-primary"><Clock className="w-5 h-5 mr-2" />Horário Padrão e Parâmetros</h2>
          <div className="space-y-2">
            <Label htmlFor="slot-interval" className="font-medium">Intervalo de Minutos para Agendamento</Label>
            <div className="flex items-center space-x-2">
              <Input id="slot-interval" type="number" value={currentAvailability.slotInterval || ""} onChange={handleIntervalChange} min={5} max={120} placeholder="Ex: 30" className="w-24" />
              <span className="text-sm text-muted-foreground">minutos. (Ex: 30, 45, 60)</span>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t pt-6">
            <h3 className="text-lg font-medium">Horário de Trabalho Padrão</h3>
            <p className="text-sm text-muted-foreground">Este horário se aplica a todos os dias **habilitados** abaixo.</p>
            <div className="flex space-x-4">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="start-time">Início</Label>
                <Input id="start-time" type="time" value={currentAvailability.workingHours.start} onChange={e => handleWorkingHourChange('start', e.target.value)} className="w-32" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="end-time">Fim</Label>
                <Input id="end-time" type="time" value={currentAvailability.workingHours.end} onChange={e => handleWorkingHourChange('end', e.target.value)} className="w-32" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Dias Habilitados (Semanal)</h3>
            <div className="space-y-4">
              {dayKeys.map(day => {
                const isEnabled = currentAvailability.workingDays[day];
                return (
                  <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b last:border-b-0 pb-3 pt-1">
                    <span className="font-medium w-32 text-left mb-2 sm:mb-0">{dayNames[day]}</span>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-end sm:justify-start">
                      <div className="flex items-center space-x-2 w-[80px] justify-start">
                        <Label htmlFor={`switch-${day}`}>Aberto</Label>
                        <Switch id={`switch-${day}`} checked={isEnabled} onCheckedChange={checked => handleToggleDay(day, checked)} />
                      </div>
                      {isEnabled ? <span className="text-sm text-primary font-semibold sm:w-24 text-right">{currentAvailability.workingHours.start} - {currentAvailability.workingHours.end}</span> : <span className="text-sm text-red-500 sm:w-24 text-right">FECHADO</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSaveHours} disabled={isSaving || currentAvailability.slotInterval < 5}>{isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar Horários e Parâmetros"}</Button>
        </Card>

        <section className="border rounded-lg p-6 bg-white shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center text-primary"><Ban className="w-5 h-5 mr-2" />Bloquear Datas Inteiras (Férias/Folgas)</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2"><CustomCalendar selected={selectedDate} onSelect={handleDateSelect} getDateStatus={getDateStatus} unavailableDates={currentAvailability.closedDates} /></div>
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-lg font-medium">Ação para a Data Selecionada</h3>
              {selectedDate ? <div className="p-4 border rounded-md bg-gray-50 space-y-3"><p className="text-sm font-semibold">Data selecionada:</p><p className="text-lg font-bold text-red-600">{selectedDate.toLocaleDateString('pt-BR')}</p><Button onClick={handleBlockDate} className="w-full bg-red-600 hover:bg-red-700">Bloquear este Dia</Button><p className="text-xs text-muted-foreground pt-2">A data será marcada como indisponível no seu perfil público.</p></div> : <p className="text-muted-foreground italic">Clique em um dia no calendário para bloqueá-lo.</p>}
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">📋 Datas Bloqueadas</h3>
                <ScrollArea className="h-40 border rounded-md p-3 bg-white">{currentAvailability.closedDates.length > 0 ? <ul className="space-y-2">{currentAvailability.closedDates.map(dateStr => <li key={dateStr} className="flex justify-between items-center text-sm"><span>{new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')}</span><Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 h-8" onClick={() => handleUnblockDate(dateStr)}>Desbloquear</Button></li>)}</ul> : <p className="text-muted-foreground text-sm">Nenhuma data bloqueada.</p>}</ScrollArea>
              </div>
            </div>
          </div>
        </section>
      </main>


      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center"><Ban className="w-5 h-5 mr-2" />Confirmar Bloqueio de Data</DialogTitle>
            <DialogDescription>Você tem certeza que deseja <strong>bloquear o dia {selectedDate?.toLocaleDateString('pt-BR')}</strong>?<div className="mt-2 font-semibold">Esta ação tornará o dia completamente indisponível para novos agendamentos no seu perfil público.</div><div className="text-xs text-red-500 mt-2">(Se houver agendamentos existentes, você deverá cancelá-los manualmente.)</div></DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancelar</Button><Button className="bg-red-600 hover:bg-red-700" onClick={confirmBlockDate}>Sim, Bloquear Data</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <NavbarProfessional />
    </div>
  );
}
