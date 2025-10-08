"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getUserByWhatsapp, getProfessionalByEmail, type User, type Professional } from "@/data/mockData"

interface AuthContextType {
  user: User | null
  professional: Professional | null
  isAuthenticated: boolean
  isLoading: boolean
  // CORREÇÃO: Agora retorna Professional ou null em vez de boolean
  login: (email: string, password: string) => Promise<Professional | null>
  loginClient: (whatsapp: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: User) => void
  updateProfessional: (professional: Professional) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored session
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("mock_current_user")
      const storedProfessional = localStorage.getItem("mock_current_professional")

      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      if (storedProfessional) {
        setProfessional(JSON.parse(storedProfessional))
      }

      setIsLoading(false)
    }
  }, [])

  // CORREÇÃO: Função agora retorna o objeto do profissional em vez de apenas 'true'
  const login = async (email: string, password: string): Promise<Professional | null> => {
    const prof = getProfessionalByEmail(email)

    if (prof && prof.password === password) {
      setProfessional(prof)
      localStorage.setItem("mock_current_professional", JSON.stringify(prof))
      return prof // Retorna o objeto Professional
    }

    return null // Retorna null em caso de falha
  }

  const loginClient = async (whatsapp: string): Promise<boolean> => {
    const clientUser = getUserByWhatsapp(whatsapp)

    if (clientUser) {
      setUser(clientUser)
      localStorage.setItem("mock_current_user", JSON.stringify(clientUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setProfessional(null)
    localStorage.removeItem("mock_current_user")
    localStorage.removeItem("mock_current_professional")
    router.push("/")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("mock_current_user", JSON.stringify(updatedUser))
  }

  const updateProfessional = (updatedProfessional: Professional) => {
    setProfessional(updatedProfessional)
    localStorage.setItem("mock_current_professional", JSON.stringify(updatedProfessional))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        professional,
        isAuthenticated: !!user || !!professional,
        isLoading,
        login,
        loginClient,
        logout,
        updateUser,
        updateProfessional,
      }}
    >
    
      {isLoading ? (
        // Um placeholder de carregamento simples para evitar o erro.
        <div className="flex items-center justify-center h-screen">Carregando...</div>
      ) : (
        children
      )}
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
