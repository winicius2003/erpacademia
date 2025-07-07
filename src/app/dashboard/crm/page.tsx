
"use client"

import * as React from "react"
import Link from "next/link"
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
} from "lucide-react"

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
  DialogDescription,
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

function OperationalStat({ title, icon: Icon, members, theme, emptyText, messageType }: { title: string, icon: React.ElementType, members: Member[], theme: {bg: string, text: string}, emptyText: string, messageType?: 'birthday' | 'absent' }) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleSendMessage = (phone: string, name: string) => {
        if (!phone || !messageType) return;
        
        const cleanedPhone = phone.replace(/\D/g, '');
        let message = '';

        if (messageType === 'birthday') {
            message = `Olá, ${name}! A equipe da Academia Exemplo deseja a você um feliz aniversário! 🎉🎂 Muitas felicidades e ótimos treinos!`;
        } else if (messageType === 'absent') {
            message = `Olá, ${name}! Sentimos sua falta aqui na Academia Exemplo. Que tal voltar a treinar com a gente e manter o foco nos seus objetivos? Estamos te esperando! 💪😊`;
        }

        if (!message) return;

        const fullPhone = cleanedPhone.length > 11 ? cleanedPhone : `55${cleanedPhone}`;

        const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <div 
                className="block p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => members.length > 0 && setIsDialogOpen(true)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${theme.bg}`}>
                       <Icon className={`h-6 w-6 ${theme.text}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{members.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Lista de alunos correspondentes a este critério.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                        {members.length > 0 ? (
                            <ul className="space-y-2">
                                {members.map(member => (
                                    <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                {member.phone ? (
                                                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                                                ) : (
                                                    <p className="text-xs italic text-muted-foreground">Sem telefone</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {messageType && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSendMessage(member.phone, member.name)}
                                                    disabled={!member.phone}
                                                    title={!member.phone ? "Telefone não cadastrado" : "Enviar mensagem no WhatsApp"}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="hidden sm:inline ml-1">WhatsApp</span>
                                                </Button>
                                            )}
                                            <Link href={`/dashboard/members/${member.id}`} legacyBehavior>
                                              <a onClick={() => setIsDialogOpen(false)}>
                                                <Button variant="ghost" size="sm">Ver Ficha</Button>
                                              </a>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">{emptyText}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

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
  
  const operationalStats = getOperationalStats();


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

      <Tabs defaultValue="funil">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="funil">Funil de Vendas</TabsTrigger>
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
                      <Card key={lead.id} className="shadow-sm">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{lead.name}</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                          <p>{lead.contact}</p>
                          <p>Origem: <Badge variant="outline">{lead.source}</Badge></p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="relacionamento" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Avisos Operacionais do Dia</CardTitle>
                    <CardDescription>Resumo rápido das principais ações de relacionamento para hoje.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <OperationalStat 
                      title="Alunos Inadimplentes"
                      icon={UserX}
                      members={operationalStats.overdue}
                      theme={{ bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' }}
                      emptyText="Nenhum aluno inadimplente hoje."
                    />
                    <OperationalStat 
                      title="Alunos Faltantes"
                      icon={UserMinus}
                      members={operationalStats.absent}
                      theme={{ bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300' }}
                      emptyText="Nenhum aluno faltante nos últimos dias."
                      messageType="absent"
                    />
                    <OperationalStat 
                      title="Aniversariantes do Dia"
                      icon={CakeSlice}
                      members={operationalStats.birthdays}
                      theme={{ bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-600 dark:text-sky-300' }}
                      emptyText="Nenhum aniversariante hoje."
                      messageType="birthday"
                    />
                </CardContent>
            </Card>
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
              <Button type="submit" form="lead-form" disabled={isLoading}>{isEditing ? "Salvar" : "Adicionar"}</Button>
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

    