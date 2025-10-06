"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ChevronLeft, CalendarIcon, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  mockProfessionals,
  mockServices,
  addFavorite,
  removeFavorite,
  isFavorite,
  type Favorite,
} from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"

export default function ProfessionalDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { toast } = useToast()

  const [isFav, setIsFav] = useState(false)
  const [userWhatsapp, setUserWhatsapp] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [activeTab, setActiveTab] = useState("servicos")
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const professional = mockProfessionals.find((p) => p.id === id)
  const services = mockServices.filter((s) => s.professionalId === id)

  const availableHours = ["09:00", "09:30", "10:00", "11:00", "13:00", "14:30", "15:00", "16:00"]

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const totalPrice = services
    .filter((service) => selectedServices.includes(service.id))
    .reduce((sum, service) => sum + service.price, 0)

  const totalDuration = services
    .filter((service) => selectedServices.includes(service.id))
    .reduce((sum, service) => sum + service.duration, 0)

  const handleSchedule = () => {
    if (selectedServices.length === 0) {
      alert("Selecione pelo menos um serviço para agendar.")
      return
    }

    // Salvar dados no localStorage para usar na página de agendamento
    if (typeof window !== "undefined") {
      const selectedServicesData = services.filter((s) => selectedServices.includes(s.id))
      localStorage.setItem(
        "booking_data",
        JSON.stringify({
          professional: {
            id: professional?.id,
            name: professional?.name,
            address: professional?.address,
          },
          selectedServices: selectedServicesData,
          selectedDate: selectedDate?.toISOString(),
          selectedTime,
          totalPrice,
          totalDuration,
        }),
      )
    }

    router.push(`/agendamento/${id}`)
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("mock_current_user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const whatsapp = user.whatsapp || ""
        setUserWhatsapp(whatsapp)

        if (whatsapp && id) {
          setIsFav(isFavorite(whatsapp, id))
        }
      }
    }
  }, [id])

  const handleFavoriteToggle = () => {
    if (!userWhatsapp) {
      toast({
        title: "WhatsApp necessário",
        description: "Por favor, cadastre seu WhatsApp no perfil para adicionar favoritos.",
        variant: "destructive",
      })
      return
    }

    if (!professional) return

    try {
      if (isFav) {
        removeFavorite(userWhatsapp, id)
        setIsFav(false)
        toast({
          title: "Removido dos favoritos",
          description: `${professional.name} foi removido dos seus favoritos.`,
        })
      } else {
        const favorite: Favorite = {
          professionalId: id,
          name: professional.name,
          category: professional.specialty,
          rating: 4.8,
          reviews: 127,
          distance: "1.2 km",
          address: professional.address,
          priceRange: "R$ 50 - R$ 300",
          image: professional.profileImage || "/placeholder.svg",
          addedAt: new Date().toISOString(),
        }
        addFavorite(userWhatsapp, favorite)
        setIsFav(true)
        toast({
          title: "Adicionado aos favoritos",
          description: `${professional.name} foi adicionado aos seus favoritos.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      })
    }
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Profissional não encontrado</p>
      </div>
    )
  }

  // Agrupar serviços por categoria
  const groupedServices = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) acc[service.category] = []
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, typeof services>,
  )

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/40 via-primary/20 to-accent/10 rounded-b-3xl pb-6 pt-8 px-4">
        <div className="container mx-auto max-w-screen-lg">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md"
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <img
              src={professional.profileImage || "/placeholder.svg"}
              alt={professional.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-card shadow-lg mb-3"
            />
            <h1 className="text-xl font-bold mb-1">{professional.name}</h1>
            <p className="text-sm text-muted-foreground">{professional.specialty}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto max-w-screen-lg px-4 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-card border border-border rounded-xl p-1 mb-6">
            <TabsTrigger value="servicos" className="flex-1 rounded-lg">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex-1 rounded-lg">
              Agenda
            </TabsTrigger>
            <TabsTrigger value="sobre" className="flex-1 rounded-lg">
              Sobre
            </TabsTrigger>
          </TabsList>

          {/* Serviços */}
          <TabsContent value="servicos">
            <div className="space-y-6">
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="font-bold text-foreground mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryServices.map((service) => (
                      <label
                        key={service.id}
                        className="bg-card rounded-xl p-4 border border-border flex items-start gap-3 cursor-pointer hover:bg-accent/50"
                      >
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-foreground">{service.name}</h4>
                            <span className="text-xs text-muted-foreground">{service.duration}min</span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">R$ {service.price.toFixed(2)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Agenda */}
          <TabsContent value="agenda">
            <h3 className="font-bold text-foreground mb-4">Dias e horários</h3>
            <div className="bg-card rounded-2xl p-4 border border-border mb-4">
              <Card className="border shadow-sm h-full flex justify-center mb-4">
                <Calendar selected={selectedDate} onSelect={setSelectedDate} />
              </Card>
              <div className="grid grid-cols-4 gap-2">
                {availableHours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedTime(hour)}
                    className={`py-3 px-2 rounded-xl border-2 font-medium text-sm ${
                      selectedTime === hour
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Sobre */}
          <TabsContent value="sobre">
            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              <div>
                <h3 className="font-bold text-foreground mb-2">Sobre o negócio</h3>
                <p className="text-muted-foreground">{professional.description}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Endereço</h3>
                <p className="text-muted-foreground">{professional.address}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Contato</h3>
                <p className="text-muted-foreground">{professional.phone}</p>
                <p className="text-muted-foreground">{professional.email}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30">
        <div className="container mx-auto max-w-screen-lg flex flex-col gap-3">
          {(selectedServices.length > 0 || selectedDate || selectedTime) && (
            <div className="text-sm text-foreground bg-accent/40 p-3 rounded-lg border border-border flex flex-col gap-1">
              {selectedServices.length > 0 && (
                <div>
                  <p className="font-medium">
                    {selectedServices.length} serviço(s) • {totalDuration} min
                  </p>
                  <p className="text-primary font-bold">Total: R$ {totalPrice.toFixed(2)}</p>
                </div>
              )}
              {(selectedDate || selectedTime) && (
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span>{selectedDate.toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{selectedTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Button size="lg" onClick={handleSchedule} className="w-full">
            Agendar atendimento
          </Button>
        </div>
      </div>
    </div>
  )
}
