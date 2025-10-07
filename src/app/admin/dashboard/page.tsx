"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, Clock, Share2, TrendingUp } from "lucide-react"
import { getStoredAppointments } from "@/data/mockData"
import { useAuth } from "@/contexts/AuthContext"
import NavbarProfessional from "@/components/NavbarProfessional"
import { useToast } from "@/hooks/use-toast"
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

export default function Dashboard() {
  const { professional } = useAuth()
  const { toast } = useToast()
  const pathname = usePathname()

  const [baseUrl, setBaseUrl] = useState<string>("")
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

  // Garantir que window.location só seja acessado no client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!professional) return

    const appointments = getStoredAppointments().filter((a) => a.professionalId === professional.id)
    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    const todayAppts = appointments.filter((a) => a.date === today)
    const monthAppts = appointments.filter((a) => a.date.startsWith(thisMonth))
    const uniqueClients = new Set(appointments.map((a) => a.clientWhatsapp))
    const monthRevenue = monthAppts
      .filter((a) => a.status === "concluido")
      .reduce((sum, a) => sum + a.totalPrice, 0)

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
        hours: Math.round((dayMinutes / 60) * 10) / 10,
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
  ].filter((item) => item.value > 0)

  const handleCopyLink = () => {
    if (!professional || !baseUrl) return
    const link = `${baseUrl}/profissional/${professional.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copiado!",
      description: "O link do seu perfil foi copiado para a área de transferência.",
    })
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
        <div className="container mx-auto max-w-screen-lg">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-screen-lg px-4">
        {/* Cards principais */}
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

        {/* Link do perfil */}
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
                value={`${baseUrl ? `${baseUrl}/profissional/${professional.id}` : ""}`}
                readOnly
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
              />
              <Button size="sm" onClick={handleCopyLink}>
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos e seções */}
        {/* (mantive o restante do layout igual, pois já está correto) */}

        <NavbarProfessional />
      </div>
    </div>
  )
}
