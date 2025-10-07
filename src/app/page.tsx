"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Heart, Search, SlidersHorizontal, Bell, ChevronDown } from "lucide-react";
import { getProfessionals, mockServices } from "@/data/mockData"; 
import NavbarApp from "@/components/NavbarApp";
import Link from "next/link";

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  address_city: string | null;
  address_street: string | null;
  address_neighborhood: string | null;
  profile_image: string | null;
  services?: Array<{
    category: string;
    price: number;
  }>;
  address: {
    street: string;
    neighborhood: string;
    city: string;
  };
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

const Explorar = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawProfessionals = getProfessionals();
    const loadedProfessionals: Professional[] = rawProfessionals.map((prof: any) => {
      const profServices = mockServices.filter(s => s.professionalId === prof.id);
      return {
        ...prof,
        address: prof.address || { street: "N/A", neighborhood: "N/A", city: "N/A" }, 
        services: profServices
      };
    }) as Professional[];
    setProfessionals(loadedProfessionals);
    setLoading(false);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const getAddress = (prof: any) => {
    if (prof.address && typeof prof.address === 'object') {
      return `${prof.address.street}, ${prof.address.neighborhood} - ${prof.address.city}`;
    }
    return "Endereço não informado";
  };

  const getPriceRange = (prof: any) => {
    if (!prof.services || prof.services.length === 0) return "Consultar preços";
    const prices = prof.services.map((s: any) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `R$ ${min.toFixed(0)} - R$ ${max.toFixed(0)}`;
  };

  const getServices = (prof: any) => {
    if (!prof.services || prof.services.length === 0) return "Serviços não informados";
    return prof.services.map((s: any) => s.category).join(", ");
  };

  const filteredProfessionals = professionals.filter((prof: any) => {
    const matchesSearch = prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" ||
      prof.services?.some((s: any) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-zinc-800">Encontre o profissional disponível mais perto de você</h1>
            <div className="flex gap-2 hidden">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button className="flex items-center text-zinc-700 mb-6 hover:text-zinc-900">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">Rua Paulo Candido, Jardim Cearense</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <div className="mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por serviço, profissional ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </header>
      <section className="py-12">
        <div className="container mx-auto max-w-screen-lg px-">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Profissionais Perto de Você</h2>
              <p className="text-muted-foreground mt-1">
                {loading ? "Carregando..." : `${filteredProfessionals.length} profissionais encontrados`}
              </p>
            </div>
            <Button variant="outline" size="default">
              <SlidersHorizontal className="mr-2 w-4 h-4" />
              Filtros
            </Button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando profissionais...</p>
            ) : filteredProfessionals.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum profissional encontrado.</p>
            ) : (
              filteredProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <Link href={`/profissional/${professional.id}`} className="flex-shrink-0">
                      <img
                        src={(professional as any).profileImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop"}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profissional/${professional.id}`}>
                        <h3 className="font-bold text-foreground mb-1">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {getServices(professional)}
                        </p>
                        <p className="text-sm font-semibold text-foreground mb-2">
                          {getPriceRange(professional)}
                        </p>
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleFavorite(professional.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                      aria-label="Adicionar aos favoritos"
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites.includes(professional.id)
                          ? "fill-red-500 text-red-500"
                          : "text-zinc-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="border-t border-border mt-2 pt-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{getAddress(professional)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <NavbarApp />
    </div>
  );
};

export default Explorar;
