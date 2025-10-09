"use client"
import { useState, useEffect } from "react"
import { Cog, List, MoreVertical, Plus, Rows3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CustomCalendar } from "@/components/CustomCalendar"
import NavbarProfessional from "@/components/NavbarProfessional"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getStoredAppointments } from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"

export default function Agenda() {
  const { professional: authProfessional, isLoading, logout } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<"hora" | "dia">("hora")
  const [appointments, setAppointments] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => { loadAppointments() }, [])
  useEffect(() => { const interval = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(interval) }, [])

  const loadAppointments = () => {
    const stored = getStoredAppointments()
    const formatted = stored.map((apt) => ({
      id: apt.id, clientId: apt.clientId, date: apt.date, time: apt.time,
      duration: apt.totalDuration, client: apt.clientName, clientWhatsapp: apt.clientWhatsapp,
      service: apt.services.map((s) => s.name).join(", "), status: apt.status,
    }))
    setAppointments(formatted)
  }

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">
    <p className="text-muted-foreground">Carregando agenda...</p>
  </div>
  if (!authProfessional) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
      <Card className="p-6 rounded-xl">
        <p className="text-xl font-bold mb-4">Acesso Negado</p>
        <p className="text-muted-foreground mb-6">Por favor, faça login como profissional para acessar sua agenda.</p>
        <Link href='/login'>
          <Button onClick={() => logout()}>Ir para Login</Button>
        </Link>
      </Card>
      <NavbarProfessional />
    </div>
  )

  const appointmentDates = appointments.map((apt) => apt.date)
  const formatDate = (d: Date) => d.toISOString().split("T")[0]
  const filteredAppointments = date
    ? appointments.filter((a) => a.date === formatDate(date) && a.professionalId === authProfessional.id)
    : appointments.filter((a) => a.professionalId === authProfessional.id)
  const timeToMinutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m }
  const generateTimeSlots = () => { const slots = []; for (let h = 8; h <= 20; h++) { slots.push(`${String(h).padStart(2, "0")}:00`); slots.push(`${String(h).padStart(2, "0")}:30`) }; return slots }
  const timeSlots = generateTimeSlots()
  const slotHeight = 60
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentPosition = ((currentHour - 8) * 2 + currentMinute / 30) * slotHeight
  const getDayInfo = (dateStr: string) => { const d = new Date(dateStr + "T00:00:00"); const weekdays = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]; return { day: weekdays[d.getDay()], number: String(d.getDate()).padStart(2, "0") } }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Agenda</h1>
        </div>
      </header>
      <div className="container mx-auto max-w-screen-lg px-4 py-4">
        <div className="flex justify-center gap-2">
          <div className="inline-flex h-10 items-center justify-center w-full bg-card border border-border rounded-xl p-1 mb-6">
            <button onClick={() => setTab("hora")} className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "hora" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <List className="inline w-3 h-3 mr-2" /> Visão diária</button>
            <button onClick={() => setTab("dia")} className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "dia" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Rows3 className="inline w-3 h-3 mr-2" /> Visão mensal</button>
          </div>
        </div>

        {tab === "hora" && <>
          <Card className="border shadow-sm h-full flex flex-col lg:flex-row gap-4 items-center p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <CustomCalendar selected={date} onSelect={setDate} appointmentDates={appointmentDates.filter(d => appointments.find(a => a.date === d && a.professionalId === authProfessional.id))} className="rounded-md border" />
            </div>
            <div className="flex-1 text-center p-4">
              <h2 className="text-lg text-primary font-bold mb-2">{date ? date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "Selecione um dia"}</h2>
              <p className="text-lg text-zinc-900">{filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? "s" : ""}</p>
            </div>
          </Card>
          <div className="relative flex mt-4">
            <div className="w-14 flex flex-col relative">{timeSlots.map((time, i) => <div key={i} className="h-[60px] flex relative -top-2 justify-end pr-2 text-sm text-primary font-medium">{time}</div>)}</div>
            <div className="flex-1 relative">
              <div className="absolute left-0 right-0 border-t-2 border-red-500 z-20" style={{ top: `${currentPosition}px` }}>
                <span className="absolute -left-10 text-xs bg-red-500 text-white px-1 rounded">{currentHour}:{String(currentMinute).padStart(2, "0")}</span>
              </div>
              {timeSlots.map((_, i) => <div key={i} className="h-[60px] border-t border-muted-foreground/20" />)}
              {filteredAppointments.map((a) => {
                const startMinutes = timeToMinutes(a.time); const offsetMinutes = startMinutes - 8 * 60; const top = (offsetMinutes / 30) * slotHeight; const height = (a.duration / 30) * slotHeight - 4; return <div key={a.id} className="absolute left-2 right-2" style={{ top: `${top}px`, height: `${height}px` }}>
                  <Link href={`/admin/clientes/${a.clientId}`}>
                    <Card className="border shadow-sm h-full hover:border-primary transition">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{a.client}</p>
                              <p className="text-sm text-primary font-medium">{a.time}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{a.service}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Remarcar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              })}
            </div>
          </div>
        </>}

        {tab === "dia" && <>
          <Card className="border shadow-sm h-full p-4">
            <h2 className="text-lg text-primary mb-2">Visão do mês de {date ? date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "Selecione um dia"}</h2>
          </Card>
          {(() => {
            const currentMonthDate = date ?? new Date(); const currentMonthNumber = currentMonthDate.getMonth(); const currentYearNumber = currentMonthDate.getFullYear(); const appointmentsInMonth = appointments.filter((a) => { const d = new Date(a.date + "T00:00:00"); return d.getMonth() === currentMonthNumber && d.getFullYear() === currentYearNumber && a.professionalId === authProfessional.id }); const groupedByDate = appointmentsInMonth.reduce((acc: any, item) => { if (!acc[item.date]) acc[item.date] = []; acc[item.date].push(item); return acc }, {}); return <div className="space-y-6">{Object.keys(groupedByDate).length === 0 ? <p className="text-center text-muted-foreground py-8">Nenhum agendamento neste mês</p> : Object.keys(groupedByDate).map((dateKey) => {
              const { day, number } = getDayInfo(dateKey); const appointmentsOfDay = groupedByDate[dateKey]; return <div key={dateKey}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase">{day}</p>
                    <p className="text-lg font-bold text-primary">{number}</p>
                  </div>
                  <div className="h-px flex-1 bg-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">{appointmentsOfDay.length} agendamento{appointmentsOfDay.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="space-y-3">{appointmentsOfDay.map((a: any) => <Link href={`/admin/clientes/${a.clientId}`} key={a.id}>
                  <Card className="border shadow-sm hover:border-primary transition">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{a.client}</p>
                            <p className="text-sm text-primary font-medium">{a.time}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{a.service}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Remarcar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </Link>)}</div>
              </div>
            })}</div>
          })()}
        </>}
      </div>

      <Link href={`/admin/agenda/ajustes`}>
        <Button className="fixed bottom-44 right-6 rounded-full w-14 h-14 shadow-lg" size="icon">
          <Cog className="w-10 h-10 text-zinc-900" />
        </Button>
      </Link>
      <Link href={`/admin/agendamento/`}>
        <Button className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg" size="icon">
          <Plus className="w-10 h-10 text-zinc-900" />
        </Button>
      </Link>
      <NavbarProfessional />
    </div>
  )
}
