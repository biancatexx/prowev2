"use client"

import { cn } from "@/lib/utils"
import { generateTimeSlots, getUnavailableReason } from "@/data/mockData"

interface TimeSlotPickerProps {
  professionalId: string
  selectedDate?: Date
  selectedTime?: string
  onTimeSelect?: (time: string) => void
  className?: string
}

export function TimeSlotPicker({
  professionalId,
  selectedDate,
  selectedTime,
  onTimeSelect,
  className,
}: TimeSlotPickerProps) {
  if (!selectedDate) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        Selecione uma data para ver os horários disponíveis
      </div>
    )
  }

  const timeSlots = generateTimeSlots(professionalId, selectedDate)

  if (timeSlots.length === 0) {
    const reason = getUnavailableReason(professionalId, selectedDate)
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground opacity-60">{reason}</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {timeSlots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onTimeSelect?.(slot.time)}
          disabled={!slot.available}
          className={cn(
            "py-2 rounded-xl border font-medium text-sm transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through",
            selectedTime === slot.time
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-accent hover:border-primary/50",
            !slot.available && "bg-muted",
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  )
}
