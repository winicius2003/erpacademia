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
  Loader2,
  ShieldCheck,
  ClipboardHeart,
} from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'
import { differenceInDays } from 'date-fns'

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
import type { Role } from "@/services/employees"
import { SubscriptionContext, type SubscriptionUiStatus } from "@/lib/subscription-context"
import { getSubscription, type Subscription } from "@/services/subscription"
import { SubscriptionAlertBanner } from "@/components/subscription-alert-banner"


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/members", icon: Users, label: "Alunos" },
  { href: "/dashboard/workouts", icon: Dumbbell, label: "Treinos" },
  { href: "/dashboard/assessments", icon: ClipboardHeart, label: "Avaliações" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/financial", icon: Wallet, label: "Financeiro" },
  { href: "/dashboard/crm", icon: HeartHandshake, label: "CRM" },
  { href: "/dashboard/access-control", icon: UsersRound, label: "Funcionários" },
  { href: "/dashboard/reports", icon: AreaChart, label: "Relatórios" },
  { href: "/dashboard/profile", icon: Settings, label: "Configurações" },
  { href: "/dashboard/subscription", icon: ShieldCheck, label: "Assinatura" },
]

const navPermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda", "Financeiro", "CRM", "Funcionários", "Relatórios", "Assinatura", "Configurações"],
  Gestor: ["Painel", "Alunos", "Avaliações", "Agenda", "Financeiro", "CRM", "Relatórios", "Assinatura"],
  Professor: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda"],
  Recepção: ["Alunos", "Agenda", "Financeiro", "CRM", "Funcionários"],
  Estagiário: ["Alunos", "Agenda"],
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; role: Role } | null>(null)
  
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [uiStatus, setUiStatus] = React.useState<SubscriptionUiStatus>('loading');
  const [daysRemaining, setDaysRemaining] = React.useState<number | null>(null);


  const fetchSubscription = React.useCallback(async () => {
    try {
      setUiStatus('loading');
      const subData = await getSubscription();
      setSubscription(subData);

      if (subData) {
        const now = new Date();
        const expires = subData.expiresAt;
        const diff = differenceInDays(expires, now);
        setDaysRemaining(diff);

        if (diff < -5) {
          setUiStatus('blocked');
        } else if (diff < -2) {
          setUiStatus('overdue');
        } else if (diff <= 5) {
          setUiStatus('warning');
        } else {
          setUiStatus('active');
        }
      } else {
        setUiStatus('blocked'); // No subscription found, block access
      }
    } catch (error) {
      console.error("Failed to fetch subscription status", error);
      setUiStatus('blocked');
    }
  }, []);

  React.useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);
  
  React.useEffect(() => {
    try {
      const userData = sessionStorage.getItem("fitcore.user")
      if (!userData) {
        router.replace("/login")
      } else {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
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

  if (!user || uiStatus === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const subscriptionContextValue = {
    status: uiStatus,
    expiresAt: subscription ? subscription.expiresAt : null,
    plan: subscription ? subscription.plan : "N/A",
    daysRemaining,
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      <SidebarProvider>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="w-6 h-6 text-sidebar-primary" />
                <div className="flex flex-col">
                    <span className="font-bold text-lg font-headline leading-none">FitCore</span>
                    <span className="text-xs text-sidebar-foreground/70 leading-none">Academia Exemplo</span>
                </div>
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <SubscriptionAlertBanner />
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SubscriptionContext.Provider>
  )
}
