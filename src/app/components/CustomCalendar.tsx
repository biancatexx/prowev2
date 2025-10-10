"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  appointmentDates?: string[]
  unavailableDates?: string[]
  getDateStatus?: (date: Date) => "available" | "unavailable" | "closed" | "has-appointments"
  className?: string
}

export function CustomCalendar({
  selected,
  onSelect,
  appointmentDates = [],
  unavailableDates = [],
  getDateStatus,
  className,
}: CustomCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(selected || today)

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Nova função para voltar para o mês e dia atual no calendário
  const goToTodayCalendar = () => {
    setCurrentMonth(new Date()) // Define o mês exibido para o mês atual
    onSelect?.(new Date()) // Seleciona o dia de hoje
  }

  // Verifica se o mês atual do calendário é o mês de hoje
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
  // Verifica se o dia selecionado é o dia de hoje
  const isTodaySelected = isCurrentMonth && (selected && selected.getDate() === today.getDate());
  // O botão "Hoje" deve ser desabilitado se já estiver exibindo o mês atual E o dia atual estiver selecionado
  const isTodayButtonDisabled = isCurrentMonth && isTodaySelected;


  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return formatDateString(date1) === formatDateString(date2)
  }

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return isSameDay(date, today)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return isSameDay(date, selected)
  }

  const hasAppointment = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = formatDateString(date)
    return appointmentDates.includes(dateStr)
  }

  const getStatus = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (getDateStatus) {
      return getDateStatus(date)
    }

    const dateStr = formatDateString(date)
    if (unavailableDates.includes(dateStr)) {
      return "unavailable"
    }
    if (appointmentDates.includes(dateStr)) {
      return "has-appointments"
    }
    return "available"
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelect?.(date)
  }

  const renderDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getStatus(day)
      const isSelectedDay = isSelected(day)
      const isTodayDay = isToday(day)
      const hasAppt = hasAppointment(day)

      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          disabled={status === "unavailable" || status === "closed"}
          className={cn(
            "aspect-square rounded-lg text-sm font-medium transition-colors relative",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
            isSelectedDay && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isTodayDay && !isSelectedDay && "border-2 border-primary",
            status === "unavailable" && "line-through",
            status === "closed" && "text-muted-foreground",
          )}
        >
          {day}
          {hasAppt && !isSelectedDay && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>,
      )
    }

    return days
  }

  return (
    <div className={cn("w-full p-4", className)}>
      {/* Atalho "Hoje" */}
      <div className="flex justify-center">
        <Button size="sm" variant="outline"
          onClick={goToTodayCalendar}
          disabled={isTodayButtonDisabled}
          className="disabled:opacity-30 disabled:pointer-events-none"
        >
          <CalendarCheck className="w-4 h-4 mr-2" /> Agenda Hoje
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={previousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>


      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  )
}