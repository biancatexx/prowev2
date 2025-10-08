"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Heart, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { getProfessionals, getMockServices } from "@/data/mockData";
import NavbarApp from "@/components/NavbarApp";
import Link from "next/link";
// Removidas importações não utilizadas: Star, Bell, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  profile_image: string | null; // Corrigido para ser o nome correto da propriedade
  services?: Array<{ category: string; price: number }>;
  address: { street: string; neighborhood: string; city: string };
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

const Explorar = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawProfessionals = getProfessionals();
    const allMockServices = getMockServices();

    // Mapeamento e tipagem correta dos dados
    const loadedProfessionals: Professional[] = rawProfessionals.map((prof: any) => {
      const profServices = allMockServices.filter((s: any) => s.professionalId === prof.id);
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
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
  };

  const getAddress = (prof: Professional) => {
    if (prof.address && typeof prof.address === 'object') return `${prof.address.street}, ${prof.address.neighborhood} - ${prof.address.city}`;
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
    // Limita a exibição a 3 serviços para evitar textos longos
    return prof.services.slice(0, 3).map((s: any) => s.category).join(", ") + (prof.services.length > 3 ? "..." : "");
  };

  const filteredProfessionals = professionals.filter((prof) => {
    // A busca agora também pode incluir pesquisa dentro do nome do serviço
    const matchesSearch =
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.services?.some(s => s.category.toLowerCase().includes(searchQuery.toLowerCase()));

    // O filtro de categoria verifica se PELO MENOS um serviço do profissional
    // inclui o nome da categoria selecionada.
    const matchesCategory =
      selectedCategory === "Todos" ||
      prof.services?.some(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="bg-primary rounded-b-3xl pb-6 pt-12 px-4">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-zinc-900 leading-snug">Encontre o profissional disponível mais perto de você</h1>
            {/* Botão de Notificação removido por não ter lógica funcional */}
            {/* <div className="flex gap-2 hidden">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </button>
            </div> */}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-2 w-full max-w-4xl">
            {/* Endereço */}
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                value="Rua Paulo Candido, Jardim Cearense"
                readOnly
                name="Localizacao"
                className="pl-12 pr-10 py-4 text-lg rounded-xl border-2 border-zinc-300 focus:border-primary w-full shadow-sm"
              />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
        {/* Categories */}
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
                    ${selectedCategory === category.name
                      ? "bg-primary text-primary-foreground border-primary shadow-lg" // Estilo Ativo
                      : "bg-card text-foreground border-border hover:border-primary/50"} // Estilo Inativo
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
            <Button variant="outline" size="sm" className="rounded-full">
              <SlidersHorizontal className="mr-2 w-4 h-4" />Filtros
            </Button>
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
                    <Link href={`/profissional/${professional.id}`} className="flex-shrink-0">
                      {professional.profile_image ? (
                        <img
                          src={professional.profile_image}
                          alt={professional.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-18 h-18 mx-auto rounded-full bg-zinc-900 text-white flex items-center justify-center text-4xl font-bold border">
                          <span>{professional.name ? professional.name.charAt(0).toUpperCase() : 'P'}</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profissional/${professional.id}`}>
                        <h3 className="font-bold text-lg text-foreground mb-0">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1 truncate">{getServices(professional)}</p>
                        <p className="text-sm font-bold text-primary mb-2">{getPriceRange(professional)}</p>
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleFavorite(professional.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center self-start"
                      aria-label="Adicionar aos favoritos"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${favorites.includes(professional.id) ? "fill-red-500 text-red-500" : "text-zinc-400 hover:text-red-400"}`} />
                    </button>
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{getAddress(professional)}</span>
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
