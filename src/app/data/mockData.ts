// ================================================
//  📌 INTERFACES E TIPOS
// ================================================

// --- TIPOS BASE ---
export type UserType = "client" | "professional"
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type AppointmentStatus = "agendado" | "confirmado" | "concluido" | "cancelado"
export type ProfessionalStatus = "active" | "inactive"

// --- LOCALIZAÇÃO ---
export interface Address {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

// --- SERVIÇOS E CATEGORIAS ---
export interface ServiceCategory {
  id: string
  name: string
  icon: string
}

export interface Service {
  id: string
  category: string // Nome da categoria
  name: string
  duration: number // Duração em minutos
  price: number
  description?: string
  professionalId?: string // Adicionado para uso em listas globais
}

// --- USUÁRIOS E CLIENTES ---
export interface User {
  id: string
  name: string
  whatsapp: string
  email?: string
  password?: string
  profileImage?: string
  birthDate?: string
  createdAt: string
  type: UserType
}

export interface Client {
  id: string
  name: string
  whatsapp: string
  email?: string
  birthDate?: string
  status: "ativo" | "inativo"
  totalAppointments: number
  totalSpent: number
  lastAppointment: string
}

// --- PROFISSIONAIS ---
export interface WorkingInterval {
  start: string
  end: string
}

export interface WorkingHour {
  enabled: boolean
  start: string
  end: string
  intervals?: WorkingInterval[]
}

export type WorkingHoursMap = {
  [key in DayOfWeek]: WorkingHour
}

export interface Professional {
  id: string
  userId: string
  name: string
  whatsapp: string
  email: string
  password?: string
  profileImage?: string
  birthDate?: string
  cpf?: string
  createdAt: string
  status: ProfessionalStatus
  specialty: string
  description: string
  experience_years: number
  social_instagram?: string
  social_facebook?: string
  phone: string
  address: Address
  services: Service[]
  workingHours: WorkingHoursMap
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

// --- DISPONIBILIDADE E AGENDAMENTOS ---
export interface ProfessionalAvailability {
  professionalId: string
  workingDays: {
    [key in DayOfWeek]: boolean
  }
  workingHours: WorkingInterval
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

export interface MockAppointment {
  id: string
  professionalId: string
  professionalName: string
  clientId: string
  clientName: string
  clientWhatsapp: string
  date: string
  time: string
  services: { id: string; name: string; duration: number; price: number }[]
  totalDuration: number
  totalPrice: number
  status: AppointmentStatus
  createdAt: string
  paid?: boolean
}

// ================================================
//  ⚙️ CONSTANTES E DADOS MOCK
// ================================================
const STORAGE_KEYS = {
  AVAILABILITY: "mock_professional_availability",
  USERS: "mock_users",
  PROFESSIONALS: "mock_professionals",
  FAVORITES: "mock_favorites",
  CATEGORIES: "mock_categories",
  APPOINTMENTS: "mock_appointments",
  CLIENTS: "mock_clients",
}

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

// --- MOCK USERS ---
const initialMockUsers: User[] = [
  {
    id: "client-1",
    name: "Bianca Teixeira da Silva",
    whatsapp: "85987412626",
    email: "bianca@email.com",
    birthDate: "1990-05-12",
    createdAt: new Date().toISOString(),
    type: "client",
  },
  {
    id: "user-1",
    name: "Studio Beleza Premium",
    whatsapp: "11987654321",
    email: "studio@exemplo.com",
    createdAt: new Date().toISOString(),
    type: "professional",
  },
]

// --- MOCK PROFESSIONALS ---
const initialMockProfessionals: Professional[] = [
  {
    id: "1",
    userId: "user-1",
    name: "Studio Beleza Premium",
    whatsapp: "11987654321",
    email: "studio@exemplo.com",
    password: "123456",
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
      { id: "s1", category: "Cabelo", name: "Corte Feminino", duration: 60, price: 80.0 },
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
]

// --- MOCK APPOINTMENTS ---
const initialMockAppointments: MockAppointment[] = [
  {
    id: "apt-1",
    professionalId: "1",
    professionalName: "Studio Beleza Premium",
    clientId: "client-1",
    clientName: "Bianca Teixeira da Silva",
    clientWhatsapp: "85987412626",
    date: "2025-10-15",
    time: "10:00",
    services: [{ id: "s1", name: "Corte Feminino", duration: 60, price: 80 }],
    totalDuration: 60,
    totalPrice: 80,
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
]
// ================================================
//  🛠️ FUNÇÕES DE ARMAZENAMENTO (UTILS)
// ================================================

/**
 * Carrega dados do localStorage de forma segura.
 */
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch (error) {
    console.error(`Error loading from storage key "${key}":`, error)
    return fallback
  }
}

/**
 * Salva dados no localStorage de forma segura.
 */
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to storage key "${key}":`, error)
  }
}

/**
 * Garante que os mocks iniciais estejam no localStorage.
 */
export const initializeMocks = (): void => {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, initialMockUsers)
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFESSIONALS)) {
    saveToStorage(STORAGE_KEYS.PROFESSIONALS, initialMockProfessionals)
  }

  // Inicializa agendamentos garantindo que os clientes existam
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    const prepared = initialMockAppointments.map((apt) => {
      const clientId = getUserByWhatsapp(apt.clientWhatsapp)?.id
        || ensureClientExists(apt.clientName, apt.clientWhatsapp)
      return { ...apt, clientId }
    })
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, prepared)
  }
}

const cleanWhatsappNumber = (whatsapp: string): string => whatsapp.replace(/\D/g, "")

// ================================================
//  👤 FUNÇÕES DE USUÁRIOS E CLIENTES
// ================================================

export const getUsers = (): User[] => {
  return loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialMockUsers)
}

export const saveUser = (user: User): void => {
  const users = getUsers() // Usa a função getUsers que carrega do storage
  const existingIndex = users.findIndex((u) => u.id === user.id)
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  saveToStorage(STORAGE_KEYS.USERS, users)
}

export const getUserByWhatsapp = (whatsapp: string): User | null => {
  const users = getUsers()
  const clean = cleanWhatsappNumber(whatsapp)
  return users.find((u) => cleanWhatsappNumber(u.whatsapp) === clean) || null
}

export const getUserById = (id: string): User | null => {
  const users = getUsers()
  return users.find((u) => u.id === id) || null
}

/**
 * Garante que um cliente exista na lista de usuários (ou o cria).
 * @returns O ID do cliente.
 */
export const ensureClientExists = (
  clientName: string,
  whatsapp?: string,
  email?: string,
  birthDate?: string
): string => {
  if (typeof window === "undefined") return `client-${Date.now()}`

  const users = getUsers()
  const cleanWhatsapp = whatsapp ? cleanWhatsappNumber(whatsapp) : ""

  if (cleanWhatsapp) {
    const existing = users.find(
      (u) => u.type === "client" && cleanWhatsappNumber(u.whatsapp) === cleanWhatsapp
    )
    if (existing) {
      let updated = false
      // Atualiza os dados do cliente existente se as informações forem mais recentes
      if (clientName && existing.name !== clientName) {
        existing.name = clientName
        updated = true
      }
      if (email && existing.email !== email) {
        existing.email = email
        updated = true
      }
      if (birthDate && existing.birthDate !== birthDate) {
        existing.birthDate = birthDate
        updated = true
      }
      if (updated) saveUser(existing)
      return existing.id
    }
  }

  // Se não encontrou por whatsapp, procura por nome (lógica menos confiável, mas mantida)
  const existingByName = users.find(
    (u) => u.type === "client" && u.name === clientName && (!whatsapp || !u.whatsapp)
  )
  if (existingByName) {
    if (cleanWhatsapp && whatsapp && !existingByName.whatsapp) {
      existingByName.whatsapp = whatsapp
      saveUser(existingByName)
    }
    return existingByName.id
  }

  // Cria novo cliente
  const newId = `client-${Date.now()}`
  const newClient: User = {
    id: newId,
    name: clientName || "Cliente sem nome",
    whatsapp: whatsapp || "",
    email,
    birthDate,
    createdAt: new Date().toISOString(),
    type: "client",
  }

  users.push(newClient)
  saveToStorage(STORAGE_KEYS.USERS, users)
  return newId
}

// ================================================
//  👷 FUNÇÕES DE PROFISSIONAIS E SERVIÇOS
// ================================================

export const getProfessionals = (): Professional[] => {
  return loadFromStorage<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialMockProfessionals)
}

export const getMockProfessionals = (): Professional[] => getProfessionals() // Alias para clareza

export const saveProfessional = (professional: Professional): void => {
  const professionals = getProfessionals()
  const existingIndex = professionals.findIndex((p) => p.id === professional.id)
  if (existingIndex >= 0) professionals[existingIndex] = professional
  else professionals.push(professional)
  saveToStorage(STORAGE_KEYS.PROFESSIONALS, professionals)
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

export const getMockServices = (): Service[] => {
  const professionals = getProfessionals()
  return professionals.flatMap((prof) =>
    prof.services.map((service) => ({ ...service, professionalId: prof.id }))
  )
}

// ================================================
//  ⭐️ FUNÇÕES DE FAVORITOS
// ================================================

// Favorites são armazenados por WhatsApp do usuário
interface AllFavorites {
  [userWhatsapp: string]: Favorite[]
}

export const getFavorites = (userWhatsapp: string): Favorite[] => {
  const allFavorites = loadFromStorage<AllFavorites>(STORAGE_KEYS.FAVORITES, {})
  return allFavorites[userWhatsapp] || []
}

export const addFavorite = (userWhatsapp: string, favorite: Favorite): void => {
  const allFavorites = loadFromStorage<AllFavorites>(STORAGE_KEYS.FAVORITES, {})
  if (!allFavorites[userWhatsapp]) allFavorites[userWhatsapp] = []
  const exists = allFavorites[userWhatsapp].some(
    (f) => f.professionalId === favorite.professionalId
  )
  if (!exists) {
    allFavorites[userWhatsapp].push(favorite)
    saveToStorage(STORAGE_KEYS.FAVORITES, allFavorites)
  }
}

export const removeFavorite = (userWhatsapp: string, professionalId: string): void => {
  const allFavorites = loadFromStorage<AllFavorites>(STORAGE_KEYS.FAVORITES, {})
  if (allFavorites[userWhatsapp]) {
    allFavorites[userWhatsapp] = allFavorites[userWhatsapp].filter(
      (f) => f.professionalId !== professionalId
    )
    saveToStorage(STORAGE_KEYS.FAVORITES, allFavorites)
  }
}

export const isFavorite = (userWhatsapp: string, professionalId: string): boolean => {
  const favorites = getFavorites(userWhatsapp)
  return favorites.some((f) => f.professionalId === professionalId)
}

// ================================================
//  🏷️ FUNÇÕES DE CATEGORIAS
// ================================================

export const getCategories = (): ServiceCategory[] => {
  return loadFromStorage<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories)
}

export const saveCategory = (category: ServiceCategory): void => {
  const categories = getCategories()
  const existingIndex = categories.findIndex((c) => c.id === category.id)
  if (existingIndex >= 0) categories[existingIndex] = category
  else categories.push(category)
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
}

// ================================================
//  🗓️ FUNÇÕES DE DISPONIBILIDADE (AVAILABILITY)
// ================================================

// Availability é armazenada por ID do profissional
interface AllAvailability {
  [professionalId: string]: ProfessionalAvailability
}

export const getProfessionalAvailability = (professionalId: string): ProfessionalAvailability | null => {
  const allAvailability = loadFromStorage<AllAvailability>(STORAGE_KEYS.AVAILABILITY, {})
  return allAvailability[professionalId] || null
}

export const saveProfessionalAvailability = (availability: ProfessionalAvailability): void => {
  const allAvailability = loadFromStorage<AllAvailability>(STORAGE_KEYS.AVAILABILITY, {})
  allAvailability[availability.professionalId] = availability
  saveToStorage(STORAGE_KEYS.AVAILABILITY, allAvailability)
}

/**
 * Cria a disponibilidade padrão com base nos dados do Professional.
 */
export const getDefaultAvailability = (professionalId: string): ProfessionalAvailability => {
  const professional = getProfessionalById(professionalId)

  // Padrão completo para todos os dias
  const defaultWorkingHours: WorkingHoursMap = {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "14:00" },
    sunday: { enabled: false, start: "00:00", end: "00:00" },
  }

  // Combina dados do profissional com o padrão
  const workingHoursMap: WorkingHoursMap = { ...defaultWorkingHours, ...professional?.workingHours }

  const workingDays: ProfessionalAvailability["workingDays"] = {
    monday: workingHoursMap.monday.enabled,
    tuesday: workingHoursMap.tuesday.enabled,
    wednesday: workingHoursMap.wednesday.enabled,
    thursday: workingHoursMap.thursday.enabled,
    friday: workingHoursMap.friday.enabled,
    saturday: workingHoursMap.saturday.enabled,
    sunday: workingHoursMap.sunday.enabled,
  }

  // Usa apenas segunda-feira como intervalo padrão (pode melhorar depois)
  const workingInterval: WorkingInterval = {
    start: workingHoursMap.monday.start,
    end: workingHoursMap.monday.end,
  }

  return {
    professionalId,
    workingDays,
    workingHours: workingInterval, // tipo correto: WorkingInterval
    slotInterval: 30,
    closedDates: [],
    customSlots: [],
  }
}


// ================================================
//  📅 FUNÇÕES DE AGENDAMENTOS E SLOTS
// ================================================

export const getStoredAppointments = (): MockAppointment[] => {
  return loadFromStorage<MockAppointment[]>(
    STORAGE_KEYS.APPOINTMENTS,
    initialMockAppointments
  )
}

export const getAppointments = (): MockAppointment[] => getStoredAppointments()

export const saveAppointment = (appointment: MockAppointment): void => {
  const appointments = getStoredAppointments()

  const clientId = ensureClientExists(
    appointment.clientName,
    appointment.clientWhatsapp
  )

  const appointmentWithClientId = { ...appointment, clientId }

  const existingIndex = appointments.findIndex((a) => a.id === appointment.id)
  if (existingIndex >= 0) appointments[existingIndex] = appointmentWithClientId
  else appointments.push(appointmentWithClientId)

  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
}

export const getAppointmentsByProfessional = (professionalId: string): MockAppointment[] =>
  getStoredAppointments().filter((apt) => apt.professionalId === professionalId)

const isTimeSlotBooked = (professionalId: string, date: string, time: string): boolean => {
  const appointments = getStoredAppointments()
  return appointments.some(
    (apt) =>
      apt.professionalId === professionalId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== "cancelado"
  )
}

/**
 * Gera os slots de horário disponíveis para um profissional em uma data específica.
 */
export const generateTimeSlots = (professionalId: string, date: Date): TimeSlot[] => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const dayName = dayNames[date.getDay()]

  if (availability.closedDates.includes(dateStr)) return []
  if (!availability.workingDays[dayName]) return []

  const customSlot = availability.customSlots?.find((cs) => cs.date === dateStr)
  if (customSlot) {
    return customSlot.slots.map((time) => ({
      time,
      available: !isTimeSlotBooked(professionalId, dateStr, time),
      reason: isTimeSlotBooked(professionalId, dateStr, time) ? "booked" : "custom",
    }))
  }

  const slots: TimeSlot[] = []
  const { start, end } = availability.workingHours
  const [startHour, startMinute] = start.split(":").map(Number)
  const [endHour, endMinute] = end.split(":").map(Number)

  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`

    const now = new Date()
    const checkDate = new Date(date)
    checkDate.setHours(hours, minutes, 0, 0)

    // Adiciona apenas se for um horário futuro ou o dia atual (e não o passado no dia)
    if (checkDate > now || date.toDateString() !== now.toDateString()) {
      slots.push({
        time: timeStr,
        available: !isTimeSlotBooked(professionalId, dateStr, timeStr),
      })
    }

    currentMinutes += availability.slotInterval
  }
  return slots
}

export const isDateAvailable = (professionalId: string, date: Date): boolean => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const dayName = dayNames[date.getDay()]

  if (availability.closedDates.includes(dateStr)) return false
  return availability.workingDays[dayName]
}

export const getUnavailableReason = (professionalId: string, date: Date): string => {
  const availability = getProfessionalAvailability(professionalId) || getDefaultAvailability(professionalId)
  const dateStr = date.toISOString().split("T")[0]
  const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const dayName = dayNames[date.getDay()]

  if (availability.closedDates.includes(dateStr)) return "Fechado neste dia"
  if (!availability.workingDays[dayName]) return "Estabelecimento fechado"

  // Verifica se há slots disponíveis, caso contrário, retorna a razão "sem horários"
  const slots = generateTimeSlots(professionalId, date)
  if (slots.length === 0 || slots.every((slot) => !slot.available)) {
    return "Não há horários disponíveis para este dia"
  }

  return "" // Disponível ou a razão não é geral
}

// ================================================
//  👥 FUNÇÕES DE GESTÃO DE CLIENTES
// ================================================

export const getClientsByProfessional = (professionalId: string): Client[] => {
  const appointments = getAppointmentsByProfessional(professionalId)
  const clientsMap = new Map<string, Client>()

  appointments.forEach((apt) => {
    // Usa o whatsapp limpo como chave, ou um ID de fallback
    const whatsappKey = cleanWhatsappNumber(apt.clientWhatsapp)
    const clientId = whatsappKey || `no-whatsapp-${apt.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

    if (clientsMap.has(clientId)) {
      const client = clientsMap.get(clientId)!
      client.totalAppointments++
      if (apt.status === "concluido") client.totalSpent += apt.totalPrice
      // Usa a data do agendamento para a última visita
      const aptDateTime = new Date(`${apt.date}T${apt.time}:00`)
      const lastAptDateTime = new Date(client.lastAppointment)
      if (aptDateTime > lastAptDateTime) {
        client.lastAppointment = apt.date // Mantém apenas a data
      }
    } else {
      clientsMap.set(clientId, {
        id: clientId,
        name: apt.clientName,
        whatsapp: apt.clientWhatsapp,
        email: initialMockUsers.find(u => u.type === 'client' && cleanWhatsappNumber(u.whatsapp) === whatsappKey)?.email,
        birthDate: initialMockUsers.find(u => u.type === 'client' && cleanWhatsappNumber(u.whatsapp) === whatsappKey)?.birthDate,
        status: "ativo",
        totalAppointments: 1,
        totalSpent: apt.status === "concluido" ? apt.totalPrice : 0,
        lastAppointment: apt.date,
      })
    }
  })

  // Adiciona clientes cadastrados manualmente
  const storedClients = loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, [])
  storedClients.forEach((client) => {
    const key = cleanWhatsappNumber(client.whatsapp) || client.id
    if (!clientsMap.has(key)) {
      clientsMap.set(key, client)
    }
  })

  return Array.from(clientsMap.values()).sort(
    (a, b) => new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime()
  )
}

export const getClientById = (professionalId: string, clientId: string): Client | null => {
  const clients = getClientsByProfessional(professionalId)
  return clients.find((c) => c.id === clientId) || null
}

export const saveClient = (updatedClient: Client): void => {
  const clients = loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, [])
  const existingIndex = clients.findIndex((c) => c.id === updatedClient.id)
  if (existingIndex >= 0) clients[existingIndex] = updatedClient
  else clients.push(updatedClient)
  saveToStorage(STORAGE_KEYS.CLIENTS, clients)

  // Atualiza o registro correspondente em 'Users'
  const users = getUsers()
  const existingUser = users.find(
    (u) => u.type === "client" && cleanWhatsappNumber(u.whatsapp) === cleanWhatsappNumber(updatedClient.whatsapp)
  )
  if (existingUser) {
    existingUser.name = updatedClient.name
    existingUser.email = updatedClient.email
    existingUser.birthDate = updatedClient.birthDate
    saveUser(existingUser) // Reutiliza saveUser para salvar no storage de users
  }
}

export const getLastClientNameByWhatsapp = (whatsapp: string): string | null => {
  const appointments = getStoredAppointments()

  const cleanWhatsapp = cleanWhatsappNumber(whatsapp)
  const clientAppointments = appointments.filter(
    (apt) => cleanWhatsappNumber(apt.clientWhatsapp) === cleanWhatsapp
  )

  if (!clientAppointments.length) return null

  const sortedAppointments = clientAppointments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return sortedAppointments[0].clientName
}