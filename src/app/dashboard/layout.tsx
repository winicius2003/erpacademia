"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Settings,
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  Globe,
  Calendar,
  Wallet,
  HeartHandshake,
  AreaChart,
  UsersRound,
  Loader2
} from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import type { Role } from "./access-control/page"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/members", icon: Users, label: "Alunos" },
  { href: "/dashboard/workouts", icon: Dumbbell, label: "Treinos" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/financial", icon: Wallet, label: "Financeiro" },
  { href: "/dashboard/crm", icon: HeartHandshake, label: "CRM" },
  { href: "/dashboard/access-control", icon: UsersRound, label: "Funcionários" },
  { href: "/dashboard/reports", icon: AreaChart, label: "Relatórios" },
  { href: "/dashboard/profile", icon: Settings, label: "Configurações" },
]

const navPermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Agenda", "Financeiro", "CRM", "Funcionários", "Relatórios", "Configurações"],
  Gestor: ["Painel", "Alunos", "Agenda", "Financeiro", "CRM", "Relatórios"],
  Professor: ["Painel", "Alunos", "Treinos", "Agenda"],
  Recepção: ["Alunos", "Agenda", "Financeiro", "CRM", "Funcionários"],
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; role: Role } | null>(null)
  
  React.useEffect(() => {
    try {
      const userData = sessionStorage.getItem("fitcore.user")
      if (!userData) {
        router.replace("/login")
      } else {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      // In case of any error (e.g. sessionStorage not available), redirect to login
      router.replace("/login")
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("fitcore.user")
    router.push("/login")
  }
  
  const visibleNavItems = user ? navItems.filter(item => {
    const permissions = navPermissions[user.role] || []
    return permissions.includes(item.label)
  }) : []

  const activeItem = navItems.find(item => pathname.startsWith(item.href))

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 text-sidebar-primary" />
              <span className="font-bold text-lg font-headline">FitCore</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2 w-full px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">Unidade Principal</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>Trocar Unidade</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Unidade Centro</DropdownMenuItem>
                <DropdownMenuItem>Unidade Bairro</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              <h1 className="text-lg font-headline hidden md:block">
                {activeItem?.label}
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person face" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Faturamento</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
