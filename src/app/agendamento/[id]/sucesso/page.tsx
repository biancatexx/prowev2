"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function AgendamentoSucesso() {
  const router = useRouter()

  // 🔑 Removemos a lógica de passar o WhatsApp na query string, pois o
  // login já foi feito no passo anterior e a sessão está ativa no AuthContext.
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Agendamento Confirmado!</h1>
        <p className="text-muted-foreground mb-6">
          Seu agendamento foi realizado com sucesso. Você receberá uma confirmação no WhatsApp cadastrado.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push("/")} className="w-full">
            Voltar para Início
          </Button>
          {/* O clique redireciona para o histórico. Como o usuário está logado,
              o histórico carrega automaticamente os agendamentos dele. */}
          <Button onClick={() => router.push("/cliente/historico")} variant="outline" className="w-full">
            Ver Meus Agendamentos
          </Button>
        </div>
      </Card>
    </div>
  )
}