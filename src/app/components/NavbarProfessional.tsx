"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, User, ChartPie } from "lucide-react"

export default function NavbarProfessional() {
  const pathname = usePathname()

  // ✅ Lógica de subpastas atualizada (como no NavbarApp)
  const isActiveLink = (path: string) => {
    // Verifica a correspondência exata para a raiz (se necessário, ou use startsWith para tudo)
    // Para rotas admin, geralmente 'startsWith' é melhor para sub-rotas como /admin/agenda/detalhes
    if (path === "/admin/dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/admin/dashboard", icon: ChartPie, label: "Dashboard" },
    { href: "/admin/agenda", icon: Calendar, label: "Agenda" },
    { href: "/admin/clientes", icon: Users, label: "Clientes" },
    { href: "/admin/servicos", icon: LayoutDashboard, label: "Serviços" },
    { href: "/admin/perfil", icon: User, label: "Perfil" },
  ];

  // Definições de classes para melhor clareza
  const activeText = "text-primary";
  const inactiveText = "text-muted-foreground";

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom z-50 rounded-t-3xl bg-white">
      <div className="container mx-auto max-w-screen-lg px-4">
        <div className="flex justify-around items-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-1 px-2 py-2 transition-all"
              >
                {/* Estrutura do ícone com fundo no item ativo */}
                <div
                  className={`flex items-center justify-center p-3 rounded-full transition-all ${active && "bg-primary/20" // Aplica o fundo no item ativo
                    }`}
                >
                  <Icon
                    className={`w-6 h-6 ${active ? activeText : inactiveText // Cor do ícone
                      }`}
                  />
                </div>

                {/* Cor do texto */}
                <span
                  className={`text-xs font-medium ${active ? activeText : inactiveText // Cor do texto
                    }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}