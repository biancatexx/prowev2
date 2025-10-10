"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { LoginCliente } from "@/components/LoginCliente"

export default function PageCliente() {
    return (
        <div className="min-h-screen bg-background flex flex-col">

            <main className="flex-1 flex px-4 pt-12">
                <div className="container mx-auto max-w-md">
                    <div className="">
                        <Card className="w-full max-w-md rounded-xl p-6 shadow-xl">
                            <CardContent className="p-0"> 
                                <LoginCliente />
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