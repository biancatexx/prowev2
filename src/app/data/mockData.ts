// mockData.ts
export interface MockUser {
  id: string
  email: string
  password: string
  role: "professional" | "client"
  professionalId?: string
  name?: string
  whatsapp?: string
  birthDate?: string
  instagram?: string
  avatar?: string
}

export interface MockProfessional {
  id: string
  name: string
  specialty: string
  description: string
  address: string
  phone: string
  email: string
  profileImage: string
  social_facebook?: string
  social_instagram?: string
  experience_years?: number
}

export interface MockService {
  id: string
  professionalId: string
  name: string
  price: number
  duration: number
  category: string
}

export interface MockAppointment {
  id: string
  professionalId: string
  clientName: string
  clientWhatsapp: string // Pode ser vazio!
  services: {
    id: string
    name: string
    price: number
    duration: number
  }[]
  date: string
  time: string
  totalPrice: number
  totalDuration: number
  status: string
  createdAt: string
}

// Usuários mock
export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    email: "profissional@teste.com",
    password: "123456",
    role: "professional",
    professionalId: "1",
    name: "Studio Beleza Premium",
    whatsapp: "(11) 98765-4321",
  },
  {
    id: "user-2",
    email: "maria@salao.com",
    password: "123456",
    role: "professional",
    professionalId: "2",
    name: "Maria Silva",
    whatsapp: "(11) 91234-5678",
  },
]

// Profissionais mock
export const mockProfessionals: MockProfessional[] = [
  {
    id: "1",
    name: "Studio Beleza Premium",
    specialty: "Salão de Beleza",
    description: "Especializado em cortes modernos, coloração e tratamentos capilares",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    phone: "(11) 98765-4321",
    email: "profissional@teste.com",
    profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    social_facebook: undefined,
    social_instagram: undefined,
    experience_years: undefined,
  },
  {
    id: "2",
    name: "Espaço Maria Silva",
    specialty: "Estética e Manicure",
    description: "Especializado em unhas artísticas e cuidados estéticos",
    address: "Av. Paulista, 456 - Bela Vista, São Paulo - SP",
    phone: "(11) 91234-5678",
    email: "maria@salao.com",
    profileImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    social_facebook: undefined,
    social_instagram: undefined,
    experience_years: undefined,
  },
]

// Serviços mock
export const mockServices: MockService[] = [
  // Studio Beleza Premium (ID 1)
  { id: "service-1", professionalId: "1", name: "Corte Feminino", price: 80, duration: 60, category: "Cabelo" },
  { id: "service-2", professionalId: "1", name: "Corte Masculino", price: 50, duration: 30, category: "Cabelo" },
  { id: "service-3", professionalId: "1", name: "Coloração Completa", price: 200, duration: 120, category: "Cabelo" },
  { id: "service-4", professionalId: "1", name: "Escova Progressiva", price: 300, duration: 180, category: "Cabelo" },
  { id: "service-5", professionalId: "1", name: "Hidratação", price: 60, duration: 45, category: "Tratamento" },
  // Espaço Maria Silva (ID 2)
  { id: "service-6", professionalId: "2", name: "Manicure Completa", price: 40, duration: 60, category: "Unhas" },
  { id: "service-7", professionalId: "2", name: "Pedicure Completa", price: 50, duration: 60, category: "Unhas" },
  { id: "service-8", professionalId: "2", name: "Unhas em Gel", price: 120, duration: 90, category: "Unhas" },
  {
    id: "service-9",
    professionalId: "2",
    name: "Design de Sobrancelha",
    price: 35,
    duration: 30,
    category: "Estética",
  },
  { id: "service-10", professionalId: "2", name: "Limpeza de Pele", price: 100, duration: 90, category: "Estética" },
]

// Dados de agendamento mock para o profissional "1"
const initialAppointments: MockAppointment[] = [
  {
    id: "apt-1",
    professionalId: "1",
    clientName: "Ana Clara",
    clientWhatsapp: "(11) 99111-2222",
    services: [{ id: "service-1", name: "Corte Feminino", price: 80, duration: 60 }],
    date: "2023-10-01",
    time: "10:00",
    totalPrice: 80,
    totalDuration: 60,
    status: "concluido",
    createdAt: "2023-10-01T10:00:00Z",
  },
  {
    id: "apt-2",
    professionalId: "1",
    clientName: "Bruno Lima",
    clientWhatsapp: "(11) 99333-4444",
    services: [{ id: "service-2", name: "Corte Masculino", price: 50, duration: 30 }],
    date: "2023-10-05",
    time: "14:00",
    totalPrice: 50,
    totalDuration: 30,
    status: "concluido",
    createdAt: "2023-10-05T14:00:00Z",
  },
  {
    id: "apt-3",
    professionalId: "1",
    clientName: "Ana Clara",
    clientWhatsapp: "(11) 99111-2222",
    services: [{ id: "service-5", name: "Hidratação", price: 60, duration: 45 }],
    date: "2023-11-10",
    time: "11:00",
    totalPrice: 60,
    totalDuration: 45,
    status: "concluido",
    createdAt: "2023-11-10T11:00:00Z",
  },
  {
    id: "apt-4",
    professionalId: "1",
    clientName: "Carla Souza",
    clientWhatsapp: "", // Cliente sem WhatsApp!
    services: [{ id: "service-3", name: "Coloração Completa", price: 200, duration: 120 }],
    date: "2023-12-01",
    time: "16:00",
    totalPrice: 200,
    totalDuration: 120,
    status: "agendado",
    createdAt: "2023-12-01T16:00:00Z",
  },
  // Agendamento para outro profissional (ID 2)
  {
    id: "apt-5",
    professionalId: "2",
    clientName: "David Rocha",
    clientWhatsapp: "(11) 99777-8888",
    services: [{ id: "service-6", name: "Manicure Completa", price: 40, duration: 60 }],
    date: "2023-12-05",
    time: "09:00",
    totalPrice: 40,
    totalDuration: 60,
    status: "concluido",
    createdAt: "2023-12-05T09:00:00Z",
  },
]

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: "mock_current_user",
  APPOINTMENTS: "mock_appointments",
}

// Inicializa o localStorage com dados mock se estiver vazio
if (typeof window !== "undefined") {
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Salva o primeiro profissional como logado
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockUsers[0]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    // Salva os agendamentos iniciais
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments))
  }
}

// Funções helper (mantidas)
export const getStoredAppointments = (): MockAppointment[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Erro ao ler agendamentos:", error)
    return []
  }
}

export const saveAppointment = (appointment: MockAppointment): void => {
  if (typeof window === "undefined") return

  try {
    const appointments = getStoredAppointments()
    appointments.push(appointment)
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error)
    throw error
  }
}

export const getAppointments = (): MockAppointment[] => getStoredAppointments()

export const getAppointmentsByProfessional = (professionalId: string): MockAppointment[] => {
  const appointments = getStoredAppointments()
  return appointments.filter((a) => a.professionalId === professionalId)
}

export const updateUser = (userId: string, updates: Partial<MockUser>): MockUser | null => {
  if (typeof window === "undefined") return null

  try {
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (!currentUser) return null

    const user = JSON.parse(currentUser) as MockUser
    if (user.id !== userId) return null

    const updatedUser = { ...user, ...updates }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser))
    return updatedUser
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return null
  }
}

// Favorites storage functions
export interface Favorite {
  professionalId: string
  name: string
  category: string
  rating: number
  reviews: number
  distance: string
  address: string
  priceRange: string
  image: string
  addedAt: string
}

// Client interface and helper functions
export interface Client {
  id: string
  name: string
  whatsapp: string
  email?: string
  totalAppointments: number
  lastAppointment: string
  totalSpent: number
  status: "ativo" | "inativo"
}

// Generate consistent client ID from whatsapp or a generated one
export const generateClientId = (whatsapp: string | undefined | null, clientName: string): string => {
  const cleanedWhatsapp = (whatsapp || "").replace(/\D/g, "")

  if (cleanedWhatsapp) {
    return cleanedWhatsapp
  }

  // ID é apenas o nome slug (sem contador)
  const nameSlug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return `no-whatsapp-${nameSlug}`
}

// Get client by ID (searches appointments for matching whatsapp/id logic)
export const getClientById = (professionalId: string, clientId: string): Client | null => {
  if (typeof window === "undefined") return null

  try {
    const appointments = getAppointmentsByProfessional(professionalId)

    let clientAppointments: MockAppointment[] = []

    // 1. Cliente com WhatsApp: O ID deve ser o WhatsApp limpo
    const isWhatsappId = !clientId.startsWith("no-whatsapp-")

    if (isWhatsappId) {
      clientAppointments = appointments.filter((apt) => apt.clientWhatsapp.replace(/\D/g, "") === clientId)
    } else {
      // 2. Cliente SEM WhatsApp: Busca por nome e ausência de WhatsApp

      // Em um sistema real, você usaria o ID persistido no banco.
      // No mock, vamos simplificar para: encontre o agendamento que não tem Zap
      // e cujo nome slug corresponde ao slug na URL.
      const targetNameSlug = clientId.replace("no-whatsapp-", "")

      clientAppointments = appointments.filter((apt) => {
        const aptNameSlug = apt.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        return !apt.clientWhatsapp && aptNameSlug === targetNameSlug
      })
    }

    if (clientAppointments.length === 0) {
      console.warn(
        `[MockData] Não encontrado agendamentos para o clientId: ${clientId} e profissional: ${professionalId}`,
      )
      return null
    }

    // A partir daqui, a lógica de agregação é a mesma:
    const totalSpent = clientAppointments
      .filter((apt) => apt.status === "concluido")
      .reduce((sum, apt) => sum + apt.totalPrice, 0)

    const sortedAppointments = clientAppointments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const lastAppointmentDate = sortedAppointments[0]?.date || new Date().toISOString().split("T")[0]
    const daysSinceLastAppointment = Math.floor(
      (new Date().getTime() - new Date(lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24),
    )

    return {
      id: clientId,
      name: clientAppointments[0].clientName,
      whatsapp: clientAppointments[0].clientWhatsapp,
      email: undefined,
      totalAppointments: clientAppointments.length,
      lastAppointment: lastAppointmentDate,
      totalSpent,
      status: daysSinceLastAppointment > 90 ? "inativo" : "ativo",
    }
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return null
  }
}

export const getLastClientNameByWhatsapp = (professionalId: string, whatsapp: string): string | null => {
  if (typeof window === "undefined") return null
  if (!whatsapp) return null

  try {
    const cleanWhatsapp = whatsapp.replace(/\D/g, "")
    if (!cleanWhatsapp) return null

    const appointments = getAppointmentsByProfessional(professionalId)

    // Find the most recent appointment with this WhatsApp
    const clientAppointments = appointments
      .filter((apt) => apt.clientWhatsapp.replace(/\D/g, "") === cleanWhatsapp)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (clientAppointments.length > 0) {
      return clientAppointments[0].clientName
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar nome do cliente:", error)
    return null
  }
}

export const getClientsByProfessional = (professionalId: string): Client[] => {
  if (typeof window === "undefined") return []

  try {
    const appointments = getAppointmentsByProfessional(professionalId)

    // Group appointments by client (using WhatsApp or generated ID)
    const clientMap = new Map<string, MockAppointment[]>()

    appointments.forEach((apt) => {
      const clientId = generateClientId(apt.clientWhatsapp, apt.clientName)

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, [])
      }
      clientMap.get(clientId)!.push(apt)
    })

    // Convert to Client objects
    const clients: Client[] = []

    clientMap.forEach((clientAppointments, clientId) => {
      const totalSpent = clientAppointments
        .filter((apt) => apt.status === "concluido")
        .reduce((sum, apt) => sum + apt.totalPrice, 0)

      const sortedAppointments = clientAppointments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      const lastAppointmentDate = sortedAppointments[0]?.date || new Date().toISOString().split("T")[0]
      const daysSinceLastAppointment = Math.floor(
        (new Date().getTime() - new Date(lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24),
      )

      clients.push({
        id: clientId,
        name: clientAppointments[0].clientName,
        whatsapp: clientAppointments[0].clientWhatsapp,
        email: undefined,
        totalAppointments: clientAppointments.length,
        lastAppointment: lastAppointmentDate,
        totalSpent,
        status: daysSinceLastAppointment > 90 ? "inativo" : "ativo",
      })
    })

    return clients.sort((a, b) => new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime())
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return []
  }
}

// O restante das funções é mantido...
export const getFavorites = (whatsapp: string): Favorite[] => {
  if (typeof window === "undefined") return []

  try {
    const key = `favorites_${whatsapp.replace(/\D/g, "")}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Erro ao ler favoritos:", error)
    return []
  }
}

export const addFavorite = (whatsapp: string, favorite: Favorite): void => {
  if (typeof window === "undefined") return

  try {
    const key = `favorites_${whatsapp.replace(/\D/g, "")}`
    const favorites = getFavorites(whatsapp)

    if (favorites.some((f) => f.professionalId === favorite.professionalId)) {
      return
    }

    favorites.push({ ...favorite, addedAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(favorites))
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error)
    throw error
  }
}

export const removeFavorite = (whatsapp: string, professionalId: string): void => {
  if (typeof window === "undefined") return

  try {
    const key = `favorites_${whatsapp.replace(/\D/g, "")}`
    const favorites = getFavorites(whatsapp)
    const updated = favorites.filter((f) => f.professionalId !== professionalId)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    console.error("Erro ao remover favorito:", error)
    throw error
  }
}

export const isFavorite = (whatsapp: string, professionalId: string): boolean => {
  const favorites = getFavorites(whatsapp)
  return favorites.some((f) => f.professionalId === professionalId)
}
