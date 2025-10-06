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
  clientWhatsapp: string
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
  // Studio Beleza Premium
  { id: "service-1", professionalId: "1", name: "Corte Feminino", price: 80, duration: 60, category: "Cabelo" },
  { id: "service-2", professionalId: "1", name: "Corte Masculino", price: 50, duration: 30, category: "Cabelo" },
  { id: "service-3", professionalId: "1", name: "Coloração Completa", price: 200, duration: 120, category: "Cabelo" },
  { id: "service-4", professionalId: "1", name: "Escova Progressiva", price: 300, duration: 180, category: "Cabelo" },
  { id: "service-5", professionalId: "1", name: "Hidratação", price: 60, duration: 45, category: "Tratamento" },
  // Espaço Maria Silva
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

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: "mock_current_user",
  APPOINTMENTS: "mock_appointments",
}

// Funções helper
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

    // Check if already exists
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
