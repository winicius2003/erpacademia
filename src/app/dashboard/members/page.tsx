
"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon } from "lucide-react"
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

const initialMembers = [
  { id: "A001", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321", plan: "Anual", status: "Ativo", expires: "2024-12-31", cpf: "123.456.789-10", rg: "12.345.678-9" },
  { id: "A002", name: "Maria Oliveira", email: "maria.o@example.com", phone: "(21) 91234-5678", plan: "Trimestral", status: "Ativo", expires: "2024-11-30", cpf: "111.222.333-44", rg: "11.222.333-4" },
  { id: "A003", name: "Carlos Pereira", email: "carlos.p@example.com", phone: "(31) 95555-1234", plan: "Mensal", status: "Atrasado", expires: "2024-05-15", cpf: "222.333.444-55", rg: "22.333.444-5" },
  { id: "A004", name: "Ana Costa", email: "ana.costa@example.com", phone: "(41) 98888-4321", plan: "Anual", status: "Ativo", expires: "2025-01-20", cpf: "333.444.555-66", rg: "33.444.555-6" },
  { id: "A005", name: "Paulo Souza", email: "paulo.souza@example.com", phone: "(51) 99999-8765", plan: "Trimestral", status: "Ativo", expires: "2024-10-10", cpf: "444.555.666-77", rg: "44.555.666-7" },
]

type Member = typeof initialMembers[0];

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
}

type MemberFormData = typeof initialMemberFormState;

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = React.useState(initialMembers)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [memberFormData, setMemberFormData] = React.useState<MemberFormData>(initialMemberFormState)
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

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
    // Note: `new Date('YYYY-MM-DD')` can be timezone sensitive. `YYYY/MM/DD` is safer.
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
      // address, dob and emergencyContact are not part of the initialMembers list,
      // so they will be blank when editing. In a real app, this data would be fetched.
    });
    setIsDialogOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberFormData.name || !memberFormData.plan || !memberFormData.expires || !memberFormData.email) return

    if (isEditing) {
      setMembers(prev => prev.map(m => {
        if (m.id === memberFormData.id) {
          return {
            ...m,
            name: memberFormData.name,
            email: memberFormData.email,
            phone: memberFormData.phone,
            cpf: memberFormData.cpf,
            rg: memberFormData.rg,
            plan: memberFormData.plan,
            expires: format(memberFormData.expires!, "yyyy-MM-dd"),
          }
        }
        return m
      }))
    } else {
      const newMember: Member = {
        id: `A${String(members.length + 1).padStart(3, '0')}`,
        name: memberFormData.name,
        email: memberFormData.email,
        phone: memberFormData.phone,
        cpf: memberFormData.cpf,
        rg: memberFormData.rg,
        plan: memberFormData.plan,
        status: "Ativo",
        expires: format(memberFormData.expires, "yyyy-MM-dd"),
      }
      setMembers((prevMembers) => [newMember, ...prevMembers])
    }
    
    setIsDialogOpen(false)
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    setMembers(members.filter(m => m.id !== memberToDelete.id));
    setMemberToDelete(null);
    setIsDeleteAlertOpen(false);
  };

  const handleViewWorkouts = (member: Member) => {
    router.push('/dashboard/workouts');
  };

  const handleViewPayments = (member: Member) => {
    router.push(`/dashboard/financial?student=${encodeURIComponent(member.name)}`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Alunos</CardTitle>
                <CardDescription>Gerencie os alunos da sua academia.</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Aluno</Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <MemberTable 
                data={members} 
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewWorkouts={handleViewWorkouts}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            <TabsContent value="active">
              <MemberTable 
                data={members.filter(m => m.status === 'Ativo')}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewWorkouts={handleViewWorkouts}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            <TabsContent value="overdue">
              <MemberTable 
                data={members.filter(m => m.status === 'Atrasado')}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewWorkouts={handleViewWorkouts}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
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
  onEdit,
  onDelete,
  onViewWorkouts,
  onViewPayments
}: { 
  data: Member[],
  onEdit: (member: Member) => void,
  onDelete: (member: Member) => void,
  onViewWorkouts: (member: Member) => void,
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
            {data.map((member) => (
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
                        <DropdownMenuItem onSelect={() => onEdit(member)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onViewWorkouts(member)}>Ver Treinos</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onViewPayments(member)}>Ver Pagamentos</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDelete(member)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}

    