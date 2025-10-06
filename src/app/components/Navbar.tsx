"use client"
import { useState } from "react"; 
import { Menu, X, Calendar, Heart, User, Search, Check, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { path: "/explorar", label: "Explorar", icon: Search },
    { path: "/historico", label: "Histórico", icon: Calendar },
    { path: "/favoritos", label: "Favoritos", icon: Heart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <Check className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl text-zinc-800 font-bold from-primary to-secondary bg-clip-text text-transparent">
              Prowe
            </span>
          </Link>



          {/* CTA Button Desktop */}

          <div className="flex gap-3">

            <Link href={"/login"}>
              <Button variant="outline">    <Briefcase className="w-5 h-5 text-primary" /> Sou Profissional</Button>
            </Link>

          </div>

          <div className="hidden" id="v-mobile">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top duration-300">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link href="/explorar" onClick={() => setIsOpen(false)}>
                    Agendar Agora
                  </Link>
                </Button>
              </div>

            </div>
          )}
        </div>


      </div>
    </nav>
  );
};

export default Navbar;
