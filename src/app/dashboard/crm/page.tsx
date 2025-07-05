"use client"

import * as React from "react"
import { PlusCircle, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react"

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
  DropdownMenuPortal
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


export default function CrmPage() {
  const [leadsByStatus, setLeadsByStatus] = React.useState<Record<LeadStatus, Lead[]>>({
    "Novo Lead": [],
    "Contato Iniciado": [],
    "Negociação": [],
    "Vendido": [],
    "Perdido": [],
  });
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [leadFormData, setLeadFormData] = React.useState<LeadFormData>(initialFormState)
  
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  const fetchLeads = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const leadsData = await getLeads();
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
    } catch (error) {
      toast({
        title: "Erro ao carregar leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
        fetchLeads();
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
        fetchLeads();
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
        fetchLeads();
    } catch (error) {
        toast({ title: "Erro ao mover lead", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Funil de Vendas (CRM)</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades de venda.</p>
        </div>
        <Button onClick={handleAddNewClick} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />Adicionar Lead
        </Button>
      </div>

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
