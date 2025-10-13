"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Heart, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { getProfessionals, getMockServices } from "@/data/mockData";
import NavbarApp from "@/components/NavbarApp";
import Link from "next/link";

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  profileImage: string | null;
  services?: Array<{ category: string; price: number }>;
  address: { street: string; neighborhood: string; city: string; state: string };
  lat: number;
  lng: number;
}

const categories = [
  { name: "Todos", icon: "🎯" },
  { name: "Cabelo", icon: "💇‍♀️" },
  { name: "Manicure", icon: "💅" },
  { name: "Estética", icon: "✨" },
  { name: "Maquiagem", icon: "💄" },
  { name: "Depilação", icon: "🪒" },
  { name: "Massagem", icon: "💆‍♀️" },
];

const fetchAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  const url = `/api/geocode?lat=${lat}&lng=${lng}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.status !== 200 || data.error) throw new Error(data.error || "Erro desconhecido na API Route");
    if (data && data.display_name) return data.display_name.split(",").slice(0, 3).join(", ");
    console.error("Geocodificação Reversa falhou. Dados:", data);
    return "Endereço não encontrado";
  } catch (error) {
    console.error("Erro na requisição para /api/geocode:", error);
    return "Falha ao carregar o endereço";
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MOCK_USER_COORDS = { lat: -3.835, lng: -38.547 };
const mockProfessionalCoordsFallback = [
  { id: "p1", lat: -3.83733, lng: -38.54922 },
  { id: "p2", lat: -3.832, lng: -38.545 },
];

const Explorar = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocationDisplay, setUserLocationDisplay] = useState("Localização Padrão (Mock)");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(MOCK_USER_COORDS);

  useEffect(() => {
    const rawProfessionals: any[] = getProfessionals();
    const allMockServices = getMockServices();
    const loadedProfessionals: Professional[] = rawProfessionals.map((prof: any) => {
      const profServices = allMockServices.filter((s: any) => s.professionalId === prof.id);
      const fallback = mockProfessionalCoordsFallback.find(c => c.id === prof.id) || { lat: 0, lng: 0 };
      const finalCoords = prof.coords || fallback;
      return {
        ...prof,
        address: prof.address || { street: "N/A", neighborhood: "N/A", city: "N/A", state: "N/A" },
        services: profServices,
        profileImage: prof.profileImage || null,
        lat: finalCoords.lat,
        lng: finalCoords.lng,
      };
    });
    setProfessionals(loadedProfessionals);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setUserLocationDisplay("Buscando sua localização...");
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          const addressName = await fetchAddressFromCoords(latitude, longitude);
          setUserLocationDisplay(addressName);
        },
        error => {
          console.error("Erro ao obter localização:", error);
          setUserLocationDisplay("Localização indisponível. Usando mock.");
          setUserCoords(MOCK_USER_COORDS);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setUserLocationDisplay("Geolocalização não suportada. Usando mock.");
      setUserCoords(MOCK_USER_COORDS);
    }
  }, []);

  const getDistanceDisplay = (prof: Professional): string | null => {
    if (!userCoords || prof.lat === 0 || prof.lng === 0) return null;
    const distKm = calculateDistance(userCoords.lat, userCoords.lng, prof.lat, prof.lng);
    return distKm < 1 ? `${(distKm * 1000).toFixed(0)}m` : `${distKm.toFixed(1)}km`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]));
  };

  const getAddress = (prof: Professional) => {
    if (prof.address && typeof prof.address === "object")
      return `${prof.address.street}, ${prof.address.neighborhood} - ${prof.address.state}`;
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
    return displayedCategories.join(", ") + (uniqueCategories.length > 3 ? "..." : "");
  };

  const filteredAndSortedProfessionals = useMemo(() => {
    let filtered = professionals.filter(prof => {
      const matchesSearch =
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.services?.some(s => s.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "Todos" ||
        prof.services?.some(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      return matchesSearch && matchesCategory;
    });
    if (userCoords) {
      filtered = filtered.sort((a, b) => {
        const distA = calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    return filtered;
  }, [professionals, searchQuery, selectedCategory, userCoords]);

  const capitalizeWords = (text: string | null | undefined): string => {
    if (!text) return "";
    return text
      .split(" ")
      .map(word => (!word ? "" : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-zinc-900 leading-snug">
              Encontre o profissional disponível mais perto de você
            </h1>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-2 w-full max-w-4xl">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                value={userLocationDisplay}
                readOnly
                name="Localizacao"
                className="pl-12 pr-10 py-4 text-lg rounded-xl border-2 border-zinc-300 focus:border-primary w-full shadow-sm"
              />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
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
        <section className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Categorias</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.name}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div
                  className={`rounded-full p-4 text-center text-2xl hover:shadow-lg transition-all cursor-pointer border-2 ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {category.icon}
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    selectedCategory === category.name ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="py-2 pb-24">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Profissionais Perto de Você</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {loading
                  ? "Carregando..."
                  : `${filteredAndSortedProfessionals.length} profissionais encontrados`}
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <SlidersHorizontal className="mr-2 w-4 h-4" />
              Filtros
            </Button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando profissionais...</p>
            ) : filteredAndSortedProfessionals.length === 0 ? (
              <p className="text-center text-muted-foreground p-8 border border-border rounded-xl">
                Nenhum profissional encontrado com os filtros atuais.
              </p>
            ) : (
              filteredAndSortedProfessionals.map(professional => (
                <div
                  key={professional.id}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <Link
                      href={`/profissional/${professional.id}`}
                      className="flex-shrink-0 w-18 h-18 rounded-full overflow-hidden border-primary"
                    >
                      {professional.profileImage ? (
                        <img
                          src={professional.profileImage}
                          alt={professional.name}
                          className="w-full h-full object-cover border-2 rounded-full border-primary"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement
                              ?.querySelector(".fallback-avatar")
                              ?.classList.remove("hidden");
                          }}
                        />
                      ) : (
                        <div className="w-18 h-18 mx-auto rounded-full border-primary bg-zinc-900 text-white flex items-center justify-center text-xl font-bold border fallback-avatar">
                          <span>{professional.name ? professional.name.charAt(0).toUpperCase() : "P"}</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profissional/${professional.id}`}>
                        <h3 className="font-bold text-lg text-foreground mb-0">
                          {capitalizeWords(professional.name)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {getServices(professional)}
                        </p>
                        <div className="rounded-sm bg-primary/50 w-auto px-2 inline-block">
                          <p className="text-sm font-semibold">{getPriceRange(professional)}</p>
                        </div>
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleFavorite(professional.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center self-start"
                      aria-label="Adicionar aos favoritos"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.includes(professional.id)
                            ? "fill-red-500 text-red-500"
                            : "text-zinc-400 hover:text-red-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{getAddress(professional)}</span>
                      {getDistanceDisplay(professional) && (
                        <span className="ml-2 font-bold text-primary flex-shrink-0">
                          ● {getDistanceDisplay(professional)}
                        </span>
                      )}
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
