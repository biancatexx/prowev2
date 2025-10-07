"use client"

import { useState, useEffect } from "react"
import { Cog, List, MoreVertical, Plus, Rows3, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CustomCalendar } from "@/components/CustomCalendar"
import NavbarProfessional from "@/components/NavbarProfessional"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getStoredAppointments } from "@/data/mockData"

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<"hora" | "dia">("hora")
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    loadAppointments()
  }, [])

  const [professionalId, setProfessionalId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("mock_current_user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        setProfessionalId(user.professionalId)
      }
    }
  }, [])

  const loadAppointments = () => {
    const stored = getStoredAppointments()
    const formatted = stored.map((apt) => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      duration: apt.totalDuration,
      client: apt.clientName,
      service: apt.services.map((s) => s.name).join(", "),
      status: apt.status,
    }))
    setAppointments(formatted)
  }

  const appointmentDates = appointments.map((apt) => apt.date)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]
  const filteredAppointments = date ? appointments.filter((a) => a.date === formatDate(date)) : appointments

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let h = 8; h <= 20; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`)
      slots.push(`${String(h).padStart(2, "0")}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  const slotHeight = 60

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentPosition = ((currentHour - 8) * 2 + currentMinute / 30) * slotHeight

  const getDayInfo = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const weekdays = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]
    return {
      day: weekdays[d.getDay()],
      number: String(d.getDate()).padStart(2, "0"),
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent sticky top-0 z-50">
        <div className="container mx-auto max-w-screen-lg px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-foreground">Agenda</h1>
            <Link href="/admin/configuracoes-agenda">
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Calendário */}
      <div className="container mx-auto max-w-screen-lg px-4 py-4">

        {/* Buttons das tabs */}
        <div className="flex justify-center gap-2">
          <div className="inline-flex h-10 items-center justify-center text-muted-foreground w-full bg-card border border-border rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("hora")}
              className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 rounded-lg 
                 ${tab === "dia" ? "bg-white text-primary" : "bg-muted text-muted-foreground"}`}
            >
              <List className="mr-2 w-3 h-3" /> Visão diária
            </button>
            <button
              onClick={() => setTab("dia")}
              className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-primary data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 rounded-lg
                 ${tab === "hora" ? "bg-white text-primary" : "bg-muted text-muted-foreground"}`}
            >
              <Rows3 className="mr-2 w-3 h-3" /> Visão mensal
            </button>
          </div>

        </div>

        {/* Conteúdo das tabs */}
        {tab === "hora" && (
          <>

            <Card className="border shadow-sm h-full flex justify-center items-center p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="">

                  <CustomCalendar
                    selected={date}
                    onSelect={setDate}
                    appointmentDates={appointmentDates}
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="flex-1 text-center p-4">
                <div>
                  <h2 className="text-lg text-primary font-bold mb-2">

                    {date
                      ? date.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      : "Selecione um dia"}
                  </h2>
                  <p className="text-lg text-zinc-900">
                    {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? "s" : ""}
                  </p>
                </div>

              </div>

            </Card>
            <h2 className="text-lg font-bold text-primary mb-2">
              {date ? (
                <p> Dia
                  {`${date.toLocaleDateString("pt-BR", { day: "2-digit", })}`}


                </p>
              ) : (
                "Selecione um dia"
              )}
            </h2>

            <div className="relative flex">
              <div className="w-14 flex flex-col relative">
                {timeSlots.map((time, i) => (
                  <div
                    key={i}
                    className="h-[60px] flex relative -top-2 justify-end pr-2 text-sm text-primary font-medium"
                  >
                    {time}
                  </div>
                ))}
              </div>
              <div className="flex-1 relative">
                <div
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                  style={{ top: `${currentPosition}px` }}
                >
                  <span className="absolute -left-10 text-xs bg-red-500 text-white px-1 rounded">
                    {currentHour}:{String(currentMinute).padStart(2, "0")}
                  </span>
                </div>

                {timeSlots.map((_, i) => (
                  <div key={i} className="h-[60px] border-t border-muted-foreground/20" />
                ))}

                {filteredAppointments.map((a) => {
                  const startMinutes = timeToMinutes(a.time)
                  const offsetMinutes = startMinutes - 8 * 60
                  const top = (offsetMinutes / 30) * slotHeight
                  const height = (a.duration / 30) * slotHeight - 4

                  return (
                    <div
                      key={a.id}
                      className="absolute left-2 right-2"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <Link href={`/admin/clientes/${a.id}`}>
                        <Card className="border shadow-sm h-full">
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
                  )
                })}
              </div>
            </div>
          </>
        )}
        {tab === "dia" && (
          <>
            <Card className="border shadow-sm h-full p-4">
              <h2 className="text-lg text-primary mb-2"> Visão do mês de
                {date
                  ? date.toLocaleDateString("pt-BR", {

                    month: "long",
                    year: "numeric",
                  })
                  : "Selecione um dia"}
              </h2>
            </Card>
            {(() => {
              const currentMonthDate = date ?? new Date()
              const currentMonthNumber = currentMonthDate.getMonth()
              const currentYearNumber = currentMonthDate.getFullYear()

              const appointmentsInMonth = appointments.filter((a) => {
                const d = new Date(a.date + "T00:00:00")
                return d.getMonth() === currentMonthNumber && d.getFullYear() === currentYearNumber
              })

              const groupedByDate = appointmentsInMonth.reduce((acc: any, item) => {
                if (!acc[item.date]) acc[item.date] = []
                acc[item.date].push(item)
                return acc
              }, {})

              return (
                <div className="space-y-6">
                  {Object.keys(groupedByDate).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum agendamento neste mês</p>
                  ) : (
                    Object.keys(groupedByDate).map((dateKey) => {
                      const { day, number } = getDayInfo(dateKey)
                      const appointmentsOfDay = groupedByDate[dateKey]

                      return (
                        <div key={dateKey}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-center">
                              <p className="text-sm font-medium text-muted-foreground uppercase">{day}</p>
                              <p className="text-lg font-bold text-primary">{number}</p>
                            </div>
                            <div className="h-px flex-1 bg-muted-foreground/20" />
                            <p className="text-xs text-muted-foreground">
                              {appointmentsOfDay.length} agendamento{appointmentsOfDay.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {appointmentsOfDay.map((a: any) => (
                              <Card key={a.id} className="border shadow-sm">
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
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })()}

          </>

        )}
      </div>



      {/* Botão flutuante */}
      <Link href={`/admin/agenda/ajustes`}>
        <Button className="fixed bottom-44 right-6 rounded-full w-14 h-14 shadow-lg" size="icon">
          <Cog className="w-10 h-10 text-zinc-900" />
        </Button>
      </Link>

      <Link href={`/admin/agendamento/`}>
        <Button className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg zinc-900" size="icon">
          <Plus className="w-10 h-10 text-zinc-900" />
        </Button>
      </Link>

      <NavbarProfessional />
    </div>
  )
}
