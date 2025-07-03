"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const initialMembers = [
  { id: "M001", name: "João Silva", plan: "Ouro", status: "Ativo", expires: "2024-12-31" },
  { id: "M002", name: "Maria Oliveira", plan: "Prata", status: "Ativo", expires: "2024-11-30" },
  { id: "M003", name: "Carlos Pereira", plan: "Bronze", status: "Atrasado", expires: "2024-05-15" },
  { id: "M004", name: "Ana Costa", plan: "Ouro", status: "Ativo", expires: "2025-01-20" },
  { id: "M005", name: "Paulo Souza", plan: "Prata", status: "Ativo", expires: "2024-10-10" },
]

export default function MembersPage() {
  const [members, setMembers] = React.useState(initialMembers)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const [name, setName] = React.useState("")
  const [plan, setPlan] = React.useState("Bronze")
  const [expires, setExpires] = React.useState<Date | undefined>(new Date())

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !plan || !expires) return

    const newMember = {
      id: `M${String(members.length + 1).padStart(3, '0')}`,
      name,
      plan,
      status: "Ativo",
      expires: format(expires, "yyyy-MM-dd"),
    }
    setMembers((prevMembers) => [...prevMembers, newMember])

    setName("")
    setPlan("Bronze")
    setExpires(new Date())
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Membros</CardTitle>
              <CardDescription>Gerencie os membros da sua academia e seus planos de assinatura.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Adicionar Membro</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes abaixo para adicionar um novo membro.
                  </DialogDescription>
                </DialogHeader>
                <form id="add-member-form" onSubmit={handleAddMember} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Nome completo do membro" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan" className="text-right">
                      Plano
                    </Label>
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                        <SelectItem value="Prata">Prata</SelectItem>
                        <SelectItem value="Ouro">Ouro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expires" className="text-right">
                      Expira em
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !expires && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expires ? format(expires, "PPP") : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expires}
                          onSelect={setExpires}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </form>
                <DialogFooter>
                  <Button type="submit" form="add-member-form">Salvar</Button>
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
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <MemberTable data={members} />
          </TabsContent>
          <TabsContent value="active">
             <MemberTable data={members.filter(m => m.status === 'Ativo')} />
          </TabsContent>
          <TabsContent value="overdue">
             <MemberTable data={members.filter(m => m.status === 'Atrasado')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MemberTable({ data }: { data: typeof initialMembers }) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID do Membro</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>
                <span className="sr-only">Ações</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.map((member) => (
                <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.plan}</TableCell>
                <TableCell>
                    <Badge variant={member.status === 'Ativo' ? 'secondary' : 'destructive'}>
                    {member.status}
                    </Badge>
                </TableCell>
                <TableCell>{member.expires}</TableCell>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Treinos</DropdownMenuItem>
                        <DropdownMenuItem>Ver Pagamentos</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}
