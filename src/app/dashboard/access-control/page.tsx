"use client"

import * as React from "react"
import { Eye, MoreHorizontal, PlusCircle, Trash2, Loader2, WalletCards, ShieldCheck, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, type Employee, type Role } from "@/services/employees"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export const allPermissions = ["Painel", "Alunos", "Treinos", "Agenda", "Financeiro (Geral)", "Financeiro (Pessoal)", "CRM", "Colaboradores", "Relatórios", "Configurações", "Assinatura", "Gympass", "Planos", "Produtos", "Avaliações", "Frequência"]

export const rolePermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda", "Financeiro (Geral)", "CRM", "Colaboradores", "Relatórios", "Configurações", "Assinatura", "Gympass", "Planos", "Produtos", "Frequência"],
  Gerente: ["Painel", "Alunos", "Agenda", "Financeiro (Pessoal)", "CRM", "Colaboradores"],
  Gestor: ["Painel", "Alunos", "Avaliações", "Agenda", "Financeiro (Geral)", "CRM", "Relatórios", "Planos", "Produtos", "Assinatura", "Gympass", "Frequência"],
  Professor: ["Painel", "Alunos", "Treinos", "Avaliações", "Agenda"],
  "Personal Trainer Externo": ["Painel", "Alunos", "Treinos", "Avaliações"],
  Recepção: ["Alunos", "Agenda", "Financeiro (Pessoal)", "CRM", "Produtos"],
  Estagiário: ["Alunos", "Agenda", "Treinos"],
}

const initialEmployeeFormState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  login: "",
  password: "",
  role: "Professor" as Role,
  salary: 0,
  workHours: "",
  cpf: "",
  cref: "",
  accessPin: "",
  universityInfo: {
    universityName: "",
    course: "",
    expectedGraduation: "",
    contractStartDate: "",
    contractEndDate: "",
  },
}

type EmployeeFormData = typeof initialEmployeeFormState

export default function AccessControlPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ name: string; role: Role } | null>(null);
  const { toast } = useToast()
  
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = React.useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false)
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");

  const [isEditing, setIsEditing] = React.useState(false)
  const [employeeFormData, setEmployeeFormData] = React.useState<EmployeeFormData>(initialEmployeeFormState)
  
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

  const [employeeToPay, setEmployeeToPay] = React.useState<Employee | null>(null);
  const [isPaySalaryAlertOpen, setIsPaySalaryAlertOpen] = React.useState(false);

  React.useEffect(() => {
    const sessionUser = sessionStorage.getItem("fitcore.user");
    if(sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
  }, []);

  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      // Filter out the master admin from the list
      setEmployees(data.filter(e => e.role !== 'Admin'));
    } catch (error) {
      toast({
        title: "Erro ao buscar colaboradores",
        description: "Não foi possível carregar a lista.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRoleChange = async (employeeId: string, newRole: Role) => {
    try {
      await updateEmployee(employeeId, { role: newRole })
      toast({
        title: "Função Atualizada",
        description: `A função foi alterada para ${newRole}.`,
      })
      fetchEmployees() // Refresh the list
    } catch (error) {
       toast({
        title: "Erro ao atualizar função",
        variant: "destructive",
      })
    }
  }
  
  const handleSimulateView = (role: Role) => {
    const permissions = rolePermissions[role] || []
    toast({
      title: `Simulando visão de ${role}`,
      description: `Este perfil teria acesso a: ${permissions.join(", ")}.`,
    })
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setEmployeeFormData(prev => ({ ...prev, [field]: value }))
  }

   const handleUniversityInfoChange = (field: keyof typeof initialEmployeeFormState.universityInfo, value: string) => {
    setEmployeeFormData(prev => ({
      ...prev,
      universityInfo: {
        ...prev.universityInfo,
        [field]: value
      }
    }));
  }

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEmployeeFormData(initialEmployeeFormState);
    setIsEmployeeDialogOpen(true);
  }

  const handleEditClick = (employee: Employee) => {
    setIsEditing(true);
    setEmployeeFormData({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      address: employee.address || "",
      login: employee.login,
      password: '', // Clear password field for editing
      role: employee.role,
      salary: employee.salary,
      workHours: employee.workHours,
      cpf: employee.cpf,
      cref: employee.cref || '',
      accessPin: employee.accessPin || '',
      universityInfo: employee.universityInfo || initialEmployeeFormState.universityInfo
    });
    setIsEmployeeDialogOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeFormData.name || !employeeFormData.role || !employeeFormData.email || !employeeFormData.login || !employeeFormData.cpf) {
        toast({ title: "Campos Obrigatórios", description: "Nome, e-mail, login e CPF são obrigatórios.", variant: "destructive"})
        return
    }
    
    if (!isEditing && !employeeFormData.password) {
        toast({ title: "Campo Obrigatório", description: "A senha é obrigatória para novos colaboradores.", variant: "destructive"})
        return
    }

    const employeeData: Partial<Employee> = {
        name: employeeFormData.name,
        email: employeeFormData.email,
        phone: employeeFormData.phone,
        address: employeeFormData.address,
        login: employeeFormData.login,
        role: employeeFormData.role,
        status: "Ativo",
        salary: Number(employeeFormData.salary) || 0,
        workHours: employeeFormData.workHours,
        cpf: employeeFormData.cpf,
        cref: employeeFormData.cref,
        accessPin: employeeFormData.accessPin,
        universityInfo: employeeFormData.role === 'Estagiário' ? employeeFormData.universityInfo : undefined,
    }
    
    if(employeeFormData.password) {
      employeeData.password = employeeFormData.password
    }
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateEmployee(employeeFormData.id, employeeData);
        toast({ title: "Colaborador Atualizado", description: "Os dados foram atualizados com sucesso." })
      } else {
        await addEmployee(employeeData as Omit<Employee, 'id'>);
        toast({ title: "Colaborador Adicionado", description: "O novo colaborador foi cadastrado." })
      }
      fetchEmployees();
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível salvar o colaborador.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsEmployeeDialogOpen(false);
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsLoading(true);
    try {
      await deleteEmployee(employeeToDelete.id);
      toast({ title: "Colaborador Excluído", description: "O colaborador foi removido do sistema.", variant: "destructive" })
      fetchEmployees();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setEmployeeToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  const handlePaySalaryClick = (employee: Employee) => {
    setEmployeeToPay(employee);
    setIsPaySalaryAlertOpen(true);
  };

  const handleConfirmPaySalary = async () => {
    if (!employeeToPay) return;
    toast({
      title: "Pagamento Registrado",
      description: `O pagamento de salário para ${employeeToPay.name} foi registrado.`,
    });
    setIsPaySalaryAlertOpen(false);
    setEmployeeToPay(null);
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline">Colaboradores</CardTitle>
                <CardDescription>
                Adicione, edite e gerencie as permissões dos colaboradores da sua equipe.
                </CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}><ShieldCheck className="mr-2 h-4 w-4" />Gerenciar Perfis de Acesso</Button>
                <Button onClick={handleAddNewClick} disabled={isLoading}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Colaborador</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="hidden md:table-cell">Horário</TableHead>
                {user?.role === 'Admin' && <TableHead className="hidden lg:table-cell">Salário</TableHead>}
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{employee.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={employee.role}
                      onValueChange={(value: Role) => handleRoleChange(employee.id, value)}
                      disabled={user?.role !== 'Admin'}
                    >
                      <SelectTrigger className="w-full min-w-[140px]">
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Personal Trainer Externo">Personal Trainer Externo</SelectItem>
                        <SelectItem value="Recepção">Recepção</SelectItem>
                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.workHours}</TableCell>
                   {user?.role === 'Admin' && (
                    <TableCell className="hidden lg:table-cell">
                      {employee.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={employee.status === "Ativo" ? "secondary" : "destructive"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu de Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditClick(employee)}>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleSimulateView(employee.role as Role)}>
                          <Eye className="mr-2 h-4 w-4" /> Simular Visão
                        </DropdownMenuItem>
                        {user?.role === 'Admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handlePaySalaryClick(employee)}>
                              <WalletCards className="mr-2 h-4 w-4" /> Pagar Salário
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleDeleteClick(employee)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>

    <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Colaborador" : "Adicionar Novo Colaborador"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados e credenciais do colaborador." : "Preencha os dados e credenciais do novo colaborador."}
          </DialogDescription>
        </DialogHeader>
        <form id="employee-form" onSubmit={handleSaveEmployee}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={employeeFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={employeeFormData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" value={employeeFormData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select value={employeeFormData.role} onValueChange={(v: Role) => handleInputChange('role', v)}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Personal Trainer Externo">Personal Trainer Externo</SelectItem>
                        <SelectItem value="Recepção">Recepção</SelectItem>
                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             {(employeeFormData.role === 'Professor' || employeeFormData.role === 'Estagiário' || employeeFormData.role === 'Personal Trainer Externo') && (
                <div className="grid gap-2">
                    <Label htmlFor="cref">CREF (Obrigatório para Profissionais de Ed. Física)</Label>
                    <Input id="cref" value={employeeFormData.cref} onChange={(e) => handleInputChange('cref', e.target.value)} placeholder="000000-G/SP" required />
                </div>
            )}
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone de Contato</Label>
                    <Input id="phone" value={employeeFormData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(99) 99999-9999" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" value={employeeFormData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Rua, Nº, Bairro" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login">Login</Label>
                <Input id="login" value={employeeFormData.login} onChange={(e) => handleInputChange('login', e.target.value)} placeholder="ex: wini" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={employeeFormData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder={isEditing ? 'Deixe em branco para não alterar' : '••••••••'} />
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="accessPin">PIN de Acesso (Catraca)</Label>
                    <Input id="accessPin" value={employeeFormData.accessPin} onChange={(e) => handleInputChange('accessPin', e.target.value)} placeholder="4 a 6 dígitos" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="workHours">Horário de Trabalho</Label>
                    <Input id="workHours" value={employeeFormData.workHours} onChange={(e) => handleInputChange('workHours', e.target.value)} placeholder="Ex: 08:00 - 17:00" />
                </div>
            </div>
            {user?.role === 'Admin' && (
              <div className="grid gap-2">
                  <Label htmlFor="salary">Salário (R$)</Label>
                  <Input id="salary" type="number" value={employeeFormData.salary} onChange={(e) => handleInputChange('salary', e.target.value)} placeholder="Ex: 1500.00" />
              </div>
            )}

            {employeeFormData.role === 'Estagiário' && (
              <>
                <Separator className="my-2" />
                <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Dados do Estágio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="universityName">Nome da Faculdade</Label>
                            <Input id="universityName" value={employeeFormData.universityInfo.universityName} onChange={(e) => handleUniversityInfoChange('universityName', e.target.value)} placeholder="Universidade Exemplo" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="course">Curso</Label>
                            <Input id="course" value={employeeFormData.universityInfo.course} onChange={(e) => handleUniversityInfoChange('course', e.target.value)} placeholder="Educação Física" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expectedGraduation">Previsão de Formatura</Label>
                            <Input id="expectedGraduation" value={employeeFormData.universityInfo.expectedGraduation} onChange={(e) => handleUniversityInfoChange('expectedGraduation', e.target.value)} placeholder="MM/AAAA" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contractStartDate">Início do Contrato</Label>
                            <Input id="contractStartDate" type="date" value={employeeFormData.universityInfo.contractStartDate} onChange={(e) => handleUniversityInfoChange('contractStartDate', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contractEndDate">Fim do Contrato</Label>
                            <Input id="contractEndDate" type="date" value={employeeFormData.universityInfo.contractEndDate} onChange={(e) => handleUniversityInfoChange('contractEndDate', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contractFile" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Cópia do Contrato</Label>
                        <Input id="contractFile" type="file" disabled />
                        <p className="text-xs text-muted-foreground">O upload de arquivos estará disponível em breve.</p>
                    </div>
                </div>
              </>
            )}

          </div>
        </form>
        <DialogFooter className="mt-4">
          <Button type="submit" form="employee-form" disabled={isLoading}>{isEditing ? "Salvar Alterações" : "Salvar Colaborador"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Gerenciar Perfis de Acesso</DialogTitle>
                <DialogDescription>
                    Veja as permissões de cada perfil. A criação de novos perfis e a edição de permissões é uma funcionalidade avançada.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(rolePermissions).map(([role, permissions]) => (
                    <Card key={role}>
                        <CardHeader>
                            <CardTitle className="text-lg">{role}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {allPermissions.map(permission => (
                                <div key={permission} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`${role}-${permission}`}
                                        checked={permissions.includes(permission)}
                                        disabled
                                    />
                                    <Label htmlFor={`${role}-${permission}`} className="text-sm font-normal">{permission}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <DialogFooter>
                 <Button 
                    variant="outline" 
                    onClick={() => {
                        setNewRoleName("");
                        setIsCreateRoleDialogOpen(true);
                    }}
                 >
                    <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Função
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Criar Nova Função</DialogTitle>
                <DialogDescription>
                    Defina um nome para a nova função. As permissões poderão ser configuradas em breve.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="role-name">Nome da Função</Label>
                <Input 
                    id="role-name" 
                    value={newRoleName} 
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Ex: Vendedora, Auxiliar de Limpeza"
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateRoleDialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => {
                    if (!newRoleName.trim()) {
                        toast({ title: "O nome da função não pode estar em branco.", variant: "destructive" });
                        return;
                    }
                    toast({ 
                        title: `Função "${newRoleName}" criada!`, 
                        description: "A configuração de permissões para esta função estará disponível em breve." 
                    });
                    setIsCreateRoleDialogOpen(false);
                }}>Salvar Função</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o colaborador <span className="font-semibold">{employeeToDelete?.name}</span> do sistema.
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

      <AlertDialog open={isPaySalaryAlertOpen} onOpenChange={setIsPaySalaryAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento de Salário</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma o registro do pagamento de salário no valor de <span className="font-bold">{employeeToPay?.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> para o colaborador <span className="font-bold">{employeeToPay?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPaySalary}
              disabled={isLoading}
            >
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
