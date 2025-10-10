 
import { Calendar, Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-accent">Prowe</span>
            </div>
            <p className="text-sm text-secondary-foreground/80">
              Conectando você aos melhores profissionais de beleza da sua região.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href={"/explorar"} className="text-sm hover:text-accent transition-colors">
                  Explorar Profissionais
                </Link>
              </li>
              <li>
                <Link href={"/cliente/historico"} className="text-sm hover:text-accent transition-colors">
                  Agendamentos
                </Link>
              </li>
              <li>
                <Link href="/cliente/favoritos" className="text-sm hover:text-accent transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Profissionais */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Para Profissionais</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-accent transition-colors">
                  Cadastre-se
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-accent transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-accent transition-colors">
                  Planos
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Prowe. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
