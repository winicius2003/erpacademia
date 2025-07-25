
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
  Gem,
  HeartPulse,
  Tags,
  ShoppingBasket,
  Bell,
  LifeBuoy,
  Info,
  MessageSquare,
  Handshake,
  FileClock,
  Search,
  ScanFace,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandList, CommandItem, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import type { Role } from "@/services/employees"
import { SubscriptionContext, type SubscriptionUiStatus } from "@/lib/subscription-context"
import { getSubscription, type Subscription } from "@/services/subscription"
import { SubscriptionAlertBanner } from "@/components/subscription-alert-banner"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getNotificationsForAcademy, type Notification as NotificationType } from "@/services/notifications"
import { getMembers, type Member } from "@/services/members"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/members", icon: Users, label: "Alunos" },
  { href: "/dashboard/workouts", icon: Dumbbell, label: "Treinos" },
  { href: "/dashboard/assessments", icon: HeartPulse, label: "Avaliações" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/financial", icon: Wallet, label: "Financeiro (Geral)", altLabel: "Financeiro", permissionLabel: "Financeiro (Geral)" },
  { href: "/dashboard/financial", icon: Wallet, label: "Financeiro (Pessoal)", altLabel: "Financeiro", permissionLabel: "Financeiro (Pessoal)" },
  { href: "/dashboard/crm", icon: HeartHandshake, label: "CRM" },
  { href: "/dashboard/frequency", icon: FileClock, label: "Frequência" },
  { href: "/dashboard/facial-recognition", icon: ScanFace, label: "Reconhecimento Facial" },
  { href: "/dashboard/access-control", icon: UsersRound, label: "Colaboradores" },
  { href: "/dashboard/reports", icon: AreaChart, label: "Relatórios" },
  { href: "/dashboard/gympass", icon: Handshake, label: "Gympass" },
  { href: "/dashboard/plans", icon: Tags, label: "Planos" },
  { href: "/dashboard/products", icon: ShoppingBasket, label: "Produtos" },
  { href: "/dashboard/profile", icon: Settings, label: "Configurações" },
  { href: "/dashboard/subscription", icon: Gem, label: "Assinatura" },
]

export const navPermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda", "Financeiro (Geral)", "CRM", "Colaboradores", "Relatórios", "Configurações", "Assinatura", "Gympass", "Planos", "Produtos", "Frequência", "Reconhecimento Facial"],
  Gerente: ["Painel", "Alunos", "Agenda", "Financeiro (Pessoal)", "CRM", "Colaboradores"],
  Gestor: ["Painel", "Alunos", "Avaliações", "Agenda", "Financeiro (Geral)", "CRM", "Relatórios", "Planos", "Produtos", "Assinatura", "Gympass", "Frequência", "Reconhecimento Facial"],
  Professor: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda"],
  "Personal Trainer Externo": ["Painel", "Alunos", "Treinos", "Avaliações"],
  Recepção: ["Alunos", "Agenda", "Financeiro (Pessoal)", "CRM", "Produtos", "Reconhecimento Facial"],
  Estagiário: ["Alunos", "Agenda", "Treinos"],
  Impressão: [],
};

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
  const [currentUnit, setCurrentUnit] = React.useState("Unidade Principal");


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
    return permissions.includes(item.permissionLabel || item.label)
  }).reduce((acc, item) => {
    // This logic prevents duplicate "Financeiro" items from showing up
    const altLabel = item.altLabel || item.label;
    if (!acc.find(i => (i.altLabel || i.label) === altLabel)) {
        acc.push(item);
    }
    return acc;
  }, [] as typeof navItems) : []

  const activeItem = navItems
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname.startsWith(item.href));


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

  const GlobalSearch = () => {
    const [open, setOpen] = React.useState(false)
    const [members, setMembers] = React.useState<Member[]>([])
    const router = useRouter()

    React.useEffect(() => {
      getMembers().then(setMembers)
    }, [])
  
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        }
      }
  
      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-96"
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline-flex">Buscar funcionalidades ou alunos...</span>
            <span className="inline-flex lg:hidden">Buscar...</span>
            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Digite um comando ou pesquise..." autoFocus />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup heading="Funcionalidades">
                {visibleNavItems.map((navItem) => (
                  <CommandItem
                    key={navItem.href}
                    value={navItem.label}
                    onSelect={() => {
                      runCommand(() => router.push(navItem.href))
                    }}
                  >
                    <navItem.icon className="mr-2 h-4 w-4" />
                    {navItem.altLabel || navItem.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Alunos">
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.name}
                    onSelect={() => {
                      runCommand(() => router.push(`/dashboard/members/${member.id}`))
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {member.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

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
                        tooltip={item.altLabel || item.label}
                      >
                        <item.icon />
                        <span>{item.altLabel || item.label}</span>
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
                    <span className="truncate">{currentUnit}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>Trocar Unidade</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setCurrentUnit("Unidade Principal")}>Unidade Principal</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setCurrentUnit("Unidade Centro")}>Unidade Centro</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                 <h1 className="font-semibold text-lg">{activeItem?.altLabel || activeItem?.label}</h1>
              </div>

              <div className="flex flex-1 justify-center">
                 <GlobalSearch />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <HelpCenter />
                <Notifications />
              
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
              </div>
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

function Notifications() {
    const [notifications, setNotifications] = React.useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Hardcoding academyId for demo purposes. In a real app, this would come from the user's session.
    const ACADEMY_ID = 'gym-1'; 

    const fetchNotifications = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getNotificationsForAcademy(ACADEMY_ID);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    return (
        <Sheet>
            <SheetTrigger asChild>
                 <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                    <span className="sr-only">Abrir notificações</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Notificações</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                           <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((item) => (
                         <div key={item.id} className="flex items-start gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-full">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                   {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: ptBR })}
                                </p>
                            </div>
                         </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Nenhuma notificação nova.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function HelpCenter() {
    const { toast } = useToast();

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Chamado Enviado com Sucesso!",
            description: "Nossa equipe de suporte entrará em contato em breve."
        })
    }
    return (
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <LifeBuoy className="h-4 w-4" />
                    <span className="sr-only">Abrir central de ajuda</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Central de Ajuda</DialogTitle>
                    <DialogDescription>
                        Encontre respostas, tutoriais e entre em contato com nosso suporte.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="faq" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="faq"><MessageSquare className="mr-2"/> Dúvidas</TabsTrigger>
                        <TabsTrigger value="about"><Info className="mr-2"/> Sobre</TabsTrigger>
                        <TabsTrigger value="support"><LifeBuoy className="mr-2"/> Suporte</TabsTrigger>
                    </TabsList>
                    <TabsContent value="faq" className="mt-4">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Como cadastro um novo aluno?</AccordionTrigger>
                                <AccordionContent>
                                    Vá para a seção "Alunos" no menu lateral, clique em "Adicionar Aluno" e preencha o formulário com os dados do aluno.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>Como registro um pagamento?</AccordionTrigger>
                                <AccordionContent>
                                    Acesse a seção "Financeiro", clique em "Registrar Pagamento", selecione o aluno, os itens e confirme o valor. A fatura será gerada automaticamente.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Onde configuro a integração com a catraca?</AccordionTrigger>
                                <AccordionContent>
                                   Em "Configurações" (ícone de engrenagem), você encontrará a seção "Integração de Hardware" para informar o IP e as credenciais da sua catraca.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </TabsContent>
                    <TabsContent value="about" className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-lg font-headline">O que é o FitCore?</h3>
                        <p className="text-muted-foreground mt-2">
                            O FitCore é um sistema de gestão completo (SaaS) projetado para academias e estúdios. Nossa missão é simplificar sua operação diária, automatizando tarefas desde o controle financeiro e de acesso de alunos até a criação de treinos e o gerenciamento de múltiplas unidades. Focamos em uma interface intuitiva e ferramentas poderosas para que você possa se concentrar no que realmente importa: o sucesso dos seus alunos e do seu negócio.
                        </p>
                    </TabsContent>
                    <TabsContent value="support" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold">Informações de Contato</h3>
                                <p className="text-sm text-muted-foreground">Precisa de ajuda urgente? Entre em contato conosco.</p>
                                <p className="text-sm"><strong>E-mail:</strong> suporte@fitcore.com</p>
                                <p className="text-sm"><strong>Telefone:</strong> (11) 4002-8922</p>
                                <p className="text-sm"><strong>Horário:</strong> Seg a Sex, das 9h às 18h.</p>
                            </div>
                            <form className="space-y-4" onSubmit={handleSupportSubmit}>
                                <h3 className="font-semibold">Abrir um Chamado</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Assunto</Label>
                                    <Input id="subject" placeholder="Ex: Dúvida sobre faturamento" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="message">Sua Mensagem</Label>
                                    <Textarea id="message" placeholder="Descreva sua dúvida ou problema em detalhes." />
                                </div>
                                <Button type="submit" className="w-full">Enviar Chamado</Button>
                            </form>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
