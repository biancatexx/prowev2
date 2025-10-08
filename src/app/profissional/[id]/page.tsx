"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomCalendar } from "@/components/CustomCalendar"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ChevronLeft, CalendarIcon, Clock, Trash2, Instagram, Facebook, Phone, MapPin, CalendarCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  getProfessionals,
  addFavorite,
  removeFavorite,
  isFavorite,
  isDateAvailable,
  generateTimeSlots,
  getUnavailableReason,
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

  const professionals = getProfessionals()
  const professional = professionals.find((p) => p.id === id)

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Profissional não encontrado 😥</h1>
          <p className="text-muted-foreground">
            Parece que este profissional não está cadastrado ou o link está incorreto.
          </p>
        </div>
        {/* Novo Botão de Cadastro/Login de Profissional */}
        <Button
          onClick={() => router.push("/login-cadastro-profissional")} // Ajuste o caminho se necessário
          className="w-full max-w-sm"
        >
          Sou Profissional? Login/Cadastro
        </Button>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="w-full max-w-sm mt-4"
        >
          Voltar para a busca
        </Button>
      </div>
    )
  }
  const services = professional.services

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


    if (typeof window !== "undefined") {
      const selectedServicesData = services.filter((s) => selectedServices.includes(s.id))
      localStorage.setItem(
        "booking_data",
        JSON.stringify({
          professional: {
            id: professional.id,
            name: professional.name,
            address: professional.address,
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
          category: professional.specialty as string,
          priceRange: "R$ 50 - R$ 300",
          address: `${professional.address.street}, ${professional.address.number}`,
          distance: "1.2 km",
          image: professional.profileImage || "/placeholder.svg",
        }
        addFavorite(userWhatsapp, favorite)
        setIsFav(true)
        toast({
          title: "Adicionado aos favoritos",
          description: `${professional.name} foi adicionado aos seus favoritos.`,
        })
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      })
    }
  }

  const getAddress = () => {
    const addr = professional.address
    return `${addr.street}, ${addr.number}${addr.neighborhood ? `, ${addr.neighborhood}` : ""}, ${addr.city} - ${addr.state}`
  }

  const clearData = () => {
    setSelectedServices([])
    setSelectedDate(undefined)
    setSelectedTime("")
    toast({
      title: "Informações removidas",
      description: "Todos os serviços foram desmarcados.",
    })
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

  const getDateStatus = (date: Date) => {
    return isDateAvailable(id, date) ? "available" : "unavailable"
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <header className="bg-primary rounded-b-3xl pb-6 pt-8 px-4">
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
            <div className="text-center flex mb-4">
              {professional.profileImage ? (
                <img
                  src={professional.profileImage}
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 text-white flex items-center justify-center text-4xl font-bold">
                  <span>{professional.name ? professional.name.charAt(0).toUpperCase() : 'P'}</span>
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{professional.name}</h1> 
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Selecione os serviços</h3>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Dias e horários</h3>
            </div>
            <div className="bg-card rounded-2xl border p-5 mb-4" >
              <div className="flex justify-between items-center mb-2">

                <h2 className="text-lg font-semibold"> <CalendarCheck className="inline" /> Data e horário</h2>
                <hr className="border-t" />

              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div>
                  <h2 className="">Selecione o dia</h2>
                  <Card className="border flex-1">
                    <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} getDateStatus={getDateStatus} />
                  </Card>
                </div>

                <div className="flex-1"  >
                  <h2 className="">Selecione o horário</h2>
                  <Card className="border flex-1 p-3">
                    <TimeSlotPicker
                      professionalId={id}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onTimeSelect={setSelectedTime} totalDuration={0}
                    /></Card>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border mb-4 hidden">
              <Card className="border shadow-sm mb-4">
                <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} getDateStatus={getDateStatus} />
              </Card>
              <TimeSlotPicker
                professionalId={id}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                totalDuration={0}
              />
            </div>
          </TabsContent>

          {/* Sobre */}
          <TabsContent value="sobre">
            {/* Descrição */}
            {professional.description && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h3 className="font-bold text-foreground mb-3">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{professional.description}</p>
              </div>
            )}

            {/* Experiência */}
            {professional.experience_years && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h3 className="font-bold text-foreground mb-3">Experiência</h3>
                <p className="text-sm text-muted-foreground">{professional.experience_years} anos</p>
              </div>
            )}

            {/* Redes Sociais */}
            {(professional.social_instagram || professional.social_facebook) && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h3 className="font-bold text-foreground mb-3">Redes Sociais</h3>
                <div className="flex flex-col gap-3">
                  {professional.social_instagram && (
                    <a
                      href={
                        typeof professional.social_instagram === "string"
                          ? `https://instagram.com/${professional.social_instagram.replace("@", "")}`
                          : "#"
                      }

                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm"
                    >
                      <Instagram className="w-4 h-4" /> @{professional.social_instagram}
                    </a>
                  )}
                  {professional.social_facebook && (
                    <a
                      href={`https://facebook.com/${professional.social_facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm"
                    >
                      <Facebook className="w-4 h-4" /> {professional.social_facebook}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contato */}
            {professional.phone && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h3 className="font-bold text-foreground mb-3">Contato</h3>
                <a href={`tel:${professional.phone}`} className="text-sm text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {professional.phone}
                </a>
              </div>
            )}

            {/* Endereço */}
            {getAddress() && (
              <div className="bg-card rounded-2xl p-4 border border-border space-y-2 mb-4">
                <h3 className="font-bold text-foreground mb-3">Endereço</h3>
                <p className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {getAddress()}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30">
        <div className="container mx-auto max-w-screen-lg flex flex-col gap-3">
          {(selectedServices.length > 0 || selectedDate || selectedTime) && (
            <div className="flex items-center justify-between gap-2 bg-primary/10 p-3 rounded-lg border border-border">
              {/* Texto */}
              <div className="flex-1 text-sm text-foreground flex flex-col gap-1">
                {selectedServices.length > 0 && (
                  <div>
                    <p className="font-medium">
                      {selectedServices.length} serviço(s) • {totalDuration} min
                    </p>
                    <p className="text-primary font-bold">
                      Total: R$ {totalPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                {(selectedDate || selectedTime) && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span>{selectedDate.toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{selectedTime}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão Limpar */}
              <div className="flex-shrink-0">
                <Button variant="outline" onClick={clearData}>
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Botão de agendar */}
          <Button

            onClick={handleSchedule}
            className={`w-full ${selectedServices.length === 0 && !selectedDate && !selectedTime
              ? "bg-zinc-900 text-white hover:bg-zinc-700"
              : "bg-primary text-zinc-900 hover:bg-primary/90"
              }`}
          >
            {selectedServices.length === 0 && !selectedDate && !selectedTime
              ? "Agendar atendimento"
              : "Continuar agendamento"}
          </Button>

        </div>
      </div>
    </div>
  )
}
