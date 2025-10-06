"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function AgendamentoSucesso() {
  const router = useRouter()

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
          <Button onClick={() => router.push("/historico")} variant="outline" className="w-full">
            Ver Meus Agendamentos
          </Button>
        </div>
      </Card>
    </div>
  )
}
