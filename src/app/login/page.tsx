"use client"

import Link from "next/link"
import { Users, HardHat, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Importações completas do Card

// Removidas as importações de Tabs e os componentes Login, pois não são mais necessários
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { LoginProfissional } from "@/components/LoginProfissional"
// import { LoginCliente } from "@/components/LoginCliente"

/**
 * Componente de Card de Seleção.
 * @param {object} props
 * @param {string} props.href - O link de destino.
 * @param {React.ReactNode} props.icon - O ícone do card.
 * @param {string} props.title - O título do card.
 * @param {string} props.description - A descrição breve.
 */
const SelectionCard = ({ href, icon, title, description }) => (
  <Link href={href} className="w-full sm:w-80 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
    <Card className="h-full border-2 border-transparent hover:border-primary/50 cursor-pointer rounded-xl p-4 shadow-xl">
      <CardHeader className="flex flex-col items-center p-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-center text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  </Link>
)

export default function LoginPageSelector() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Conteúdo principal centralizado */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">

        <div className="flex flex-col items-center justify-center max-w-4xl w-full space-y-8">

          {/* Título de boas-vindas */}
          <h1 className="text-4xl font-extrabold text-center mb-6 text-foreground">
            Como você deseja prosseguir?
          </h1>

          {/* Container dos Cards: Flexbox para centralizar e alinhar horizontalmente */}
          <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">

            {/* Card de Cliente */}
            <SelectionCard
              href="/cliente"
              icon={<Users className="w-8 h-8" />}
              title="Sou Cliente"
              description="Contrate serviços, acompanhe seus pedidos e gerencie orçamentos."
            />

            {/* Card de Profissional */}
            <SelectionCard
              href="/admin"
              icon={<HardHat className="w-8 h-8" />}
              title="Sou Profissional"
              description="Acesse seu painel, gerencie projetos e encontre novas oportunidades."
            />

          </div>

          {/* Link de volta */}
          <div className="pt-6">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Voltar à Página Inicial</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer opcional */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} Prowe
      </footer>
    </div>
  )
}