"use client"

import * as React from "react"
import { Eye, MoreHorizontal, PlusCircle, Shield, Trash2 } from "lucide-react"

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

const initialEmployees = [
  { id: "F001", name: "Ana Beatriz", email: "ana.b@fitcore.com", role: "Recepção", status: "Ativo" },
  { id: "F002", name: "Carlos de Souza", email: "carlos.s@fitcore.com", role: "Professor", status: "Ativo" },
  { id: "F003", name: "Fernanda Costa", email: "fernanda.c@fitcore.com", role: "Gestor", status: "Ativo" },
  { id: "F004", name: "Ricardo Alves", email: "ricardo.a@fitcore.com", role: "Professor", status: "Inativo" },
  { id: "F005", name: "Administrador Master", email: "admin@admin", role: "Admin", status: "Ativo" },
]

type Employee = (typeof initialEmployees)[0]
type Role = "Admin" | "Gestor" | "Professor" | "Recepção"

const rolePermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Agenda", "Financeiro", "CRM", "Acesso", "Relatórios", "Configurações"],
  Gestor: ["Painel", "Alunos", "Agenda", "Financeiro", "CRM", "Relatórios"],
  Professor: ["Alunos", "Treinos", "Agenda"],
  Recepção: ["Alunos", "Agenda", "Financeiro", "CRM", "Acesso"],
}

const initialEmployeeFormState = {
  id: "",
  name: "",
  email: "",
  role: "Professor" as Role,
}

type EmployeeFormData = typeof initialEmployeeFormState

export default function AccessControlPage() {
  const [employees, setEmployees] = React.useState(initialEmployees)
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [employeeFormData, setEmployeeFormData] = React.useState<EmployeeFormData>(initialEmployeeFormState)
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

  const handleRoleChange = (employeeId: string, newRole: Role) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId ? { ...emp, role: newRole } : emp
      )
    )
    toast({
      title: "Função Atualizada",
      description: `A função foi alterada para ${newRole}.`,
    })
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
      role: employee.role as Role,
    });
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeFormData.name || !employeeFormData.role || !employeeFormData.email) return

    if (isEditing) {
      setEmployees(prev => prev.map(e => {
        if (e.id === employeeFormData.id) {
          return {
            ...e,
            name: employeeFormData.name,
            email: employeeFormData.email,
            role: employeeFormData.role,
          }
        }
        return e
      }))
       toast({ title: "Funcionário Atualizado", description: "Os dados do funcionário foram atualizados com sucesso." })
    } else {
      const newEmployee: Employee = {
        id: `F${String(employees.length + 1).padStart(3, '0')}`,
        name: employeeFormData.name,
        email: employeeFormData.email,
        role: employeeFormData.role,
        status: "Ativo",
      }
      setEmployees(prev => [newEmployee, ...prev])
      toast({ title: "Funcionário Adicionado", description: "O novo funcionário foi cadastrado com sucesso." })
    }
    
    setIsDialogOpen(false)
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
    setEmployeeToDelete(null);
    setIsDeleteAlertOpen(false);
    toast({ title: "Funcionário Excluído", description: "O funcionário foi removido do sistema.", variant: "destructive" })
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
                <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Funcionário</Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Acesso de Administrador</span>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
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
                    disabled={employee.role === "Admin"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
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
                      <Button aria-haspopup="true" size="icon" variant="ghost" disabled={employee.role === "Admin"}>
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
      </CardContent>
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do funcionário." : "Preencha os dados do novo funcionário."}
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
          <Button type="submit" form="employee-form">{isEditing ? "Salvar Alterações" : "Salvar Funcionário"}</Button>
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
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
