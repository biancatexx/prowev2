"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Heart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFavorites, removeFavorite, type Favorite } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import NavbarApp from "@/components/NavbarApp"
import { useAuth } from "@/contexts/AuthContext" // Importado useAuth

export default function Favoritos() {
  const router = useRouter()
  const { toast } = useToast()
  // 🔑 Usa o contexto de autenticação para obter o usuário
  const { user } = useAuth() 
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // 🔑 Usa o user do AuthContext
    if (user && user.whatsapp) {
      const whatsapp = user.whatsapp.replace(/\D/g, "")
      
      const userFavorites = getFavorites(whatsapp)
      setFavorites(userFavorites)
    } else {
      setFavorites([]) // Limpa se o usuário não estiver logado
    }
    setLoading(false)
  }, [user]) // Depende do user do AuthContext

  const handleRemoveFavorite = (professionalId: string) => {
    if (!user || !user.whatsapp) return

    const userWhatsapp = user.whatsapp.replace(/\D/g, "")

    try {
      removeFavorite(userWhatsapp, professionalId)
      setFavorites((prev) => prev.filter((fav) => fav.professionalId !== professionalId))
      toast({
        title: "Removido dos favoritos",
        description: "Profissional removido dos seus favoritos.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      })
    }
  }

  // Header sempre visível
  const Header = () => (
    <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
      <div className="container mx-auto max-w-screen-lg text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Favoritos
        </h1>
      </div>
    </header>
  )

  // Main variando conforme login/WhatsApp
  const MainContent = () => {
    if (loading) {
      return (
          <main className="container mx-auto max-w-screen-lg px-4 text-center">
          <p>Carregando...</p>
        </main>
      )
    }

    // 🔑 Agora verifica se o user está logado no AuthContext
    if (!user) {
      return (
          <main className="container mx-auto max-w-screen-lg px-4">
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Faça login para ver</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Entre na sua conta para acessar seus profissionais favoritos.
            </p>
            <Button onClick={() => router.push("/login")}>Fazer Login</Button>
          </div>
        </main>
      )
    }
    
    // Se logado mas sem WhatsApp (caso improvável, mas para segurança)
    if (!user.whatsapp) {
        return (
            <main className="container mx-auto max-w-screen-lg px-4">
            <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">WhatsApp pendente</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Complete seu perfil com o WhatsApp para salvar e acessar seus favoritos.
              </p>
              <Button onClick={() => router.push("/perfil")}>Ir para o Perfil</Button>
            </div>
          </main>
        )
    }

    return (
      <main className="container mx-auto max-w-screen-lg px-4">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm mt-8">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhum favorito ainda</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione seus profissionais favoritos para acessá-los rapidamente.
            </p>
            <Button onClick={() => router.push("/")}>Explorar Profissionais</Button>
          </div>
        ) : (
          <section className="space-y-4 mt-6">
            {favorites.map((professional) => (
              <div
                key={professional.professionalId}
                className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow relative"
              >
                <button
                  onClick={() => handleRemoveFavorite(professional.professionalId)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-red-50 transition"
                  aria-label="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/profissional/${professional.professionalId}`)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={professional.image || "/placeholder.svg"}
                      alt={professional.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => router.push(`/profissional/${professional.professionalId}`)}
                      className="text-left w-full"
                    >
                      <h3 className="font-bold text-foreground mb-1">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1 truncate">{professional.category}</p>
                      <p className="text-sm font-semibold text-foreground mb-2">{professional.priceRange}</p>
                    </button>
                  </div>

                  <button
                    onClick={() => router.push(`/agendamento/${professional.professionalId}`)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="-mx-4 mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground px-4">
                  <div className="flex items-center truncate">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{professional.address}</span>
                  </div>
                  <span className="ml-2 flex-shrink-0">• {professional.distance}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <MainContent />
      <NavbarApp />
    </div>
  )
}