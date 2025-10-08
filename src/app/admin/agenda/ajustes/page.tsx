"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import { CustomCalendar } from "@/components/CustomCalendar"
import {
  getProfessionalAvailability,
  saveProfessionalAvailability,
  getDefaultAvailability,
  type ProfessionalAvailability,
} from "@/data/mockData"

export default function AjustesAgenda() {
  const router = useRouter()
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [availability, setAvailability] = useState<ProfessionalAvailability | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [customTime, setCustomTime] = useState("")
  const [showCustomSlots, setShowCustomSlots] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("mock_current_user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const profId = user.professionalId
        setProfessionalId(profId)

        const stored = getProfessionalAvailability(profId)
        setAvailability(stored || getDefaultAvailability(profId))
      }
    }
  }, [])

  if (!availability || !professionalId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  const handleSave = () => {
    saveProfessionalAvailability(availability)
    toast.success("Configurações salvas com sucesso!")
  }

  const handleWorkingDayToggle = (day: keyof typeof availability.workingDays) => {
    setAvailability({
      ...availability,
      workingDays: {
        ...availability.workingDays,
        [day]: !availability.workingDays[day],
      },
    })
  }

  const handleCloseDateToggle = () => {
    if (!selectedDate) return

    const dateStr = selectedDate.toISOString().split("T")[0]
    const isAlreadyClosed = availability.closedDates.includes(dateStr)

    if (isAlreadyClosed) {
      setAvailability({
        ...availability,
        closedDates: availability.closedDates.filter((d) => d !== dateStr),
      })
      toast.success("Data reaberta")
    } else {
      setAvailability({
        ...availability,
        closedDates: [...availability.closedDates, dateStr],
      })
      toast.success("Data fechada")
    }
  }

  const addCustomSlot = () => {
    if (!selectedDate || !customTime) {
      toast.error("Selecione uma data e horário")
      return
    }

    const dateStr = selectedDate.toISOString().split("T")[0]
    const existingCustomSlot = availability.customSlots?.find((cs) => cs.date === dateStr)

    if (existingCustomSlot) {
      if (existingCustomSlot.slots.includes(customTime)) {
        toast.error("Horário já adicionado")
        return
      }

      setAvailability({
        ...availability,
        customSlots: availability.customSlots?.map((cs) =>
          cs.date === dateStr ? { ...cs, slots: [...cs.slots, customTime].sort() } : cs,
        ),
      })
    } else {
      setAvailability({
        ...availability,
        customSlots: [...(availability.customSlots || []), { date: dateStr, slots: [customTime] }],
      })
    }

    setCustomTime("")
    toast.success("Horário personalizado adicionado")
  }

  const removeCustomSlot = (date: string, time: string) => {
    setAvailability({
      ...availability,
      customSlots: availability.customSlots
        ?.map((cs) => (cs.date === date ? { ...cs, slots: cs.slots.filter((t) => t !== time) } : cs))
        .filter((cs) => cs.slots.length > 0),
    })
    toast.success("Horário removido")
  }

  const selectedDateStr = selectedDate?.toISOString().split("T")[0]
  const isSelectedDateClosed = selectedDateStr ? availability.closedDates.includes(selectedDateStr) : false
  const customSlotsForSelectedDate = selectedDateStr
    ? availability.customSlots?.find((cs) => cs.date === selectedDateStr)?.slots || []
    : []

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent sticky top-0 z-50">
        <div className="container mx-auto max-w-screen-lg px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-card rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-primary-foreground">Configurações da Agenda</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4 py-6 space-y-6">
        {/* Dias de Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle>Dias de Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(availability.workingDays).map(([day, isWorking]) => (
              <div key={day} className="flex items-center justify-between">
                <Label className="capitalize">
                  {day === "monday" && "Segunda-feira"}
                  {day === "tuesday" && "Terça-feira"}
                  {day === "wednesday" && "Quarta-feira"}
                  {day === "thursday" && "Quinta-feira"}
                  {day === "friday" && "Sexta-feira"}
                  {day === "saturday" && "Sábado"}
                  {day === "sunday" && "Domingo"}
                </Label>
                <Switch
                  checked={isWorking}
                  onCheckedChange={() => handleWorkingDayToggle(day as keyof typeof availability.workingDays)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Horário de Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle>Horário de Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início</Label>
                <Input
                  className="bg-background/10"
                  type="time"
                  value={availability.workingHours.start}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      workingHours: { ...availability.workingHours, start: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Fim</Label>
                <Input
                  type="time"
                  value={availability.workingHours.end}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      workingHours: { ...availability.workingHours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Intervalo entre horários (minutos)</Label>
              <Input
                type="number"
                min="15"
                step="15"
                value={availability.slotInterval}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    slotInterval: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Datas */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Datas Específicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomCalendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              unavailableDates={availability.closedDates}
            />

            {selectedDate && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSelectedDateClosed ? "Data fechada" : "Data disponível"}
                    </p>
                  </div>
                  <Button variant={isSelectedDateClosed ? "default" : "destructive"} onClick={handleCloseDateToggle}>
                    {isSelectedDateClosed ? "Reabrir Data" : "Fechar Data"}
                  </Button>
                </div>

                {!isSelectedDateClosed && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Horários Personalizados</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowCustomSlots(!showCustomSlots)}>
                          {showCustomSlots ? "Ocultar" : "Mostrar"}
                        </Button>
                      </div>

                      {showCustomSlots && (
                        <>
                          <div className="flex gap-2 mb-3">
                            <Input
                              type="time"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                              placeholder="00:00"
                            />
                            <Button onClick={addCustomSlot}>
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>

                          {customSlotsForSelectedDate.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Horários personalizados para este dia:</p>
                              {customSlotsForSelectedDate.map((time) => (
                                <div key={time} className="flex items-center justify-between bg-accent p-2 rounded-lg">
                                  <span>{time}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomSlot(selectedDateStr!, time)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
