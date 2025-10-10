'use client';

import type React from "react"
import { usePathname } from "next/navigation"
import NavbarProfessional from "./NavbarProfessional";
import NavbarApp from "./NavbarApp";
import Link from "next/link";
import { Button } from "./ui/button";
import { Briefcase, Check } from "lucide-react";
// Importe o hook de autenticação.
import { useAuth } from "@/contexts/AuthContext"; 


const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Acesse os dois tipos de usuário do contexto
    const { user, professional } = useAuth();
    
    const pathname = usePathname();

    // 2. Define se estamos na área administrativa/profissional
    const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/professional");

    const NavbarComponent = isAdminArea ? NavbarProfessional : NavbarApp;

    // Função auxiliar para pegar o primeiro nome de um nome completo
    const getFirstName = (fullName: string | undefined): string | null => {
        if (!fullName) return null;
        // Retorna a primeira palavra do nome
        return fullName.split(' ')[0] || fullName;
    };
    
    // 3. Lógica para determinar o usuário logado e o link de perfil
    let authContent = null;

    if (isAdminArea) {
        // Se estiver na área Admin/Professional:
        if (professional) {
            const userName = getFirstName(professional.name);
            authContent = (
                <Link href="/admin/perfil" className="text-white text-base font-semibold hover:text-primary transition-colors">
                    Olá, {userName} 👋
                </Link>
            );
        }
    } else {
        // Se estiver na área de Cliente (NavbarApp):
        if (user) {
            const userName = getFirstName(user.name);
            authContent = (
                <Link href="/cliente/perfil" className="text-white text-base font-semibold hover:text-primary transition-colors">
                    Olá, {userName} 👋
                </Link>
            );
        }
    }

    // 4. Conteúdo Padrão (Botão Entrar) se NINGUÉM estiver logado na rota atual
    if (!authContent) {
        // O botão Entrar deve sempre levar para o login padrão.
        authContent = (
            <Link href={"/login"}>
                <Button> 
                    <Briefcase className="w-5 h-5 mr-1" /> Entrar
                </Button>
            </Link>
        );
    }
    
    return (
        <div className="bg-zinc-900 px-2">

            <div className="w-full">
                <nav className="">
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="flex items-center justify-between h-16">

                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <Check className="w-6 h-6 text-primary-foreground" />
                                </div> 
                                <span className="text-xl text-white font-bold"> Prowe </span>
                            </Link>
                            <div className="flex gap-3">
                                {/* 5. Renderização final do conteúdo de autenticação */}
                                {authContent}
                            </div> 
                        </div> 
                    </div>
                </nav>
                <main className="bg-background flex-1 overflow-y-auto rounded-[calc(var(--radius)*4)] px-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutContent;