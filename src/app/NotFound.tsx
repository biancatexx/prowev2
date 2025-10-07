 
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NotFound = () => {
  const location = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location);
  }, [location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <h2 className="mb-4 text-3xl font-bold">Página Não Encontrada</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link href={"/"}>
              <Home className="mr-2 w-5 h-5" />
              Voltar ao Início
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={"/explorar"}>
              <Search className="mr-2 w-5 h-5" />
              Explorar Profissionais
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
