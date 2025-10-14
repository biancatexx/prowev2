"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
// Assumindo que você está importando as funções e tipos do seu mockData.ts
import { getFavorites, removeFavorite, type Favorite, type Service } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import NavbarApp from "@/components/NavbarApp"
import { useAuth } from "@/contexts/AuthContext"


// ===============================================
// 💡 FUNÇÕES AUXILIARES (CORRIGIDAS/ADICIONADAS)
// ===============================================

// 💡 NOVO: Função para gerar a string de categorias de serviços concatenados (3 primeiros)
const getServices = (professional: Favorite): string => {
  if (!professional.services || professional.services.length === 0) return "Geral";

  // Mapeia para pegar todas as categorias
  const allCategories = professional.services.map((s: Service) => s.category);
  // Remove duplicatas
  const uniqueCategories = Array.from(new Set(allCategories));
  // Pega as 3 primeiras para exibição
  const displayedCategories = uniqueCategories.slice(0, 3);

  return displayedCategories.join(" • ") + (uniqueCategories.length > 3 ? " ..." : "");
};

// ✅ CORRIGIDO: A função agora exibe o range de preços e trata o caso de preço único.
const getPriceRange = (professional: Favorite): string => {
  // O tipo Favorite, conforme seu mock, inclui services: Service[]
  if (!professional.services || professional.services.length === 0) return "Consultar preços";

  const prices = professional.services.map((s: Service) => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Se min e max forem iguais (apenas um serviço ou todos o mesmo preço)
  if (min === max) return `R$ ${min.toFixed(2).replace('.00', '')}`;

  return `R$ ${min.toFixed(0)} - R$ ${max.toFixed(0)}`;
};

// 💡 FUNÇÃO AUXILIAR: Capitalizar as palavras
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


// ===============================================
// 🖼️ COMPONENTES
// ===============================================

const ProfessionalAvatar = ({ professional }: { professional: Favorite }) => {
  const [imgError, setImgError] = useState(!professional.image);

  useEffect(() => {
    setImgError(!professional.image);
  }, [professional.image]);

  if (imgError) {
    return (
      <div className="w-18 h-18 mx-auto rounded-full border-primary bg-zinc-900 text-white flex items-center justify-center text-xl font-bold border-2 fallback-avatar">
        <span>{professional.name ? professional.name.charAt(0).toUpperCase() : 'P'}</span>
      </div>
    );
  }

  return (
    <img
      src={professional.image as string}
      alt={professional.name}
      className="w-full h-full object-cover border-2 rounded-full border-primary"
      onError={() => setImgError(true)}
    />
  );
};


// ===============================================
// 🖥️ COMPONENTE PRINCIPAL
// ===============================================

export default function Favoritos() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (user && user.whatsapp) {
      const whatsapp = user.whatsapp.replace(/\D/g, "")
      const userFavorites = getFavorites(whatsapp)
      setFavorites(userFavorites)
    } else {
      setFavorites([])
    }
    setLoading(false)
  }, [user])

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

  const Header = () => (
    <header className="bg-gradient-to-br from-primary via-primary to-accent rounded-b-3xl pb-8 pt-8 px-4 mb-6">
      <div className="container mx-auto max-w-screen-lg text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Favoritos
        </h1>
      </div>
    </header>
  )

  const MainContent = () => {
    if (loading) {
      return (
        <main className="container mx-auto max-w-screen-lg px-4 text-center">
          <p>Carregando...</p>
        </main>
      )
    }

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
              <div key={professional.professionalId} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow relative">

                <button
                  onClick={() => handleRemoveFavorite(professional.professionalId)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition z-10"
                  aria-label="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                <div className="flex gap-3">
                  <Link href={`/profissional/${professional.professionalId}`} className="flex-shrink-0 w-18 h-18 rounded-full overflow-hidden border-primary">
                    <ProfessionalAvatar professional={professional} />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/profissional/${professional.professionalId}`}>
                      <h3 className="font-bold text-lg text-foreground mb-0">{capitalizeWords(professional.name)}</h3>
                      {/* ✅ CORREÇÃO: Usando a nova função getServices */}
                      <p className="text-sm text-muted-foreground mb-1 truncate">{getServices(professional)}</p>
                      {/* ✅ CORREÇÃO: Usando a função getPriceRange corrigida */}
                      <div className="rounded-sm bg-primary/50 w-auto px-2 inline-block"><p className="text-sm font-semibold">{getPriceRange(professional)}</p></div>
                    </Link>
                  </div>

                </div>

                {/* Seção de Endereço e Distância */}
                <div className="border-t border-border mt-3 pt-3">
                  <div className="flex flex-col text-xs">
                    <div className="flex items-center text-muted-foreground gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate min-w-0">{professional.address}</span>
                      <div className="flex items-center font-bold text-primary inline">
                        <span className="truncate"> ● {professional.distance}</span>
                      </div>
                    </div>
                  </div>
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