"use client"

import * as React from "react"
import { Eye, MoreHorizontal, PlusCircle, Trash2, Loader2 } from "lucide-react"

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

export const rolePermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Agenda", "Financeiro", "CRM", "Funcionários", "Relatórios", "Configurações"],
  Gestor: ["Painel", "Alunos", "Agenda", "Financeiro", "CRM", "Relatórios"],
  Professor: ["Painel", "Alunos", "Treinos", "Agenda"],
  Recepção: ["Alunos", "Agenda", "Financeiro", "CRM", "Funcionários"],
}

const initialEmployeeFormState = {
  id: "",
  name: "",
  email: "",
  login: "",
  password: "",
  role: "Professor" as Role,
}

type EmployeeFormData = typeof initialEmployeeFormState

export default function AccessControlPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [employeeFormData, setEmployeeFormData] = React.useState<EmployeeFormData>(initialEmployeeFormState)
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar funcionários",
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

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEmployeeFormData(initialEmployeeFormState);
    setIsDialogOpen(true);
  }

  const handleEditClick = (employee: Employee) => {
    setIsEditing(true);
    setEmployeeFormData({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      login: employee.login,
      password: employee.password,
      role: employee.role,
    });
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeFormData.name || !employeeFormData.role || !employeeFormData.email || !employeeFormData.login || !employeeFormData.password) return

    const employeeData = {
        name: employeeFormData.name,
        email: employeeFormData.email,
        login: employeeFormData.login,
        password: employeeFormData.password,
        role: employeeFormData.role,
        status: "Ativo" as const,
    }
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateEmployee(employeeFormData.id, employeeData);
        toast({ title: "Funcionário Atualizado", description: "Os dados foram atualizados com sucesso." })
      } else {
        await addEmployee(employeeData);
        toast({ title: "Funcionário Adicionado", description: "O novo funcionário foi cadastrado." })
      }
      fetchEmployees();
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível salvar o funcionário.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
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
      toast({ title: "Funcionário Excluído", description: "O funcionário foi removido do sistema.", variant: "destructive" })
      fetchEmployees();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setEmployeeToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline">Gerenciamento de Funcionários</CardTitle>
                <CardDescription>
                Adicione, edite e gerencie as permissões dos funcionários.
                </CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <Button onClick={handleAddNewClick} disabled={isLoading}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Funcionário</Button>
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
                <TableHead>Funcionário</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{employee.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={employee.role}
                      onValueChange={(value: Role) => handleRoleChange(employee.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Recepção">Recepção</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
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
                        <DropdownMenuItem onSelect={() => handleDeleteClick(employee)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
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

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados e credenciais do funcionário." : "Preencha os dados e credenciais do novo funcionário."}
          </DialogDescription>
        </DialogHeader>
        <form id="employee-form" onSubmit={handleSaveEmployee}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={employeeFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={employeeFormData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login">Login</Label>
                <Input id="login" value={employeeFormData.login} onChange={(e) => handleInputChange('login', e.target.value)} placeholder="ex: wini" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={employeeFormData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select value={employeeFormData.role} onValueChange={(v: Role) => handleInputChange('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Recepção">Recepção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="employee-form" disabled={isLoading}>{isEditing ? "Salvar Alterações" : "Salvar Funcionário"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o funcionário <span className="font-semibold">{employeeToDelete?.name}</span> do sistema.
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
