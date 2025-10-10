// Ex: Crie este arquivo em src/components/LayoutContent.tsx ou similar
'use client';

import type React from "react"
import { usePathname } from "next/navigation"
import NavbarProfessional from "./NavbarProfessional";
import NavbarApp from "./NavbarApp";
import Link from "next/link";
import { Button } from "./ui/button";
import { Briefcase, Check } from "lucide-react";


const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();

    const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/professional");

    const NavbarComponent = isAdminArea ? NavbarProfessional : NavbarApp;

    return (
        <div className="bg-zinc-900 p-2">

            <div className="w-full">
                <nav className="">
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="flex items-center justify-between h-16">

                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <Check className="w-6 h-6 text-primary-foreground" />
                                </div>  <span className="text-xl text-white font-bold"> Prowe  </span>
                            </Link>
                            <div className="flex gap-3">
                                <Link href={"/login"}>
                                    <Button>  <Briefcase className="w-5 h-5" /> Entrar</Button>
                                </Link>
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