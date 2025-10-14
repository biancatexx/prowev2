"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Heart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFavorites, removeFavorite, type Favorite } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import NavbarApp from "@/components/NavbarApp"
import { useAuth } from "@/contexts/AuthContext" // Importado useAuth

// 💡 NOVO COMPONENTE: Avatar com Fallback (Simulação simplificada do Explorar)
// A página de Explorar usa um componente mais complexo, mas esta é uma versão
// simplificada baseada no que foi encontrado no código original de Favoritos.
const ProfessionalAvatar = ({ professional }: { professional: Favorite }) => {
  // Nota: Não é ideal, pois o estado de erro de imagem deve ser mantido
  // dentro do componente, mas para fins de replicação do layout:
  const imgUrl = professional.image || "/placeholder.svg";

  if (imgUrl === "/placeholder.svg") {
    // FALLBACK: Exibe a inicial do nome
    const initial = professional.name ? professional.name.charAt(0).toUpperCase() : 'P';
    return (
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-zinc-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
        <span>{initial}</span>
      </div>
    );
  }

  // TENTA CARREGAR A IMAGEM
  return (
    <img
      src={imgUrl}
      alt={professional.name}
      className="w-16 h-16 object-cover rounded-full border-2 border-primary flex-shrink-0"
    />
  );
};

// 💡 FUNÇÃO AUXILIAR: Capitalizar as palavras (Copiada do Explorar)
const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return "";

  return text
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};


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
            <Button onClick={() => router.push("/cliente/perfil")}>Ir para o Perfil</Button>
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
              // 💡 NOVO CARD SIMILAR AO DO EXPLORAR
              <div key={professional.professionalId} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow relative">

                {/* Botão de Remover (Lixeira) */}
                <button
                  onClick={() => handleRemoveFavorite(professional.professionalId)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition z-10"
                  aria-label="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                <div className="flex gap-3">

                  {/* Avatar/Imagem do Profissional */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                    <ProfessionalAvatar professional={professional} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => router.push(`/profissional/${professional.professionalId}`)}
                      className="text-left w-full"
                    >
                      <h3 className="font-bold text-lg text-foreground mb-0">{capitalizeWords(professional.name)}</h3>
                      <p className="text-sm text-muted-foreground mb-1 truncate">{professional.category}</p>

                      {/* Faixa de Preço (mantendo o estilo do Explorar) */}
                      <div className="rounded-sm bg-primary/50 w-auto px-2 inline-block"><p className="text-sm font-semibold">{professional.priceRange}</p></div>
                    </button>
                  </div>
                </div>

                {/* Seção de Endereço e Distância */}
                <div className="border-t border-border mt-3 pt-3">
                  <div className="flex flex-col text-xs">
                    {/* LINHA DO ENDEREÇO COMPLETO E DISTÂNCIA */}
                    <div className="flex items-center text-muted-foreground gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                      {/* O address do Favoritos parece já estar formatado */}
                      <span className="truncate min-w-0">{professional.address}</span>
                      <div className="flex items-center font-bold text-primary inline">
                        <span className="truncate"> ● {professional.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              // 💡 FIM DO NOVO CARD
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