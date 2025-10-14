"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomCalendar } from "@/components/CustomCalendar"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ChevronLeft, CalendarIcon, Clock, Trash2, Instagram, Facebook, Phone, MapPin, CalendarCheck, Clock8, CircleQuestionMark, X } from "lucide-react" // 💡 Adicionado 'X' para o tooltip
import { Card } from "@/components/ui/card"
import {
  getProfessionals,
  addFavorite,
  removeFavorite,
  isFavorite,
  isDateAvailable,
  type Favorite,
  type DayOfWeek,
  type WorkingHoursMap,
  Professional,
} from "@/data/mockData"
import { toast } from "sonner"

// ===============================================
// 💡 NOVO COMPONENTE: Tooltip para Descrição de Serviço
// ===============================================

interface ServiceDescriptionTooltipProps {
  description: string;
}

const ServiceDescriptionTooltip = ({ description }: ServiceDescriptionTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o tooltip se o usuário clicar fora (útil para mobile/overlay)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Verifica se o clique não foi no botão de abrir/fechar e nem dentro do conteúdo do tooltip
      if (
        isOpen &&
        event.target instanceof Element &&
        !event.target.closest('[data-tooltip-container]') &&
        !event.target.closest('[data-tooltip-trigger]')
      ) {
        setIsOpen(false);
      }
    };

    // Adicionado um pequeno delay para evitar fechar imediatamente após abrir
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);


    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block align-top ml-1" data-tooltip-container>
      {/* Gatilho (Trigger) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // Impede o toggle do checkbox ao clicar no botão
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="rounded-full hover:bg-zinc-200 w-5 h-5 dark:hover:bg-zinc-800 transition-colors text-center flex justify-center items-center"
        aria-expanded={isOpen}
        aria-label="Ver descrição do serviço"
        data-tooltip-trigger
      >
        <CircleQuestionMark className=" w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
      </button>

      {/* Conteúdo do Tooltip */}
      {isOpen && (
        // Overlay (Para mobile/Melhor acessibilidade)
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center p-4 sm:absolute sm:inset-auto sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-sm sm:h-auto sm:bg-transparent"
          onClick={() => setIsOpen(false)} // Fecha ao clicar no overlay
        >
          <div
            className="bg-popover text-popover-foreground p-6 rounded-xl shadow-2xl border border-border w-full max-w-sm sm:w-80 relative"
            onClick={(e) => e.stopPropagation()} // Impede que o clique no conteúdo feche o tooltip
            role="tooltip"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-accent"
              aria-label="Fechar descrição"
            >
              <X className="w-4 h-4" />
            </button>
            <h5 className="font-bold mb-2 text-primary">Descrição do Serviço</h5>
            <p className="text-sm">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};


// ===============================================
// 💡 NOVO COMPONENTE/FUNÇÃO PARA HORÁRIOS GERAIS
// ===============================================

const WorkingHoursCard = ({ workingHours }: { workingHours: WorkingHoursMap }) => {
  // Mapeamento para nomes de dias em português
  const dayNamesPt: { [key in DayOfWeek]: string } = {
    sunday: 'Domingo',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
  };

  // Obter o índice do dia de hoje (0=Dom, 1=Seg, ..., 6=Sáb)
  const todayIndex = new Date().getDay();

  // Ordem dos dias para exibição (Começa no Domingo para mapear 0-6)
  const dayKeys: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  return (
    <div className="bg-card rounded-2xl p-4 border border-border mb-4">

      <div className="space-y-2 text-sm">
        {dayKeys.map((day, index) => {
          const isToday = index === todayIndex;
          const hours = workingHours[day];

          return (
            <div
              key={day}
              className={`flex justify-between items-center ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              <span className="font-medium capitalize">
                {dayNamesPt[day]} {isToday && '(Hoje)'}
              </span>
              <span>
                {hours?.enabled ? `${hours.start} às ${hours.end}` : "Fechado"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  const getPriceRange = (prof: Professional) => {
    if (!prof.services || prof.services.length === 0) return "Consultar preços";
    const prices = prof.services.map((s: any) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `R$ ${min.toFixed(0)} - R$ ${max.toFixed(0)}`;
  };

 
// ===============================================
// ⚙️ COMPONENTE PRINCIPAL
// ===============================================

export default function ProfessionalDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
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
  // Adicionando uma variável para checagem do tipo de operação
  const isQueueOperation = professional.operationType === 'fila'

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
          // Não envia data e hora se for fila
          selectedDate: isQueueOperation ? undefined : selectedDate?.toISOString(),
          selectedTime: isQueueOperation ? undefined : selectedTime,
          totalPrice,
          totalDuration,
        }),
      )
    }

    // Se for fila, talvez o fluxo de agendamento precise ser diferente ou o botão apenas confirma os serviços.
    // Por simplicidade, mantemos o fluxo, mas sem a necessidade de data/hora no agendamento final.
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
      toast.error("Por favor, cadastre seu WhatsApp no perfil para adicionar favoritos.")

      return
    }

    try {
      if (isFav) {
        removeFavorite(userWhatsapp, id)
        setIsFav(false)
        toast.success("Removido dos favoritos")
      } else {
        const favorite: Favorite = {
        professionalId: professional.id,
        name: professional.name,
        services: (professional.services ?? []).map((s) => ({
          id: s.id,
          name: (s as any).name ?? s.category ?? "Serviço",
          category: s.category,
          price: s.price,
          duration: s.duration,
          professionalId: professional.id,
        })),
        category: professional.specialty as string,
        priceRange: getPriceRange(professional),
        address: `${professional.address.street}, ${professional.address.number || ''}`,
        distance: '',
        image: professional.profileImage || "/placeholder.svg",
      };
        addFavorite(userWhatsapp, favorite)
        setIsFav(true)
        toast.success(`${professional.name} foi adicionado aos seus favoritos.`)
      }
    } catch {
      toast.error("Não foi possível atualizar os favoritos.")
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
    toast.success("Informações removidas")
  }

  // Função auxiliar para obter o horário de funcionamento de hoje
  const getTodayWorkingHours = () => {
    const today = new Date()
    const dayIndex = today.getDay()
    // Mapeamento de JS getDay() (0=Dom, 6=Sáb) para DayOfWeek (0=Dom, 6=Sáb)
    const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDayKey = dayMap[dayIndex]

    const hours = professional.workingHours[currentDayKey]

    if (hours && hours.enabled) {
      return `${hours.start} às ${hours.end}`
    }
    return "Fechado hoje"
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
  // 📍 NOVO COMPONENTE PARA O AVATAR E FALLBACK
  const ProfessionalAvatar = ({ professional }: { professional: Professional }) => {
    const [imgError, setImgError] = useState(!professional.profileImage);

    useEffect(() => {
      // Resetar o estado de erro quando o professional mudar ou a imagem for carregada/atualizada
      setImgError(!professional.profileImage);
    }, [professional.profileImage]);

    if (imgError) {
      // FALLBACK: Exibe a inicial do nome
      return (
        <div className="w-24 h-24 mx-auto rounded-full border-primary bg-zinc-900 text-white flex items-center justify-center text-xl font-bold border-2 fallback-avatar">
          <span>{professional.name ? professional.name.charAt(0).toUpperCase() : 'P'}</span>
        </div>
      );
    }

    // TENTA CARREGAR A IMAGEM
    return (
      <img
        src={professional.profileImage as string}
        alt={professional.name}
        className="w-full h-full object-cover border-2 rounded-full border-primary"
        // Se a imagem falhar ao carregar (e.g., URL inválida/quebrada), exibe o fallback
        onError={() => setImgError(true)}
      />
    );
  };


  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <header className="bg-primary rounded-b-3xl pb-6 pt-8 px-4">
        <div className="container mx-auto max-w-screen-lg px-4">
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
              {/* AVATAR COM LINK */}
              <div className="w-24 h-24 mx-auto rounded-full object-cover">
                <ProfessionalAvatar professional={professional} />
              </div>
 
            </div>
            <h1 className="text-xl font-bold mb-1">{professional.name}</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto max-w-screen-lg px-4 -mt-4 relative z-10">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-card border border-border rounded-xl p-1 mb-6">
            <TabsTrigger value="servicos" className="flex-1 rounded-lg p-2">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex-1 rounded-lg p-2">
              Agenda
            </TabsTrigger>
            <TabsTrigger value="sobre" className="flex-1 rounded-lg p-2">
              Sobre
            </TabsTrigger>
          </TabsList>

          {/* Serviços */}
          <TabsContent value="servicos">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Selecione os serviços</h2>
            </div>
            <div className="space-y-6">
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="font-bold text-foreground mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryServices.map((service) => (
                      <label
                        key={service.id}
                        className="bg-card rounded-xl p-4 border border-border flex items-start gap-3 cursor-pointer hover:bg-primary/30"
                      >
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1 ">

                            <h4 className="flex text-foreground items-start">
                              {service.name}
                              {service.description ? (
                                <ServiceDescriptionTooltip description={service.description} />
                              ) : (
                                ""
                              )}
                            </h4>

                            <span className="text-xs text-muted-foreground ml-1">{service.duration}min</span>
                          </div>
                          {/* CORREÇÃO APLICADA AQUI: Formatação do preço individual */}
                          <span className="text-sm font-semibold text-green-600">
                            {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
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
              <h2 className="font-bold text-foreground">Dias e horários</h2>
            </div>
            <div className="bg-card rounded-2xl border p-5 mb-4" >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {isQueueOperation ? <Clock8 className="inline mr-2 w-5 h-5" /> : <CalendarCheck className="inline mr-2 w-5 h-5" />}
                  {isQueueOperation ? "Atendimento por Fila" : "Data e horário"}
                </h2>
              </div>

              {isQueueOperation ? (
                // 1. MENSAGEM PARA MODO FILA
                <div className="flex flex-col lg:flex-row gap-2 grid-col-4">
                  <div className="col-2">
                    <Card className="border flex-1">
                      <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} getDateStatus={getDateStatus} />
                    </Card>
                  </div>
                  <div className="col-1">
                    <div className=" ">
                      <p className="text-lg font-semibold text-primary">Atendimento por Ordem de Chegada (Fila)</p>
                      <p className="text-muted-foreground text-sm">
                        Este profissional não utiliza agendamento. <br />Você será atendido na ordem de chegada durante o horário de funcionamento.
                      </p>
                      <div className="border-b last:border-b-0 py-2" >
                        {professional.workingHours && (
                          <WorkingHoursCard workingHours={professional.workingHours} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              ) : (
                // 2. RENDERIZAÇÃO PADRÃO PARA MODO AGENDAMENTO
                <div className="pl-0">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="">
                      <h2 className="mb-2">Selecione o dia</h2>
                      <Card className="border flex-1">
                        <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} getDateStatus={getDateStatus} />
                      </Card>
                    </div>
                    <div className="flex-1"  >
                      <h2 className="mb-2">Selecione o horário</h2>
                      <Card className="border flex-1 p-3">
                        <TimeSlotPicker
                          professionalId={id}
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onTimeSelect={setSelectedTime} totalDuration={totalDuration} // Use totalDuration aqui!
                        /></Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          {/* Sobre */}
          <TabsContent value="sobre">
            {/* Descrição */}
            {professional.description && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h2 className="font-bold text-foreground mb-3">Descrição</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{professional.description}</p>
              </div>
            )}
            {/* Experiência */}
            {/* {professional.experience_years && (
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <h3 className="font-bold text-foreground mb-3">Experiência</h3>
                <p className="text-sm text-muted-foreground">{professional.experience_years} anos</p>
              </div>
            )} */}
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
                      className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm bg-primary/20"
                    >
                      <Instagram className="w-4 h-4" /> {professional.social_instagram}
                    </a>
                  )}
                  {professional.social_facebook && (
                    <a
                      href={`https://facebook.com/${professional.social_facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm bg-primary/20">
                      <Facebook className="w-4 h-4" />{professional.social_facebook}
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
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {getAddress()}
                </p>
                <div className="w-full h-48 rounded-lg overflow-hidden border mt-2">
                  {/* ATENÇÃO: A URL DO IFRAME FOI CORRIGIDA DE FORMA SEGURA */}
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=$${encodeURIComponent(getAddress())}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="text-end">
                  <a
                    href={`https://maps.google.com/maps?q=$${encodeURIComponent(getAddress())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-sm font-semibold hover:underline mt-2 inline-block"
                  >
                    Abrir no Google Maps
                  </a>
                </div>

              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30 rounded-t-3xl">
        <div className="container mx-auto max-w-screen-lg px-4">
          {(selectedServices.length > 0 || (!isQueueOperation && (selectedDate || selectedTime))) && (
            <div className="flex items-center justify-between gap-2 bg-primary/10 p-3 rounded-lg border border-border mb-2">
              {/* Texto */}
              <div className="flex-1 text-sm text-foreground flex flex-col gap-1">
                {selectedServices.length > 0 && (
                  <div>
                    <p className="font-medium">
                      {selectedServices.length} serviço(s) • {totalDuration} min
                    </p>
                    {/* CORREÇÃO APLICADA AQUI: Formatação do preço total */}
                    <p className="text-primary font-bold">
                      Total: {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                )}
                {!isQueueOperation && (selectedDate || selectedTime) && (
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
          <div className="text-center">
            <Button
              onClick={handleSchedule}
              // A condição de desabilitar/mudar cor é simplificada se for fila (só precisa de serviços)

              className={`w-full ${selectedServices.length === 0 && (!selectedDate || !selectedTime) && !isQueueOperation ? "bg-zinc-900 text-white hover:bg-zinc-700"
                : "bg-primary text-zinc-900 hover:bg-primary/90"
                }`}            >
              {isQueueOperation
                ? (selectedServices.length === 0 ? "Selecionar serviços para a fila" : "Entrar na Fila")
                : (selectedServices.length === 0 && (!selectedDate || !selectedTime)
                  ? "Agendar atendimento"
                  : "Continuar agendamento")}
            </Button>

          </div>


        </div>
      </div>
    </div>
  )
}