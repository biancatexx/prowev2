// Ex: Crie este arquivo em src/components/LayoutContent.tsx ou similar
'use client';

import type React from "react"
import { usePathname } from "next/navigation"
import NavbarProfessional from "./NavbarProfessional";
import NavbarApp from "./NavbarApp";


const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();

    const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/professional");

    const NavbarComponent = isAdminArea ? NavbarProfessional : NavbarApp;

    return (
        <div className="f bg-zinc-900 p-2">
            <div className="w-full">
                <main className="flex-1 overflow-y-auto rounded-[calc(var(--radius)*4)]">
                    {children} 
                </main>
            </div>
        </div>
    );
};

export default LayoutContent;