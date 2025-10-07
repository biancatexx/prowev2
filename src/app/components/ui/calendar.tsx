"use client" 

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { CalendarDay, Modifiers } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected"> & {
  appointmentDates?: string[]
  selected?: Date
  onSelect?: (date?: Date) => void
  month?: Date
  onMonthChange?: (date: Date) => void
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  appointmentDates = [],
  selected,
  onSelect,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const [internalMonth, setInternalMonth] = React.useState(new Date())
  const currentMonth = month ?? internalMonth
  const setCurrentMonthFn = onMonthChange ?? setInternalMonth

  // Mapeia quantidade de agendamentos por dia
  const appointmentCount: Record<string, number> = appointmentDates.reduce(
    (acc, dateStr) => {
      acc[dateStr] = (acc[dateStr] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  /**
   * CORREÇÃO: Usando <button> e a lógica de classes para destaque de seleção.
   * Não espalhamos props de div para evitar erro de tipagem.
   */
  function CustomDay({
    day,
    modifiers,
  }: { day: CalendarDay; modifiers: Modifiers } & React.HTMLAttributes<HTMLDivElement>) {
    const date = day.date
    const dateStr = date.toISOString().split("T")[0]
    const count = appointmentCount[dateStr] ?? 0
    const isSelected = modifiers.selected
    const isToday = dateStr === todayStr
    const isDisabled = modifiers.disabled

    return (
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost" }), 
          "h-9 w-9 p-0 font-normal mx-auto relative select-none", 

          // Estilo quando o dia está selecionado (destaque)
          isSelected && 
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",

          // Estilo para o dia de hoje (apenas borda se não estiver selecionado)
          isToday && !isSelected && "border border-primary", 

          // Estilo para dias fora do mês e desabilitados
          modifiers.outside && "opacity-40",
          isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
        )}
        disabled={isDisabled}
      >
        <span>{date.getDate()}</span>
        {count > 0 && (
          <span className="absolute -bottom-1 right-0 flex items-center justify-center w-3 h-3 rounded-full bg-zinc-900 text-white text-[0.6rem]">
            {count}
          </span>
        )}
      </button>
    )
  }

  const handleTodayClick = () => {
    const todayDate = new Date()
    setCurrentMonthFn(todayDate)
    onSelect?.(todayDate)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(Number(e.target.value))
    setCurrentMonthFn(newMonth)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = new Date(currentMonth)
    newYear.setFullYear(Number(e.target.value))
    setCurrentMonthFn(newYear)
  }

  const yearRange = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i)

  return (
    <div className="">
      {/* Header customizado (Controles de Mês/Ano) */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonthFn(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className={cn(buttonVariants({ variant: "outline" }), "h-8 w-8 p-0 shrink-0")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="appearance-none text-sm font-medium bg-background border border-input rounded-md px-2 py-1 cursor-pointer hover:bg-accent min-w-[100px]"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="appearance-none text-sm font-medium bg-background border border-input rounded-md px-2 py-1 cursor-pointer hover:bg-accent min-w-[70px]"
          >
            {yearRange.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonthFn(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className={cn(buttonVariants({ variant: "outline" }), "h-8 w-8 p-0 shrink-0")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={handleTodayClick}
            className={cn(buttonVariants({ variant: "outline" }), "h-8 px-3 py-0 flex items-center gap-1.5 shrink-0")}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">Hoje</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DayPicker
          mode="single"
          locale={ptBR}
          month={currentMonth}
          showOutsideDays={showOutsideDays}
          className={cn("border-none p-0 w-full flex justify-center items-center", className)}
          selected={selected}
          onSelect={onSelect} 
          onMonthChange={setCurrentMonthFn}
          components={{
            Day: CustomDay,
            // REMOVIDO: Head: CustomHead (para evitar o erro de tipagem)
          }}
          classNames={{
            months: "flex justify-center items-center",
            month: "space-y-4",
            caption: "hidden", 
            nav: "hidden",
            nav_button: cn(buttonVariants({ variant: "outline" })),
            table: "w-full border-collapse border-spacing-0",
            
            // CORREÇÃO DO LAYOUT: Garante que os dias da semana estejam em linha
            head_row: "flex w-full",
            // CORREÇÃO DO LAYOUT: Garante que cada dia ocupe 1/7 da largura
            head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center min-w-[2.25rem] py-2",
            
            row: "flex w-full mt-2",
            cell: "flex-1 text-center p-0 relative min-w-[2.25rem]",
            day: "h-9 w-9 p-0 font-normal mx-auto", 
            
            day_outside: "opacity-40",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
            ...classNames,
          }}
          {...props}
        />
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"