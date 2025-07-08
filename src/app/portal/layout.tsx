
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, User } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/portal/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/portal/profile", icon: User, label: "Meu Perfil" },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true);


  React.useEffect(() => {
    try {
      const userData = sessionStorage.getItem("fitcore.user")
      if (!userData) {
        router.replace("/login")
        return;
      }
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Aluno') {
        router.replace("/login");
      } else {
        setUser(parsedUser)
      }
    } catch (error) {
      router.replace("/login")
    } finally {
        setIsLoading(false);
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("fitcore.user")
    router.push("/login")
  }
  
  if (isLoading || !user) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r bg-muted/40 flex flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/portal/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span>Portal do Aluno</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
