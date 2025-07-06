"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Building, Send, LogOut, Loader2 } from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/superadmin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/superadmin/academies", icon: Building, label: "Academias" },
  { href: "/superadmin/messaging", icon: Send, label: "Mensagens" },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null)

  React.useEffect(() => {
    try {
      const userData = sessionStorage.getItem("fitcore.user")
      if (!userData) {
        router.replace("/login")
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Superadmin') {
         // If not a superadmin, kick them out
        router.replace("/login");
      } else {
        setUser(parsedUser);
      }

    } catch (error) {
      router.replace("/login")
    }
  }, [router])
  
  const handleLogout = () => {
    sessionStorage.removeItem("fitcore.user")
    router.push("/login")
  }

  const activeItem = navItems
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname.startsWith(item.href));


  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 text-sidebar-primary" />
              <div className="flex flex-col">
                  <span className="font-bold text-lg font-headline leading-none">FitCore</span>
                  <span className="text-xs text-sidebar-foreground/70 leading-none">Super Admin</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="flex-1">
              <h1 className="text-lg font-headline">{activeItem?.label}</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2" /> Sair
            </Button>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-muted/40">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
