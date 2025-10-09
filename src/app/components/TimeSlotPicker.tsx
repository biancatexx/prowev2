// src/components/TimeSlotPicker.tsx
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  generateTimeSlots,
  TimeSlot as MockTimeSlot,
  getProfessionalById,
  Professional,
  getStoredAppointments,
  MockAppointment,
  getProfessionalAvailability,
  getDefaultAvailability
} from "@/data/mockData"
import { Loader2, CalendarX } from "lucide-react"

interface TimeSlotPickerProps {
  professionalId: string
  selectedDate: Date | undefined
  selectedTime: string
  onTimeSelect: (time: string) => void
  totalDuration: number
}

const formatTime = (time: string): string => {
  const [hour, minute] = time.split(":")
  return `${hour}:${minute}`
}

export function TimeSlotPicker({
  professionalId,
  selectedDate,
  selectedTime,
  onTimeSelect,
  totalDuration,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<MockTimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)

  const fetchAvailableSlots = useCallback(() => {
    if (!selectedDate || !professionalId) {
      setAvailableSlots([])
      return
    }

    setLoadingSlots(true)

    try {
      const pro = getProfessionalById(professionalId)
      if (!pro) {
        setAvailableSlots([])
        toast.error("Profissional não encontrado para gerar horários.")
        return
      }
      setProfessional(pro)

      const appointments = getStoredAppointments().filter(
        apt =>
          apt.professionalId === professionalId &&
          apt.date === selectedDate.toISOString().split("T")[0] &&
          apt.status !== "cancelado"
      )

      const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
      const slots = generateTimeSlots(professionalId, selectedDate)

      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      const dayName = dayNames[selectedDate.getDay()] as keyof typeof pro.workingHours
      const workingHour = pro.workingHours[dayName] || { enabled: true, start: "09:00", end: "18:00" }

      const filteredSlots = slots.filter(slot => {
        if (!slot.available) return false

        // Horário do slot
        const [slotHour, slotMinute] = slot.time.split(":").map(Number)
        const slotStart = new Date(selectedDate)
        slotStart.setHours(slotHour, slotMinute, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + totalDuration * 60 * 1000)

        // Filtra slots passados
        if (slotEnd <= new Date()) return false

        // Sobreposição com outros agendamentos
        const isOverlap = appointments.some(apt => {
          const [aptHour, aptMinute] = apt.time.split(":").map(Number)
          const aptStart = new Date(selectedDate)
          aptStart.setHours(aptHour, aptMinute, 0, 0)
          const aptEnd = new Date(aptStart.getTime() + apt.totalDuration * 60 * 1000)
          return slotStart < aptEnd && aptStart < slotEnd
        })
        if (isOverlap) return false

        // Horário de fim do expediente
        const [workEndHour, workEndMinute] = workingHour.end.split(":").map(Number)
        const workEndTime = new Date(selectedDate)
        workEndTime.setHours(workEndHour, workEndMinute, 0, 0)
        if (slotEnd > workEndTime) return false

        return true
      })

      setAvailableSlots(filteredSlots)
    } catch (error) {
      console.error("Erro ao gerar horários:", error)
      toast.error("Erro ao carregar horários disponíveis.")
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [professionalId, selectedDate, totalDuration])

  useEffect(() => {
    fetchAvailableSlots()
  }, [fetchAvailableSlots])

  if (!selectedDate) {
    return <div className="text-center py-8 text-muted-foreground">Selecione uma data para ver os horários.</div>
  }

  if (loadingSlots) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando horários...</span>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <CalendarX className="h-8 w-8 mb-2 text-gray-400" />
        Nenhum horário disponível para esta data e duração de serviço.
      </div>
    )
  }

  return (
    <ScrollArea className="h-64 w-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {availableSlots.map(slot => (
          <Button
            key={slot.time}
            variant={selectedTime === slot.time ? "default" : "outline"}
            onClick={() => onTimeSelect(slot.time)}
            disabled={!slot.available}
            className={`w-full ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {formatTime(slot.time)}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
