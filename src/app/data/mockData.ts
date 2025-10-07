import { ReactNode } from "react"

// --- INTERFACES ---
export interface ProfessionalAvailability {
  professionalId: string
  workingDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  workingHours: {
    start: string
    end: string
  }
  slotInterval: number
  closedDates: string[]
  customSlots?: {
    date: string
    slots: string[]
  }[]
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: "booked" | "closed" | "custom"
}

export interface User {
  id: string
  name: string
  whatsapp: string
  email?: string
  password?: string
  profileImage?: string
  birthDate?: string
  createdAt: string
  type: "client" | "professional"
}

export interface Service {
  id: string
  category: string
  name: string
  duration: number
  price: number
  description?: string
  professionalId?: string
}

export interface Professional {
  specialty: ReactNode
  description: any
  experience_years: ReactNode
  social_instagram: ReactNode
  social_facebook: ReactNode
  phone: any
  id: string
  userId: string
  name: string
  whatsapp: string
  email: string
  password: string
  profileImage?: string
  birthDate?: string
  cpf?: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  services: Service[]
  workingHours: {
    [key: string]: {
      enabled: boolean
      start: string
      end: string
      intervals?: { start: string; end: string }[]
    }
  }
  createdAt: string
  status: "active" | "inactive"
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
}

export interface Favorite {
  professionalId: string
  name: string
  category: string
  priceRange: string
  address: string
  distance: string
  image?: string
}

export interface MockAppointment {
  id: string
  professionalId: string
  professionalName: string
  clientName: string
  clientWhatsapp: string
  date: string
  time: string
  services: { id: string; name: string; duration: number; price: number }[]
  totalDuration: number
  totalPrice: number
  status: "agendado" | "confirmado" | "concluido" | "cancelado"
  createdAt: string
  paid?: boolean
}

export interface Client {
  id: string
  name: string
  whatsapp: string
  email?: string
  status: "ativo" | "inativo"
  totalAppointments: number
  totalSpent: number
  lastAppointment: string
}

// --- CONSTANTES ---
export const defaultCategories: ServiceCategory[] = [
  { id: "1", name: "Cabelo", icon: "💇‍♀️" },
  { id: "2", name: "Unha", icon: "💅" },
  { id: "3", name: "Estética", icon: "✨" },
  { id: "4", name: "Maquiagem", icon: "💄" },
  { id: "5", name: "Depilação", icon: "🪒" },
  { id: "6", name: "Massagem", icon: "💆‍♀️" },
  { id: "7", name: "Sobrancelha", icon: "👁️" },
  { id: "8", name: "Barba", icon: "🧔" },
]

const AVAILABILITY_STORAGE_KEY = "mock_professional_availability"
const USERS_STORAGE_KEY = "mock_users"
const PROFESSIONALS_STORAGE_KEY = "mock_professionals"
const FAVORITES_STORAGE_KEY = "mock_favorites"
const CATEGORIES_STORAGE_KEY = "mock_categories"
const APPOINTMENTS_STORAGE_KEY = "mock_appointments"

// --- DADOS MOCK ---
const initialMockProfessionals: Professional[] = [
  {
    id: "1",
    userId: "user-1",
    name: "Studio Beleza Premium",
    whatsapp: "11987654321",
    email: "studio@exemplo.com",
    password: "hashedpassword",
    specialty: "Multiserviços",
    description: "Studio de estética e beleza.",
    experience_years: 5,
    social_instagram: "@studiobeleza",
    social_facebook: "/studiobeleza",
    phone: "11987654321",
    address: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
    },
    services: [
      { id: "s1", category: "Cabelo", name: "Corte Feminino", duration: 60, price: 80.0, description: "Corte e lavagem." },
      { id: "s2", category: "Unha", name: "Manicure e Pedicure", duration: 90, price: 55.0, description: "Esmaltação comum." },
      { id: "s3", category: "Estética", name: "Limpeza de Pele", duration: 75, price: 120.0, description: "Limpeza profunda." },
    ],
    workingHours: {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: false, start: "09:00", end: "14:00" },
      sunday: { enabled: false, start: "00:00", end: "00:00" },
    },
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "2",
    userId: "user-2",
    name: "Barbeiro João",
    whatsapp: "11999998888",
    email: "joao@exemplo.com",
    password: "hashedpassword2",
    specialty: "Barbearia",
    description: "Especialista em cortes masculinos e barba.",
    experience_years: 10,
    social_instagram: "@barbeirojoao",
    social_facebook: "/barbeirojoao",
    phone: "11999998888",
    address: {
      street: "Rua B",
      number: "456",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "02000-000",
    },
    services: [
      { id: "s4", category: "Barba", name: "Barba Clássica", duration: 40, price: 40.0, description: "Toalha quente e finalização." },
      { id: "s5", category: "Cabelo", name: "Corte Masculino", duration: 30, price: 50.0, description: "Corte e lavagem." },
    ],
    workingHours: {
      monday: { enabled: true, start: "10:00", end: "19:00" },
      tuesday: { enabled: true, start: "10:00", end: "19:00" },
      wednesday: { enabled: true, start: "10:00", end: "19:00" },
      thursday: { enabled: true, start: "10:00", end: "19:00" },
      friday: { enabled: true, start: "10:00", end: "19:00" },
      saturday: { enabled: true, start: "10:00", end: "16:00" },
      sunday: { enabled: false, start: "00:00", end: "00:00" },
    },
    createdAt: new Date().toISOString(),
    status: "active",
  },
]

const initialMockAppointments: MockAppointment[] = [
  {
    id: "apt-1",
    professionalId: "1",
    professionalName: "Studio Beleza Premium",
    clientName: "Ana Silva",
    clientWhatsapp: "11988887777",
    date: "2025-10-15",
    time: "10:00",
    services: [{ id: "s1", name: "Corte Feminino", duration: 60, price: 80.0 }],
    totalDuration: 60,
    totalPrice: 80.0,
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
]

// --- FUNÇÕES DE ARMAZENAMENTO E MOCK ---
const initializeMocks = () => {
  if (typeof window === "undefined") return
  if (!localStorage.getItem(PROFESSIONALS_STORAGE_KEY)) {
    localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(initialMockProfessionals))
  }
  if (!localStorage.getItem(APPOINTMENTS_STORAGE_KEY)) {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(initialMockAppointments))
  }
}

// User functions
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveUser = (user: User): void => {
  if (typeof window === "undefined") return
  const users = getUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)
  if (existingIndex >= 0) users[existingIndex] = user
  else users.push(user)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export const getUserByWhatsapp = (whatsapp: string): User | null => {
  const users = getUsers()
  return users.find((u) => u.whatsapp === whatsapp) || null
}

export const getUserById = (id: string): User | null => {
  const users = getUsers()
  return users.find((u) => u.id === id) || null
}

// Professional functions
export const getProfessionals = (): Professional[] => {
  if (typeof window === "undefined") return []
  initializeMocks()
  const stored = localStorage.getItem(PROFESSIONALS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : initialMockProfessionals
}

export const saveProfessional = (professional: Professional): void => {
  if (typeof window === "undefined") return
  const professionals = getProfessionals()
  const existingIndex = professionals.findIndex((p) => p.id === professional.id)
  if (existingIndex >= 0) professionals[existingIndex] = professional
  else professionals.push(professional)
  localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(professionals))
}

export const getProfessionalById = (id: string): Professional | null => {
  const professionals = getProfessionals()
  return professionals.find((p) => p.id === id) || null
}

export const getProfessionalByEmail = (email: string): Professional | null => {
  const professionals = getProfessionals()
  return professionals.find((p) => p.email === email) || null
}

export const getServicesByProfessionalId = (professionalId: string): Service[] => {
  const professional = getProfessionalById(professionalId)
  return professional ? professional.services : []
}

// Favorites functions
export const getFavorites = (userWhatsapp: string): Favorite[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
  const allFavorites = stored ? JSON.parse(stored) : {}
  return allFavorites[userWhatsapp] || []
}

export const addFavorite = (userWhatsapp: string, favorite: Favorite): void => {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
  const allFavorites = stored ? JSON.parse(stored) : {}
  if (!allFavorites[userWhatsapp]) allFavorites[userWhatsapp] = []
  const exists = allFavorites[userWhatsapp].find((f: Favorite) => f.professionalId === favorite.professionalId)
  if (!exists) {
    allFavorites[userWhatsapp].push(favorite)
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites))
  }
}

export const removeFavorite = (userWhatsapp: string, professionalId: string): void => {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
  const allFavorites = stored ? JSON.parse(stored) : {}
  if (allFavorites[userWhatsapp]) {
    allFavorites[userWhatsapp] = allFavorites[userWhatsapp].filter((f: Favorite) => f.professionalId !== professionalId)
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites))
  }
}

export const isFavorite = (userWhatsapp: string, professionalId: string): boolean => {
  const favorites = getFavorites(userWhatsapp)
  return favorites.some((f) => f.professionalId === professionalId)
}

// Categories functions
export const getCategories = (): ServiceCategory[] => {
  if (typeof window === "undefined") return defaultCategories
  const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : defaultCategories
}

export const saveCategory = (category: ServiceCategory): void => {
  if (typeof window === "undefined") return
  const categories = getCategories()
  const existingIndex = categories.findIndex((c) => c.id === category.id)
  if (existingIndex >= 0) categories[existingIndex] = category
  else categories.push(category)
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
}

// Availability functions
export const getProfessionalAvailability = (professionalId: string): ProfessionalAvailability | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(AVAILABILITY_STORAGE_KEY)
  if (!stored) return null
  const allAvailability = JSON.parse(stored)
  return allAvailability[professionalId] || null
}

export const saveProfessionalAvailability = (availability: ProfessionalAvailability): void => {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem(AVAILABILITY_STORAGE_KEY)
  const allAvailability = stored ? JSON.parse(stored) : {}
  allAvailability[availability.professionalId] = availability
  localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(allAvailability))
}

export const getDefaultAvailability = (professionalId: string): ProfessionalAvailability => {
  const professional = getProfessionalById(professionalId)
  const workingDays: ProfessionalAvailability['workingDays'] = {
    monday: professional?.workingHours.monday.enabled ?? true,
    tuesday: professional?.workingHours.tuesday.enabled ?? true,
    wednesday: professional?.workingHours.wednesday.enabled ?? true,
    thursday: professional?.workingHours.thursday.enabled ?? true,
    friday: professional?.workingHours.friday.enabled ?? true,
    saturday: professional?.workingHours.saturday.enabled ?? false,
    sunday: professional?.workingHours.sunday.enabled ?? false,
  }
  const workingHours = {
    start: professional?.workingHours.monday.start ?? "09:00",
    end: professional?.workingHours.monday.end ?? "18:00",
  }
  return { professionalId, workingDays, workingHours, slotInterval: 30, closedDates: [], customSlots: [] }
}

const isTimeSlotBooked = (professionalId: string, date: string, time: string): boolean => {
  const appointments = getStoredAppointments()
  return appointments.some(apt => apt.professionalId === professionalId && apt.date === date && apt.time === time && apt.status !== "cancelado")
}

export const generateTimeSlots = (professionalId: string, date: Date): TimeSlot[] => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const dayName = dayNames[date.getDay()] as keyof typeof availability.workingDays
  if (availability.closedDates.includes(dateStr)) return []
  if (!availability.workingDays[dayName]) return []
  const customSlot = availability.customSlots?.find(cs => cs.date === dateStr)
  if (customSlot) return customSlot.slots.map(time => ({ time, available: !isTimeSlotBooked(professionalId,dateStr,time) }))
  const slots: TimeSlot[] = []
  const [startHour,startMinute] = availability.workingHours.start.split(":").map(Number)
  const [endHour,endMinute] = availability.workingHours.end.split(":").map(Number)
  let currentMinutes = startHour*60 + startMinute
  const endMinutes = endHour*60 + endMinute
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes/60)
    const minutes = currentMinutes % 60
    const timeStr = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`
    const now = new Date()
    const checkDate = new Date(date)
    checkDate.setHours(hours,minutes,0,0)
    if (checkDate > now || date.toDateString() !== now.toDateString()) {
      slots.push({ time: timeStr, available: !isTimeSlotBooked(professionalId,dateStr,timeStr) })
    }
    currentMinutes += availability.slotInterval
  }
  return slots
}

export const isDateAvailable = (professionalId: string, date: Date): boolean => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const dayName = dayNames[date.getDay()] as keyof typeof availability.workingDays
  if (availability.closedDates.includes(dateStr)) return false
  return availability.workingDays[dayName]
}

export const getUnavailableReason = (professionalId: string, date: Date): string => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const dayName = dayNames[date.getDay()] as keyof typeof availability.workingDays
  if (availability.closedDates.includes(dateStr)) return "Fechado neste dia"
  if (!availability.workingDays[dayName]) return "Estabelecimento fechado"
  return "Não há horários disponíveis para este dia"
}

// Appointments
export const getStoredAppointments = (): MockAppointment[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : initialMockAppointments
}

export const saveAppointment = (appointment: MockAppointment): void => {
  if (typeof window === "undefined") return
  const appointments = getStoredAppointments()
  appointments.push(appointment)
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
}

export const getAppointments = (): MockAppointment[] => getStoredAppointments()

export const getAppointmentsByProfessional = (professionalId: string): MockAppointment[] =>
  getStoredAppointments().filter(apt => apt.professionalId === professionalId)

export const getClientsByProfessional = (professionalId: string): Client[] => {
  const appointments = getAppointmentsByProfessional(professionalId)
  const clientsMap = new Map<string, Client>()
  appointments.forEach(apt => {
    const clientId = apt.clientWhatsapp || `no-whatsapp-${apt.clientName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`
    if (clientsMap.has(clientId)) {
      const client = clientsMap.get(clientId)!
      client.totalAppointments++
      if (apt.status === "concluido") client.totalSpent += apt.totalPrice
      if (new Date(apt.date) > new Date(client.lastAppointment)) client.lastAppointment = apt.date
    } else {
      clientsMap.set(clientId,{
        id: clientId,
        name: apt.clientName,
        whatsapp: apt.clientWhatsapp,
        email: undefined,
        status: "ativo",
        totalAppointments: 1,
        totalSpent: apt.status === "concluido" ? apt.totalPrice : 0,
        lastAppointment: apt.date,
      })
    }
  })
  return Array.from(clientsMap.values()).sort((a,b)=>new Date(b.lastAppointment).getTime()-new Date(a.lastAppointment).getTime())
}

export const getClientById = (professionalId:string,clientId:string): Client | null => {
  const clients = getClientsByProfessional(professionalId)
  return clients.find(c=>c.id===clientId)||null
}

// GETTERS SEGUROS
export const getMockProfessionals = (): Professional[] => getProfessionals()

export const getMockServices = () => {
  if (typeof window === "undefined") return []
  const professionals = getProfessionals()
  return professionals.flatMap(prof => prof.services.map(service => ({ ...service, professionalId: prof.id })))
}

export const getLastClientNameByWhatsapp = (whatsapp: string): string | null => {
  const appointments = getStoredAppointments()
  const cleanWhatsapp = whatsapp.replace(/\D/g,"")
  const clientAppointments = appointments.filter(apt => apt.clientWhatsapp === cleanWhatsapp)
  if (!clientAppointments.length) return null
  const sortedAppointments = clientAppointments.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
  return sortedAppointments[0].clientName
}
