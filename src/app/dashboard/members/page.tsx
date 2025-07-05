
"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getMembers, addMember, updateMember, deleteMember } from "@/services/members"
import { useSubscription } from "@/lib/subscription-context"

export type Member = {
  id: string,
  name: string,
  email: string,
  phone: string,
  plan: string,
  status: "Ativo" | "Inativo" | "Atrasado",
  expires: string,
  cpf: string,
  rg: string,
  professor: string,
  attendanceStatus: "Presente" | "Faltante",
  workoutStatus: "Completo" | "Pendente",
  goal: string,
  notes: string,
};

const initialMemberFormState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  dob: undefined as Date | undefined,
  cpf: "",
  rg: "",
  plan: "Mensal",
  expires: new Date() as Date | undefined,
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
  },
  emergencyContact: {
    name: "",
    phone: "",
  },
  goal: "",
  notes: "",
}

type MemberFormData = typeof initialMemberFormState;

export default function MembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { status: subscriptionStatus } = useSubscription()

  const [members, setMembers] = React.useState<Member[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [memberFormData, setMemberFormData] = React.useState<MemberFormData>(initialMemberFormState)
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  const isAddingBlocked = subscriptionStatus === 'blocked';

  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar alunos",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);


  React.useEffect(() => {
    const userData = sessionStorage.getItem("fitcore.user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
       router.replace("/login")
    }
  }, [router]);

  React.useEffect(() => {
    if (!user) return;

    let displayList = members;

    if (searchQuery) {
      displayList = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (user.role === 'Professor') {
      displayList = members.filter(m => m.professor === user.name);
    }
    
    setFilteredMembers(displayList);
  }, [members, user, searchQuery]);


  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setMemberFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (category: 'address' | 'emergencyContact', field: string, value: string) => {
    setMemberFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleAddNewClick = () => {
    setIsEditing(false);
    setMemberFormData(initialMemberFormState);
    setIsDialogOpen(true);
  }

  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    const expiresDate = member.expires ? new Date(member.expires.replace(/-/g, '/')) : undefined;
    
    setMemberFormData({
      ...initialMemberFormState,
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      cpf: member.cpf,
      rg: member.rg,
      plan: member.plan,
      expires: expiresDate,
      goal: member.goal || "",
      notes: member.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberFormData.name || !memberFormData.plan || !memberFormData.expires || !memberFormData.email) return

    const memberDataToSave = {
        name: memberFormData.name,
        email: memberFormData.email,
        phone: memberFormData.phone,
        cpf: memberFormData.cpf,
        rg: memberFormData.rg,
        plan: memberFormData.plan,
        expires: format(memberFormData.expires!, "yyyy-MM-dd"),
        status: "Ativo" as const,
        professor: "Não atribuído",
        attendanceStatus: "Presente" as const,
        workoutStatus: "Pendente" as const,
        goal: memberFormData.goal,
        notes: memberFormData.notes,
    };

    setIsLoading(true);
    try {
        if (isEditing) {
            await updateMember(memberFormData.id, memberDataToSave);
            toast({ title: "Aluno Atualizado", description: "Os dados do aluno foram atualizados com sucesso." });
        } else {
            await addMember(memberDataToSave);
            toast({ title: "Aluno Adicionado", description: "O novo aluno foi cadastrado com sucesso." });
        }
        fetchMembers();
    } catch (error) {
        toast({ title: "Erro", description: `Não foi possível salvar o aluno.`, variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsDialogOpen(false);
    }
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsLoading(true);
    try {
        await deleteMember(memberToDelete.id);
        toast({ title: "Aluno Excluído", description: "O aluno foi removido do sistema." });
        fetchMembers();
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover o aluno.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setMemberToDelete(null);
        setIsDeleteAlertOpen(false);
    }
  };

  const handleViewProfile = (member: Member) => {
    router.push(`/dashboard/members/${member.id}`);
  };

  const handleViewPayments = (member: Member) => {
    router.push(`/dashboard/financial?studentId=${member.id}&studentName=${encodeURIComponent(member.name)}`);
  };

  if (!user || isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
              <div className="flex-1">
                <CardTitle className="font-headline">Alunos</CardTitle>
                <CardDescription>
                  {user.role === 'Professor' ? 'Pesquise por alunos ou gerencie os seus.' : 'Gerencie os alunos da sua academia.'}
                </CardDescription>
              </div>
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar aluno..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {user.role !== 'Professor' && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNewClick} disabled={isAddingBlocked} title={isAddingBlocked ? "Funcionalidade bloqueada por pendência de assinatura" : ""}>
                        <PlusCircle className="mr-2 h-4 w-4" />Adicionar Aluno
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</DialogTitle>
                        <DialogDescription>
                          {isEditing ? 'Atualize os dados do aluno.' : 'Preencha a ficha completa do aluno.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form id="add-member-form" onSubmit={handleSaveMember}>
                        <Tabs defaultValue="personal-data">
                          <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="personal-data">Dados Pessoais</TabsTrigger>
                              <TabsTrigger value="address">Endereço</TabsTrigger>
                              <TabsTrigger value="emergency">Emergência</TabsTrigger>
                          </TabsList>
                          <TabsContent value="personal-data" className="py-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                      <Label htmlFor="name">Nome Completo</Label>
                                      <Input id="name" value={memberFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nome do aluno" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="email">E-mail</Label>
                                      <Input id="email" type="email" value={memberFormData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="phone">WhatsApp</Label>
                                      <Input id="phone" type="tel" value={memberFormData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(99) 99999-9999" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="dob">Nascimento</Label>
                                      <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !memberFormData.dob && "text-muted-foreground")}>
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {memberFormData.dob ? format(memberFormData.dob, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                          <Calendar mode="single" selected={memberFormData.dob} onSelect={(d) => handleInputChange('dob', d)} initialFocus />
                                      </PopoverContent>
                                      </Popover>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="cpf">CPF</Label>
                                      <Input id="cpf" value={memberFormData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="rg">RG</Label>
                                      <Input id="rg" value={memberFormData.rg} onChange={(e) => handleInputChange('rg', e.target.value)} placeholder="00.000.000-0" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="plan">Plano</Label>
                                      <Select value={memberFormData.plan} onValueChange={(v) => handleInputChange('plan', v)}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Selecione um plano" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Mensal">Mensal</SelectItem>
                                          <SelectItem value="Trimestral">Trimestral</SelectItem>
                                          <SelectItem value="Anual">Anual</SelectItem>
                                      </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="expires">Expira em</Label>
                                      <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !memberFormData.expires && "text-muted-foreground")}>
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {memberFormData.expires ? format(memberFormData.expires, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                          <Calendar mode="single" selected={memberFormData.expires} onSelect={(d) => handleInputChange('expires', d)} initialFocus />
                                      </PopoverContent>
                                      </Popover>
                                  </div>
                              </div>
                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="goal">Objetivo Principal</Label>
                                    <Input id="goal" value={memberFormData.goal} onChange={(e) => handleInputChange('goal', e.target.value)} placeholder="Ex: Hipertrofia, Perder 10kg" />
                                </div>
                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="notes">Observações / Anamnese</Label>
                                    <Textarea id="notes" value={memberFormData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Lesões pré-existentes, medicamentos, etc." />
                                </div>
                          </TabsContent>
                          <TabsContent value="address" className="py-4">
                              <div className="grid grid-cols-4 gap-4">
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="zip">CEP</Label>
                                      <Input id="zip" value={memberFormData.address.zip} onChange={(e) => handleNestedChange('address', 'zip', e.target.value)} placeholder="00000-000" />
                                  </div>
                                  <div className="grid gap-2 col-span-3">
                                      <Label htmlFor="street">Rua</Label>
                                      <Input id="street" value={memberFormData.address.street} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} placeholder="Nome da rua" />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="number">Número</Label>
                                      <Input id="number" value={memberFormData.address.number} onChange={(e) => handleNestedChange('address', 'number', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-3">
                                      <Label htmlFor="complement">Complemento</Label>
                                      <Input id="complement" value={memberFormData.address.complement} onChange={(e) => handleNestedChange('address', 'complement', e.target.value)} placeholder="Apto, bloco, etc." />
                                  </div>
                                  <div className="grid gap-2 col-span-2">
                                      <Label htmlFor="neighborhood">Bairro</Label>
                                      <Input id="neighborhood" value={memberFormData.address.neighborhood} onChange={(e) => handleNestedChange('address', 'neighborhood', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="city">Cidade</Label>
                                      <Input id="city" value={memberFormData.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="state">Estado</Label>
                                      <Input id="state" value={memberFormData.address.state} onChange={(e) => handleNestedChange('address', 'state', e.target.value)} />
                                  </div>
                              </div>
                          </TabsContent>
                          <TabsContent value="emergency" className="py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                      <Label htmlFor="emergency-name">Nome do Contato</Label>
                                      <Input id="emergency-name" value={memberFormData.emergencyContact.name} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} placeholder="Nome completo" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="emergency-phone">Telefone do Contato</Label>
                                      <Input id="emergency-phone" value={memberFormData.emergencyContact.phone} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} placeholder="(99) 99999-9999" />
                                  </div>
                              </div>
                          </TabsContent>
                        </Tabs>
                      </form>
                      <DialogFooter>
                        <Button type="submit" form="add-member-form">{isEditing ? 'Salvar Alterações' : 'Salvar Aluno'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              {user.role !== 'Professor' && (
                <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="all">
              <MemberTable 
                data={filteredMembers} 
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewProfile={handleViewProfile}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            <TabsContent value="active">
              <MemberTable 
                data={filteredMembers.filter(m => m.status === 'Ativo')}
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewProfile={handleViewProfile}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            {user.role !== 'Professor' && (
              <TabsContent value="overdue">
                <MemberTable 
                  data={filteredMembers.filter(m => m.status === 'Atrasado')}
                  userRole={user.role}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onViewProfile={handleViewProfile}
                  onViewPayments={handleViewPayments}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno <span className="font-semibold">{memberToDelete?.name}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MemberTable({ 
  data,
  userRole,
  onEdit,
  onDelete,
  onViewProfile,
  onViewPayments
}: { 
  data: Member[],
  userRole: string,
  onEdit: (member: Member) => void,
  onDelete: (member: Member) => void,
  onViewProfile: (member: Member) => void,
  onViewPayments: (member: Member) => void
}) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="hidden md:table-cell">Expira em</TableHead>
                <TableHead>
                <span className="sr-only">Ações</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.length > 0 ? data.map((member) => (
                <TableRow key={member.id}>
                <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{member.email}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                <TableCell>{member.plan}</TableCell>
                <TableCell>
                    <Badge variant={member.status === 'Ativo' ? 'secondary' : 'destructive'}>
                    {member.status}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(member.expires.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Alternar menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => onViewProfile(member)}>Ver Ficha</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(member)}>Editar Cadastro</DropdownMenuItem>
                        {userRole !== 'Professor' && (
                          <DropdownMenuItem onSelect={() => onViewPayments(member)}>Ver Pagamentos</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => onDelete(member)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
        </Table>
    )
}
