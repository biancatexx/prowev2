import Link from "next/link";
import { Home as HomeIcon, Calendar, Heart, User } from "lucide-react";
import { usePathname } from "next/navigation";

const NavbarApp = () => {
  const pathname = usePathname();

  // ✅ Mantém a lógica de subpastas
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Explorar", icon: HomeIcon },
    { path: "/cliente/historico", label: "Agendamentos", icon: Calendar },
    { path: "/cliente/favoritos", label: "Favoritos", icon: Heart },
    { path: "/cliente/perfil", label: "Perfil", icon: User },
  ];

  const inactiveText = "text-zinc-400";
  const activeText = "text-primary ";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 safe-area-bottom z-50 rounded-t-3xl">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className="flex flex-col items-center gap-1 px-2 py-2 transition-all"
              >
                <div
                  className={`flex items-center justify-center p-3 rounded-full transition-all ${
                    active && "bg-primary/20"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      active ? activeText : inactiveText
                    }`}
                  />
                </div>

                <span
                  className={`text-xs ${
                    active ? activeText : inactiveText
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
};

export default NavbarApp;
