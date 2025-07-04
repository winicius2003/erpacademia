"use client"

import * as React from "react"
import { Eye, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

const initialEmployees = [
  { id: "F001", name: "Ana Beatriz", role: "Recepção", status: "Ativo" },
  { id: "F002", name: "Carlos de Souza", role: "Professor", status: "Ativo" },
  { id: "F003", name: "Fernanda Costa", role: "Gestor", status: "Ativo" },
  { id: "F004", name: "Ricardo Alves", role: "Professor", status: "Inativo" },
  { id: "F005", name: "Administrador Master", role: "Admin", status: "Ativo" },
]

type Employee = (typeof initialEmployees)[0]
type Role = "Admin" | "Gestor" | "Professor" | "Recepção" | "Aluno"

const rolePermissions: Record<Role, string[]> = {
  Admin: ["Painel", "Alunos", "Treinos", "Agenda", "Financeiro", "CRM", "Acesso", "Relatórios", "Configurações"],
  Gestor: ["Painel", "Alunos", "Agenda", "Financeiro", "CRM", "Relatórios"],
  Professor: ["Alunos", "Treinos", "Agenda"],
  Recepção: ["Alunos", "Agenda", "Financeiro", "CRM", "Acesso"],
  Aluno: ["Treinos", "Agenda", "Financeiro"],
}

export default function AccessControlPage() {
  const [employees, setEmployees] = React.useState(initialEmployees)
  const { toast } = useToast()

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline">Controle de Acesso de Funcionários</CardTitle>
                <CardDescription>
                Gerencie as funções e permissões de cada membro da equipe.
                </CardDescription>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Acesso de Administrador</span>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
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
                      <SelectItem value="Aluno">Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={employee.status === "Ativo" ? "secondary" : "destructive"}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleSimulateView(employee.role as Role)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Simular Visão</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Simular Visão como {employee.role}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
