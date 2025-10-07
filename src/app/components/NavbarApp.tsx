import Link from "next/link";
import { Home as HomeIcon, Calendar, Heart, User } from "lucide-react";
import { usePathname } from "next/navigation";

const NavbarApp = () => { 
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const navLinks = [
    { path: "/", label: "Explorar", icon: HomeIcon },
    { path: "/historico", label: "Agendamentos", icon: Calendar },
    { path: "/favoritos", label: "Favoritos", icon: Heart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 safe-area-bottom z-50">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-around py-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive(link.path) ? "text-purple-300" : "text-zinc-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive(link.path)
                      ? "text-purple-300 font-semibold"
                      : "text-zinc-400"
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
