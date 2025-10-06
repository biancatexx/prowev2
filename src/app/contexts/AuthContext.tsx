"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockUsers, mockProfessionals, STORAGE_KEYS, type MockUser, type MockProfessional } from "@/data/mockData"

interface AuthContextType {
  user: MockUser | null
  professional: MockProfessional | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<MockUser>) => Promise<boolean>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [professional, setProfessional] = useState<MockProfessional | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as MockUser
          setUser(parsedUser)

          // Carregar dados do profissional
          if (parsedUser.professionalId) {
            const prof = mockProfessionals.find((p) => p.id === parsedUser.professionalId)
            setProfessional(prof || null)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuário no mock
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!foundUser) {
        return false
      }

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser))
      setUser(foundUser)

      // Carregar dados do profissional
      if (foundUser.professionalId) {
        const prof = mockProfessionals.find((p) => p.id === foundUser.professionalId)
        setProfessional(prof || null)
      }

      return true
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    setUser(null)
    setProfessional(null)
  }

  const updateUser = async (updates: Partial<MockUser>): Promise<boolean> => {
    try {
      if (!user) return false

      const updatedUser = { ...user, ...updates }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser))
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        professional,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
