"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LoginProfissional } from "@/components/LoginProfissional"
// Importe o useAuth do seu contexto
import { useAuth } from "@/contexts/AuthContext";

export default function PageAdmin() {
    const router = useRouter();
    // Use o contexto de autenticação para checar o status do profissional
    const { professional } = useAuth();

    // Use um estado para evitar o "flash" do formulário enquanto o contexto carrega
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Checa se o objeto professional existe (usuário logado)
        if (professional) { 
            router.push('/admin/dashboard');
        } else { 
            setIsLoading(false);
        } 
    }, [professional, router]); 
    if (isLoading && !professional) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p>Verificando acesso...</p>
            </div>
        );
    }

    // Se não estiver logado (professional é null/undefined), mostra o formulário de login
    return (
        <div className="min-h-screen bg-background flex flex-col">

            <main className="flex-1 flex px-4 pt-12">
                <div className="container mx-auto max-w-md">
                    <div className="">
                        <Card className="w-full max-w-md rounded-xl p-6 shadow-xl">
                            <CardContent className="p-0">
                                <LoginProfissional />
                            </CardContent>
                        </Card>
                        <div className="flex justify-center text-center py-4">
                            <Link href="/" className="flex items-center text-center gap-2 text-foreground hover:opacity-80">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-semibold">Voltar</span>
                            </Link>
                        </div>

                    </div>
                </div>


            </main>


            {/* Footer opcional */}
            <footer className="p-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Prowe
            </footer>
        </div>
    )
}