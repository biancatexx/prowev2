"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, Clock, Share2, TrendingUp, SquareArrowOutUpRight } from "lucide-react"
import { getStoredAppointments } from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import NavbarProfessional from "@/components/NavbarProfessional"  

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { toast } from "sonner"

export default function Dashboard() {
  const { professional } = useAuth() 
  const inputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    monthRevenue: 0,
    pendingAppointments: 0,
  })

  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; value: number }[]>([])
  const [appointmentStats, setAppointmentStats] = useState({
    agendados: 0,
    confirmados: 0,
    concluidos: 0,
    cancelados: 0,
  })
  const [workHours, setWorkHours] = useState<{ day: string; hours: number }[]>([])

  useEffect(() => {
    if (!professional) return

    const appointments = getStoredAppointments().filter((a) => a.professionalId === professional.id)
    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    const todayAppts = appointments.filter((a) => a.date === today)
    const monthAppts = appointments.filter((a) => a.date.startsWith(thisMonth))
    const uniqueClients = new Set(appointments.map((a) => a.clientWhatsapp))
    const monthRevenue = monthAppts.filter((a) => a.status === "concluido").reduce((sum, a) => sum + a.totalPrice, 0)

    setStats({
      todayAppointments: todayAppts.length,
      totalClients: uniqueClients.size,
      monthRevenue,
      pendingAppointments: appointments.filter((a) => a.status === "agendado").length,
    })

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    const weeklyData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0]
      const dayRevenue = appointments
        .filter((a) => a.date === dateStr && a.status === "concluido")
        .reduce((sum, a) => sum + a.totalPrice, 0)

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      return {
        day: dayNames[date.getDay()],
        value: dayRevenue,
      }
    })
    setWeeklyRevenue(weeklyData)

    const statusCounts = {
      agendados: appointments.filter((a) => a.status === "agendado").length,
      confirmados: appointments.filter((a) => a.status === "confirmado").length,
      concluidos: appointments.filter((a) => a.status === "concluido").length,
      cancelados: appointments.filter((a) => a.status === "cancelado").length,
    }
    setAppointmentStats(statusCounts)

    const workHoursData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0]
      const dayMinutes = appointments
        .filter((a) => a.date === dateStr && a.status === "concluido")
        .reduce((sum, a) => sum + a.totalDuration, 0)

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      return {
        day: dayNames[date.getDay()],
        hours: Math.round((dayMinutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      }
    })
    setWorkHours(workHoursData)
  }, [professional])

  const totalWeeklyRevenue = weeklyRevenue.reduce((acc, curr) => acc + curr.value, 0)

  const pieData = [
    { name: "Concluídos", value: appointmentStats.concluidos, color: "#2563eb" },
    { name: "Confirmados", value: appointmentStats.confirmados, color: "#16a34a" },
    { name: "Agendados", value: appointmentStats.agendados, color: "#facc15" },
    { name: "Cancelados", value: appointmentStats.cancelados, color: "#dc2626" },
  ].filter((item) => item.value > 0) // Only show non-zero values


  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }
const handleCopyLink = () => {
  if (inputRef.current) {
    navigator.clipboard.writeText(inputRef.current.value);
    toast.success("Link copiado para a área de transferência!");
  }
};
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        <div className="grid grid-cols-2 gap-4 mb-6 px-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mês</p>
                <p className="text-2xl font-bold">R$ {stats.monthRevenue}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="container mx-auto max-w-screen-lg px-4 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" /> Link do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`/profissional/${professional.id}`}
                  readOnly
                  ref={inputRef}
                  className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
                />
                <Button size="sm" onClick={handleCopyLink}>
                  Copiar
                </Button>
                <Link href={`/profissional/${professional.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center bg-zinc-900 justify-center px-3   rounded-lg">
                  Acessar <SquareArrowOutUpRight className="ml-2 w-4 h-4" />
                </Link>
                 
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Faturamento Semanal
              </CardTitle>
              <p className="text-2xl font-bold text-primary">R$ {totalWeeklyRevenue.toFixed(2)}</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenue} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                  <Bar dataKey="value" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum agendamento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Horas Trabalhadas
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={workHours} margin={{ top: 20, right: 20, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="day" type="category" />
                  <Tooltip formatter={(value) => `${value}h`} />
                  <Bar dataKey="hours" fill="#DECBFA" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/agenda">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-primary mb-2" />
                  <p className="font-semibold">Agenda</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/clientes">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <TrendingUp className="h-12 w-12 text-primary mb-2" />
                  <p className="font-semibold">Clientes</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Próximos Agendamentos</h2>
          <p className="text-muted-foreground text-center py-8">Nenhum agendamento próximo</p>
        </Card>
      </div>

      <NavbarProfessional />
    </div>
  )
}
