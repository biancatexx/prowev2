"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() { 

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <h2 className="mb-4 text-xl font-bold">Página Não Encontrada</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero"   asChild>
            <Link href="/">
              <Home className="mr-2 w-5 h-5" />
              Voltar ao Início
            </Link>
          </Button>
          
        </div>
      </div>
    </div>
  );
}
