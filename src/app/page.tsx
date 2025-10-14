"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Heart, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  getProfessionals,
  getMockServices,
  isFavorite,
  addFavorite,
  removeFavorite,
  type Favorite,
} from "@/data/mockData";
import NavbarApp from "@/components/NavbarApp";
import Link from "next/link";
import { toast } from "sonner";

interface Coords {
  lat: number;
  lng: number;
}

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  profileImage: string | null;
  services?: Array<{ category: string; price: number; duration: number; id: string }>;
  address: { street: string; neighborhood: string; city: string; state: string; number?: string; };
  operationType: 'agendamento' | 'fila';
}

const categories = [
  { name: "Todos", icon: "🎯" },
  { name: "Cabelo", icon: "💇‍♀️" },
  { name: "Manicure", icon: "💅" },
  { name: "Estética", icon: "✨" },
  { name: "Maquiagem", icon: "💄" },
  { name: "Depilação", icon: "🪒" },
  { name: "Massagem", icon: "💆‍♀️" }
];

// --- FUNÇÕES DE CÁLCULO DE DISTÂNCIA E GEOCODIFICAÇÃO ---

/**
 * Converte coordenadas (lat, lng) em um endereço legível usando a API Nominatim (OpenStreetMap).
 */
const reverseGeocodeNominatim = async (lat: number, lng: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18&accept-language=pt`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.address) {
      const address = data.address;
      const street = address.road || address.pedestrian;
      const number = address.house_number || '';
      const neighborhood = address.suburb || address.quarter || '';
      const city = address.city || address.town || address.village;
      const state = address.state_abbr || address.state;

      let formattedAddress = '';
      if (street) {
        formattedAddress += street + (number ? `, ${number}` : '');
      } else {
        formattedAddress += 'Endereço sem logradouro';
      }
      if (neighborhood) {
        formattedAddress += `, ${neighborhood}`;
      }
      if (city || state) {
        formattedAddress += ` - ${city || 'Cidade'}/${state || 'UF'}`;
      }

      return formattedAddress.trim() || data.display_name || "Endereço não encontrado.";

    } else if (data.error) {
      return `Erro Nominatim: ${data.error}`;
    }

    return "Endereço não encontrado para estas coordenadas.";

  } catch (error) {
    console.error("Erro na geocodificação reversa (Nominatim): ", error);
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Erro ao buscar endereço)`;
  }
};


/**
 * Converte um endereço completo (string) em coordenadas (lat, lng)
 * usando a API Nominatim (OpenStreetMap).
 */
const geocodeNominatim = async (address: string): Promise<Coords | null> => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  } catch (error) {
    console.error(`Erro na geocodificação de "${address}": `, error);
    return null;
  }
};


/**
 * Calcula a distância em quilômetros (km) entre dois pontos de coordenadas (Lat/Lng)
 * usando a Fórmula de Haversine.
 */
const calculateDistance = (coord1: Coords, coord2: Coords): number => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// --- COMPONENTE PRINCIPAL ---

const Explorar = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  // IDs dos profissionais favoritos do usuário logado
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp do usuário logado (simulação de autenticação)
  const [userWhatsapp, setUserWhatsapp] = useState<string | null>(null);

  // Localização do usuário
  const [userLocationDisplay, setUserLocationDisplay] = useState("Buscando sua localização...");
  const [userCoords, setUserCoords] = useState<Coords | null>(null);

  // Cache de coordenadas dos profissionais
  const [professionalCoords, setProfessionalCoords] = useState<{ [key: string]: Coords | null }>({});


  // EFEITO 0: CARREGAR DADOS E ESTADO DE AUTENTICAÇÃO/FAVORITOS
  useEffect(() => {
    const rawProfessionals = getProfessionals();
    const allMockServices = getMockServices();

    const loadedProfessionals: Professional[] = rawProfessionals.map((prof: any) => {
      const profServices = allMockServices.filter((s: any) => s.professionalId === prof.id);
      return {
        ...prof,
        address: prof.address || { street: "N/A", neighborhood: "N/A", city: "N/A", state: "N/A" },
        services: profServices,
        profileImage: prof.profileImage || null,
        operationType: prof.operationType || 'agendamento'
      };
    });

    setProfessionals(loadedProfessionals);
    setLoading(false);

    // Carrega usuário logado (mock)
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("mock_current_user");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const whatsapp = user.whatsapp || "";
        if (whatsapp) setUserWhatsapp(whatsapp);
      }
    }
  }, []);

  // 2️⃣ Carrega Favoritos assim que souber o WhatsApp do usuário
  useEffect(() => {
    if (!userWhatsapp) return;

    const storedFavs: Favorite[] = JSON.parse(localStorage.getItem(`favorites_${userWhatsapp}`) || '[]');
    setFavoriteIds(storedFavs.map(f => f.professionalId));
  }, [userWhatsapp]);

 
  useEffect(() => {
    if (!userWhatsapp) return;

    // Atualiza o localStorage com a lista atualizada de favoritos
    const storedFavs: Favorite[] = JSON.parse(localStorage.getItem(`favorites_${userWhatsapp}`) || '[]');

    // Remove duplicados e mantém apenas os profissionais realmente favoritados
    const updated = storedFavs.filter(f => favoriteIds.includes(f.professionalId));

    localStorage.setItem(`favorites_${userWhatsapp}`, JSON.stringify(updated));
  }, [favoriteIds, userWhatsapp]);

  // EFEITO 1: OBTER LOCALIZAÇÃO DO USUÁRIO
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setUserLocationDisplay("Buscando sua localização...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setUserCoords({ lat: latitude, lng: longitude });

          try {
            const address = await reverseGeocodeNominatim(latitude, longitude);
            setUserLocationDisplay(address);
          } catch (e) {
            console.error("Falha ao buscar endereço.", e);
            setUserLocationDisplay(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          let mensagem = "Localização indisponível. Usando mock.";
          if (error?.code === 1) mensagem = "Permissão de localização negada.";
          setUserLocationDisplay(mensagem);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setUserLocationDisplay("Geolocalização não suportada.");
    }
  }, []);

  // EFEITO 2: GEOCODIFICAR ENDEREÇOS DOS PROFISSIONAIS (com delay para Nominatim)
  useEffect(() => {
    const geocodeAllProfessionals = async () => {
      const coordsMap: { [key: string]: Coords | null } = {};
      const professionalsToGeocode = professionals.filter(p => professionalCoords[p.id] === undefined);

      if (professionalsToGeocode.length === 0) return;

      for (const prof of professionalsToGeocode) {
        const addressString = getAddress(prof);
        if (addressString !== "Endereço não informado") {
          const coords = await geocodeNominatim(addressString);
          coordsMap[prof.id] = coords;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Atraso obrigatório para Nominatim
        } else {
          coordsMap[prof.id] = null;
        }
      }

      setProfessionalCoords(prev => ({ ...prev, ...coordsMap }));
    };

    if (professionals.length > 0) {
      const timeout = setTimeout(() => geocodeAllProfessionals(), 1500);
      return () => clearTimeout(timeout);
    }
  }, [professionals]);


  // FUNÇÃO PARA GERENCIAR FAVORITOS
 const toggleFavorite = (professional: Professional) => {
  if (!userWhatsapp) {
    toast.error("Por favor, faça login (cadastre seu WhatsApp) para gerenciar favoritos. 😢");
    return;
  }

  const isCurrentlyFav = favoriteIds.includes(professional.id);

  try {
    if (isCurrentlyFav) {
      // 👉 Remover dos favoritos
      removeFavorite(userWhatsapp, professional.id);
      setFavoriteIds(prev => prev.filter(id => id !== professional.id));
      toast.success(`Removido dos favoritos: ${professional.name}`);
    } else {
      // 👉 Adicionar aos favoritos
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
        distance: getDistance(professional.id).trim(),
        image: professional.profileImage || "/placeholder.svg",
      };

      addFavorite(userWhatsapp, favorite);
      setFavoriteIds(prev => [...prev, professional.id]);
      toast.success(`${professional.name} foi adicionado aos favoritos ❤️`);
    }
  } catch (error) {
    console.error(error);
    toast.error("Erro ao atualizar favoritos. Tente novamente.");
  }
};


  const getAddress = (prof: Professional) => {
    if (prof.address && typeof prof.address === 'object') return `${prof.address.street}, ${prof.address.neighborhood} - ${prof.address.city}/${prof.address.state}`;
    return "Endereço não informado";
  };

  const getPriceRange = (prof: Professional) => {
    if (!prof.services || prof.services.length === 0) return "Consultar preços";
    const prices = prof.services.map((s: any) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `R$ ${min.toFixed(0)} - R$ ${max.toFixed(0)}`;
  };

  const getServices = (prof: Professional) => {
    if (!prof.services || prof.services.length === 0) return "Serviços não informados";

    const allCategories = prof.services.map((s: any) => s.category);
    const uniqueCategories = Array.from(new Set(allCategories));
    const displayedCategories = uniqueCategories.slice(0, 3);

    return displayedCategories.join(" • ") + (uniqueCategories.length > 3 ? " ..." : "");
  };

  /**
   * Calcula e formata a distância entre o usuário e o profissional.
   */
  const getDistance = (profId: string): string => {
    const profCoords = professionalCoords[profId];

    if (!userCoords) return "Aguardando sua localização...";
    if (profCoords === undefined) return "Calculando..."; // Geocodificação ainda não tentada
    if (profCoords) {
      const distance = calculateDistance(userCoords, profCoords);

      if (distance < 1) {
        const distanceInMeters = distance * 1000;
        return `${distanceInMeters.toFixed(0)} m `;
      } else {
        return `${distance.toFixed(1)} km `;
      }
    }

    return "Distância indisponível"; // Geocodificação falhou (profCoords foi null)
  };


  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.services?.some(s => s.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "Todos" ||
      prof.services?.some(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

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

  // Componente para Avatar com Fallback
  const ProfessionalAvatar = ({ professional }: { professional: Professional }) => {
    const [imgError, setImgError] = useState(!professional.profileImage);

    useEffect(() => {
      setImgError(!professional.profileImage);
    }, [professional.profileImage]);

    if (imgError) {
      // FALLBACK: Exibe a inicial do nome
      return (
        <div className="w-18 h-18 mx-auto rounded-full border-primary bg-zinc-900 text-white flex items-center justify-center text-xl font-bold border-2 fallback-avatar">
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
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">

      <header className="bg-primary rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-zinc-900 leading-snug">Encontre o profissional disponível mais perto de você</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-2 w-full max-w-4xl">
            {/* Endereço do Usuário (Localização) */}
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                value={userLocationDisplay}
                readOnly
                name="Localizacao"
                className="pl-12 pr-10 py-4 text-lg rounded-xl border-2 border-zinc-300 focus:border-primary w-full shadow-sm"
              />
              <ChevronDown className=" hidden absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por serviço, profissional ou local..."
                value={searchQuery}
                name="Pesquisa"
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-zinc-300 focus:border-primary w-full shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-lg px-4">
        {/* Categorias */}
        <section className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Categorias</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div
                  className={`
                    rounded-full p-4 text-center text-2xl
                    hover:shadow-lg transition-all cursor-pointer 
                    border-2 
                    ${selectedCategory === category.name ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card text-foreground border-border hover:border-primary/50"} 
                  `}
                >
                  {category.icon}
                </div>
                <span className={`text-xs font-medium text-center ${selectedCategory === category.name ? 'text-primary font-bold' : 'text-foreground'}`}>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="py-2 pb-24">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Profissionais Perto de Você</h2>
              <p className="text-sm text-muted-foreground mt-1">{loading ? "Carregando..." : `${filteredProfessionals.length} profissionais encontrados`}</p>
            </div>

          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando profissionais...</p>
            ) : filteredProfessionals.length === 0 ? (
              <p className="text-center text-muted-foreground p-8 border border-border rounded-xl">Nenhum profissional encontrado com os filtros atuais.</p>
            ) : (
              filteredProfessionals.map(professional => (
                <div key={professional.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {/* AVATAR COM LINK */}
                    <Link href={`/profissional/${professional.id}`} className="flex-shrink-0 w-18 h-18 rounded-full overflow-hidden border-primary">
                      <ProfessionalAvatar professional={professional} />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/profissional/${professional.id}`}>
                        <h3 className="font-bold text-lg text-foreground mb-0">{capitalizeWords(professional.name)}</h3>
                        <p className="text-sm text-muted-foreground mb-1 truncate">{getServices(professional)}</p>
                        <div className="rounded-sm bg-primary/50 w-auto px-2 inline-block"><p className="text-sm font-semibold">{getPriceRange(professional)}</p></div>
                      </Link>
                    </div>
                    {userWhatsapp ? (
                      <button
                        onClick={() => toggleFavorite(professional)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center self-start"
                        aria-label="Adicionar aos favoritos"
                      >

                        {(() => {
                          const isFav = !!userWhatsapp && (favoriteIds.includes(professional.id) || isFavorite(userWhatsapp, professional.id));
                          return (
                            <Heart
                              className={`w-5 h-5 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-zinc-400 hover:text-red-400"}`}
                            />
                          );
                        })()}
                      </button>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center self-start">
                        <Heart className="w-5 h-5 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <div className="flex flex-col text-xs">

                      {/* LINHA DO ENDEREÇO COMPLETO */}
                      <div className="flex items-center text-muted-foreground gap-2">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate min-w-0">{getAddress(professional)}</span>
                        <div className="flex items-center font-bold text-primary inline">
                          <span className="truncate"> ● {getDistance(professional.id)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <NavbarApp />
    </div>
  );
};

export default Explorar;
