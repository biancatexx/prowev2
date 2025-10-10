"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, User, ChartPie} from "lucide-react"

export default function NavbarProfessional() {
  const pathname = usePathname()

  const links = [
    { href: "/admin/dashboard", icon: ChartPie, label: "Dashboard" },
    { href: "/admin/agenda", icon: Calendar, label: "Agenda" },
    { href: "/admin/clientes", icon: Users, label: "Clientes" },
     { href: "/admin/servicos", icon:LayoutDashboard, label: "Serviços" },
    { href: "/admin/perfil", icon: User, label: "Perfil" },
   
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50  rounded-t-3xl">
      <div className="container mx-auto max-w-screen-lg px-4">
        <div className="flex justify-around items-center py-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
