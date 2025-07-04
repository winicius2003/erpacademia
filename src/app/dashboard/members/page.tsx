
"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react"
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

export const initialMembers = [
  { id: "A001", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321", plan: "Anual", status: "Ativo", expires: "2024-12-31", cpf: "123.456.789-10", rg: "12.345.678-9", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A002", name: "Maria Oliveira", email: "maria.o@example.com", phone: "(21) 91234-5678", plan: "Trimestral", status: "Ativo", expires: "2024-11-30", cpf: "111.222.333-44", rg: "11.222.333-4", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A003", name: "Carlos Pereira", email: "carlos.p@example.com", phone: "(31) 95555-1234", plan: "Mensal", status: "Atrasado", expires: "2024-05-15", cpf: "222.333.444-55", rg: "22.333.444-5", professor: "Ricardo Alves", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A004", name: "Ana Costa", email: "ana.costa@example.com", phone: "(41) 98888-4321", plan: "Anual", status: "Ativo", expires: "2025-01-20", cpf: "333.444.555-66", rg: "33.444.555-6", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A005", name: "Paulo Souza", email: "paulo.souza@example.com", phone: "(51) 99999-8765", plan: "Trimestral", status: "Ativo", expires: "2024-10-10", cpf: "444.555.666-77", rg: "44.555.666-7", professor: "Ricardo Alves", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  // Alunos do Winicius
  { id: "A006", name: "Beatriz Lima", email: "beatriz.l@example.com", phone: "(61) 98765-1111", plan: "Mensal", status: "Ativo", expires: "2024-08-30", cpf: "100.000.000-01", rg: "10.000.000-1", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A007", name: "Lucas Martins", email: "lucas.m@example.com", phone: "(61) 98765-2222", plan: "Anual", status: "Ativo", expires: "2025-07-20", cpf: "100.000.000-02", rg: "10.000.000-2", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A008", name: "Julia Almeida", email: "julia.a@example.com", phone: "(61) 98765-3333", plan: "Trimestral", status: "Ativo", expires: "2024-09-15", cpf: "100.000.000-03", rg: "10.000.000-3", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Pendente" },
  { id: "A009", name: "Guilherme Barros", email: "guilherme.b@example.com", phone: "(61) 98765-4444", plan: "Mensal", status: "Ativo", expires: "2024-08-25", cpf: "100.000.000-04", rg: "10.000.000-4", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A010", name: "Isabela Gomes", email: "isabela.g@example.com", phone: "(61) 98765-5555", plan: "Anual", status: "Ativo", expires: "2025-06-30", cpf: "100.000.000-05", rg: "10.000.000-5", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A011", name: "Mateus Ferreira", email: "mateus.f@example.com", phone: "(61) 98765-6666", plan: "Trimestral", status: "Ativo", expires: "2024-11-10", cpf: "100.000.000-06", rg: "10.000.000-6", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A012", name: "Larissa Ribeiro", email: "larissa.r@example.com", phone: "(61) 98765-7777", plan: "Mensal", status: "Ativo", expires: "2024-08-28", cpf: "100.000.000-07", rg: "10.000.000-7", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A013", name: "Rafael Dias", email: "rafael.d@example.com", phone: "(61) 98765-8888", plan: "Anual", status: "Ativo", expires: "2025-05-22", cpf: "100.000.000-08", rg: "10.000.000-8", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A014", name: "Sofia Nogueira", email: "sofia.n@example.com", phone: "(61) 98765-9999", plan: "Trimestral", status: "Ativo", expires: "2024-12-01", cpf: "100.000.000-09", rg: "10.000.000-9", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A015", name: "Thiago Mendes", email: "thiago.m@example.com", phone: "(61) 98765-1010", plan: "Mensal", status: "Ativo", expires: "2024-08-19", cpf: "100.000.000-10", rg: "10.000.000-10", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A016", name: "Vitoria Rocha", email: "vitoria.r@example.com", phone: "(61) 98765-1212", plan: "Anual", status: "Ativo", expires: "2025-04-14", cpf: "100.000.000-11", rg: "10.000.000-11", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A017", name: "Bruno Pinto", email: "bruno.p@example.com", phone: "(61) 98765-1313", plan: "Trimestral", status: "Ativo", expires: "2024-10-25", cpf: "100.000.000-12", rg: "10.000.000-12", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A018", name: "Clara Santos", email: "clara.s@example.com", phone: "(61) 98765-1414", plan: "Mensal", status: "Ativo", expires: "2024-08-22", cpf: "100.000.000-13", rg: "10.000.000-13", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A019", name: "Daniel Cardoso", email: "daniel.c@example.com", phone: "(61) 98765-1515", plan: "Anual", status: "Ativo", expires: "2025-03-18", cpf: "100.000.000-14", rg: "10.000.000-14", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A020", name: "Evelyn Monteiro", email: "evelyn.m@example.com", phone: "(61) 98765-1616", plan: "Trimestral", status: "Ativo", expires: "2024-11-28", cpf: "100.000.000-15", rg: "10.000.000-15", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A021", name: "Felipe Ramos", email: "felipe.r@example.com", phone: "(61) 98765-1717", plan: "Mensal", status: "Ativo", expires: "2024-08-31", cpf: "100.000.000-16", rg: "10.000.000-16", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A022", name: "Gabriela Azevedo", email: "gabriela.a@example.com", phone: "(61) 98765-1818", plan: "Anual", status: "Ativo", expires: "2025-02-10", cpf: "100.000.000-17", rg: "10.000.000-17", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A023", name: "Heitor Cunha", email: "heitor.c@example.com", phone: "(61) 98765-1919", plan: "Trimestral", status: "Ativo", expires: "2024-10-05", cpf: "100.000.000-18", rg: "10.000.000-18", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A024", name: "Igor Teixeira", email: "igor.t@example.com", phone: "(61) 98765-2020", plan: "Mensal", status: "Ativo", expires: "2024-08-15", cpf: "100.000.000-19", rg: "10.000.000-19", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A025", name: "Yasmin Sousa", email: "yasmin.s@example.com", phone: "(61) 98765-2121", plan: "Anual", status: "Ativo", expires: "2025-01-25", cpf: "100.000.000-20", rg: "10.000.000-20", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
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
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    const userData = sessionStorage.getItem("fitcore.user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
       router.replace("/login")
    }
  }, [router]);

  const displayMembers = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'Professor') {
      return members.filter(m => m.professor === user.name);
    }
    return members;
  }, [members, user]);


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
        professor: "Não atribuído", // Default value
        attendanceStatus: "Presente", // Default value
        workoutStatus: "Pendente", // Default value
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

  if (!user) {
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
          <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Alunos</CardTitle>
                <CardDescription>
                  {user.role === 'Professor' ? 'Gerencie os seus alunos.' : 'Gerencie os alunos da sua academia.'}
                </CardDescription>
              </div>
              {user.role !== 'Professor' && (
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
              )}
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
                data={displayMembers} 
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewWorkouts={handleViewWorkouts}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            <TabsContent value="active">
              <MemberTable 
                data={displayMembers.filter(m => m.status === 'Ativo')}
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewWorkouts={handleViewWorkouts}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            {user.role !== 'Professor' && (
              <TabsContent value="overdue">
                <MemberTable 
                  data={displayMembers.filter(m => m.status === 'Atrasado')}
                  userRole={user.role}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onViewWorkouts={handleViewWorkouts}
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
  onViewWorkouts,
  onViewPayments
}: { 
  data: Member[],
  userRole: string,
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
                        {userRole !== 'Professor' && (
                          <DropdownMenuItem onSelect={() => onViewPayments(member)}>Ver Pagamentos</DropdownMenuItem>
                        )}
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
