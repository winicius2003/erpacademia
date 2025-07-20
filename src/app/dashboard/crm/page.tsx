
"use client"

import * as React from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { 
  PlusCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2, 
  MessageSquare,
  UserX,
  UserMinus,
  CakeSlice,
  User,
  WalletCards,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getLeads, addLead, updateLead, deleteLead, type Lead, type LeadStatus } from "@/services/crm"
import { getMembers, type Member } from "@/services/members"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"


const statusOrder: LeadStatus[] = ["Novo Lead", "Contato Iniciado", "Negociação", "Vendido", "Perdido"];
const statusLabels: Record<LeadStatus, string> = {
  "Novo Lead": "Novo Lead",
  "Contato Iniciado": "Contato Iniciado",
  "Negociação": "Em Negociação",
  "Vendido": "Vendido",
  "Perdido": "Perdido",
}

const initialFormState = {
  id: "",
  name: "",
  contact: "",
  source: "",
  status: "Novo Lead" as LeadStatus,
}
type LeadFormData = typeof initialFormState;

// Mock data for BI
const performanceData = [
    { employee: "Juliana Alves", leads: 40, sales: 12, conversion: 30, goal: 10 },
    { employee: "Ricardo Mendes", leads: 35, sales: 9, conversion: 25.7, goal: 10 },
    { employee: "Carla Silva", leads: 15, sales: 5, conversion: 33.3, goal: 4 },
];

const chartConfig = {
    sales: { label: "Vendas", color: "hsl(var(--chart-1))" },
    goal: { label: "Meta", color: "hsl(var(--chart-2))" },
};

export default function CrmPage() {
  const [leadsByStatus, setLeadsByStatus] = React.useState<Record<LeadStatus, Lead[]>>({
    "Novo Lead": [],
    "Contato Iniciado": [],
    "Negociação": [],
    "Vendido": [],
    "Perdido": [],
  });
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [leadFormData, setLeadFormData] = React.useState<LeadFormData>(initialFormState)
  
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  const fetchLeadsAndMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsData, membersData] = await Promise.all([getLeads(), getMembers()]);
      const initialGrouped = statusOrder.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {} as Record<LeadStatus, Lead[]>);
      
      const groupedLeads = leadsData.reduce((acc, lead) => {
        if (acc[lead.status]) {
            acc[lead.status].push(lead);
        }
        return acc;
      }, initialGrouped);

      setLeadsByStatus(groupedLeads);
      setMembers(membersData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchLeadsAndMembers();
  }, [fetchLeadsAndMembers]);

  const handleInputChange = (field: keyof LeadFormData, value: any) => {
    setLeadFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddNewClick = () => {
    setIsEditing(false);
    setLeadFormData(initialFormState);
    setIsDialogOpen(true);
  }
  
  const handleEditClick = (lead: Lead) => {
    setIsEditing(true);
    setLeadFormData({
      id: lead.id,
      name: lead.name,
      contact: lead.contact,
      source: lead.source,
      status: lead.status,
    });
    setIsDialogOpen(true);
  }

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteAlertOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsLoading(true);
    try {
        await deleteLead(leadToDelete.id);
        toast({ title: "Lead Excluído", description: "O lead foi removido." });
        fetchLeadsAndMembers();
    } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setLeadToDelete(null);
        setIsDeleteAlertOpen(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.name || !leadFormData.contact) {
        toast({ title: "Campos obrigatórios", variant: "destructive" });
        return;
    }
    
    const leadData = {
        name: leadFormData.name,
        contact: leadFormData.contact,
        source: leadFormData.source,
        status: leadFormData.status,
    }

    setIsLoading(true);
    try {
        if (isEditing) {
            await updateLead(leadFormData.id, leadData);
            toast({ title: "Lead Atualizado" });
        } else {
            await addLead(leadData);
            toast({ title: "Lead Adicionado" });
        }
        fetchLeadsAndMembers();
    } catch (error) {
        toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsDialogOpen(false);
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setIsLoading(true);
    try {
        await updateLead(leadId, { status: newStatus });
        fetchLeadsAndMembers();
    } catch (error) {
        toast({ title: "Erro ao mover lead", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }
  
  const getOperationalStats = () => {
    if (!members) return { overdue: [], absent: [], birthdays: [] };
    
    const overdueMembers = members.filter(m => m.status === 'Atrasado');
    const absentMembers = members.filter(m => m.attendanceStatus === 'Faltante');
    
    const today = new Date();
    
    const birthdayMembers = members.filter(m => {
        if (!m.dob) return false;
        const dobDate = new Date(m.dob.replace(/-/g, '/'));
        return dobDate.getMonth() === today.getMonth() && dobDate.getDate() === today.getDate();
    });
    
    return { overdue: overdueMembers, absent: absentMembers, birthdays: birthdayMembers };
  }

  const handleSendMessage = (phone: string, name: string, messageType: 'birthday' | 'absent' | 'overdue') => {
      if (!phone) return;
      
      const cleanedPhone = phone.replace(/\D/g, '');
      let message = '';

      if (messageType === 'birthday') {
          message = `Olá, ${name}! A equipe da Academia Exemplo deseja a você um feliz aniversário! 🎉🎂 Muitas felicidades e ótimos treinos!`;
      } else if (messageType === 'absent') {
          message = `Olá, ${name}! Sentimos sua falta aqui na Academia Exemplo. Que tal voltar a treinar com a gente e manter o foco nos seus objetivos? Estamos te esperando! 💪😊`;
      } else if (messageType === 'overdue') {
          message = `Olá, ${name}. Identificamos uma pendência em sua mensalidade na Academia Exemplo. Por favor, procure a recepção para regularizar. Agradecemos a compreensão!`;
      }

      if (!message) return;

      const fullPhone = cleanedPhone.length > 11 ? cleanedPhone : `55${cleanedPhone}`;

      const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const operationalStats = getOperationalStats();
  const biStats = {
      totalLeads: performanceData.reduce((acc, item) => acc + item.leads, 0),
      totalSales: performanceData.reduce((acc, item) => acc + item.sales, 0),
  }
  const overallConversion = biStats.totalLeads > 0 ? (biStats.totalSales / biStats.totalLeads) * 100 : 0;


  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">CRM e Relacionamento</h1>
          <p className="text-muted-foreground">Gerencie seus leads e a comunicação com os alunos.</p>
        </div>
        <Button onClick={handleAddNewClick} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />Adicionar Lead
        </Button>
      </div>

      <Tabs defaultValue="funil" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="funil">Funil de Vendas</TabsTrigger>
            <TabsTrigger value="bi">Metas e Desempenho</TabsTrigger>
            <TabsTrigger value="relacionamento">Relacionamento com Aluno</TabsTrigger>
        </TabsList>

        <TabsContent value="funil" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
              {statusOrder.map(status => (
                <div key={status} className="flex flex-col gap-4 bg-muted/50 rounded-lg p-2">
                  <h3 className="text-md font-semibold text-center pb-2 px-2">
                    {statusLabels[status]} <span className="text-muted-foreground font-normal text-sm">({leadsByStatus[status]?.length || 0})</span>
                  </h3>
                  <div className="space-y-3 min-h-[100px]">
                    {(leadsByStatus[status] || []).map(lead => (
                      <Collapsible key={lead.id} asChild>
                         <Card className="shadow-sm">
                            <div className="flex items-center p-3">
                                <CollapsibleTrigger asChild>
                                    <button className="flex-1 text-left">
                                      <CardTitle className="text-base">{lead.name}</CardTitle>
                                    </button>
                                </CollapsibleTrigger>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleEditClick(lead)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>Mover para</DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    {statusOrder.map(s => (
                                                        <DropdownMenuItem 
                                                            key={s} 
                                                            disabled={s === status} 
                                                            onSelect={() => handleStatusChange(lead.id, s)}
                                                        >
                                                            {statusLabels[s]}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => handleDeleteClick(lead)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CollapsibleContent>
                                <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                                    <p>{lead.contact}</p>
                                    <p>Origem: <Badge variant="outline">{lead.source}</Badge></p>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bi" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Conversão Geral</CardTitle>
                        <CardDescription>Este mês</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{overallConversion.toFixed(1)}%</p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">{biStats.totalSales} vendas de {biStats.totalLeads} leads.</p>
                    </CardFooter>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Desempenho da Equipe</CardTitle>
                        <CardDescription>Vendas vs. Meta Mensal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-40">
                            <BarChart data={performanceData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="employee" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="sales" name="Vendas" fill="var(--color-sales)" radius={4} />
                                <Bar dataKey="goal" name="Meta" fill="var(--color-goal)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Detalhes por Funcionário</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {performanceData.map(item => (
                            <div key={item.employee} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                <div className="md:col-span-1">
                                    <p className="font-medium">{item.employee}</p>
                                    <p className="text-sm text-muted-foreground">{item.leads} leads</p>
                                </div>
                                <div className="md:col-span-4">
                                     <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>{item.sales} vendas ({item.conversion.toFixed(1)}%)</span>
                                        <span>Meta: {item.goal}</span>
                                    </div>
                                    <Progress value={(item.sales / item.goal) * 100} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="relacionamento" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                            <CakeSlice className="h-6 w-6" /> Aniversariantes do Dia
                        </CardTitle>
                        <CardDescription>Envie uma mensagem para parabenizá-los e fortalecer o relacionamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        {operationalStats.birthdays.length > 0 ? (
                            <ul className="space-y-2">
                                {operationalStats.birthdays.map(member => (
                                    <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.phone || "Sem telefone"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleSendMessage(member.phone, member.name, 'birthday')} disabled={!member.phone} title="Enviar WhatsApp">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/dashboard/members/${member.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver Ficha">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">Nenhum aniversariante hoje.</p>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <UserMinus className="h-6 w-6" /> Alunos Faltantes
                        </CardTitle>
                        <CardDescription>Envie uma mensagem de incentivo para os alunos que não aparecem há alguns dias.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        {operationalStats.absent.length > 0 ? (
                            <ul className="space-y-2">
                                {operationalStats.absent.map(member => (
                                     <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.phone || "Sem telefone"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleSendMessage(member.phone, member.name, 'absent')} disabled={!member.phone} title="Enviar WhatsApp">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/dashboard/members/${member.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver Ficha">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">Nenhum aluno faltante nos últimos dias.</p>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <UserX className="h-6 w-6" /> Alunos Inadimplentes
                        </CardTitle>
                        <CardDescription>Entre em contato com os alunos com mensalidades em atraso.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        {operationalStats.overdue.length > 0 ? (
                            <ul className="space-y-2">
                                {operationalStats.overdue.map(member => (
                                     <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.phone || "Sem telefone"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleSendMessage(member.phone, member.name, 'overdue')} disabled={!member.phone} title="Enviar WhatsApp">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Ver Pagamentos" onClick={() => router.push(`/dashboard/financial?studentId=${member.id}&studentName=${encodeURIComponent(member.name)}`)}>
                                                <WalletCards className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/dashboard/members/${member.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver Ficha">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">Nenhum aluno inadimplente.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Lead" : "Adicionar Novo Lead"}</DialogTitle>
            </DialogHeader>
            <form id="lead-form" onSubmit={handleSaveLead}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Contato</Label>
                  <Input id="name" value={leadFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Telefone / E-mail</Label>
                  <Input id="contact" value={leadFormData.contact} onChange={(e) => handleInputChange('contact', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Origem</Label>
                  <Input id="source" value={leadFormData.source} onChange={(e) => handleInputChange('source', e.target.value)} placeholder="Ex: Instagram, Indicação" />
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" form="lead-form" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isEditing ? "Salvar" : "Adicionar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o lead <span className="font-semibold">{leadToDelete?.name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  )
}

    