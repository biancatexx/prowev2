"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card" // Card é opcional, mas ajuda a envolver o conteúdo
import { LoginProfissional } from "@/components/LoginProfissional" // Importe o novo componente
import { LoginCliente } from "@/components/LoginCliente" // Importe o novo componente


export default function LoginPageTabbed() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplificado, mantendo a navegação de volta */}
      <header className="p-6">
        <div className="container mx-auto max-w-md">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar para a Home</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo principal com Tabs centralizadas */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-xl p-6 shadow-xl">
          <CardContent className="p-0">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Acessar Conta</h1>
              <p className="text-muted-foreground text-sm">Selecione seu perfil para continuar</p>
            </div>

            {/* Componente Tabs do shadcn/ui */}
            <Tabs defaultValue="cliente" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
                <TabsTrigger value="profissional">Profissional</TabsTrigger>
              </TabsList>
              
              {/* Conteúdo da aba Cliente */}
              <TabsContent value="cliente" className="mt-6">
                <LoginCliente />
              </TabsContent>
              
              {/* Conteúdo da aba Profissional */}
              <TabsContent value="profissional" className="mt-6">
                <LoginProfissional />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      {/* Footer opcional */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Seu Aplicativo
      </footer>
    </div>
  )
}