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
  { id: "A001", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321", plan: "Anual", status: "Ativo", expires: "2024-12-31" },
  { id: "A002", name: "Maria Oliveira", email: "maria.o@example.com", phone: "(21) 91234-5678", plan: "Trimestral", status: "Ativo", expires: "2024-11-30" },
  { id: "A003", name: "Carlos Pereira", email: "carlos.p@example.com", phone: "(31) 95555-1234", plan: "Mensal", status: "Atrasado", expires: "2024-05-15" },
  { id: "A004", name: "Ana Costa", email: "ana.costa@example.com", phone: "(41) 98888-4321", plan: "Anual", status: "Ativo", expires: "2025-01-20" },
  { id: "A005", name: "Paulo Souza", email: "paulo.souza@example.com", phone: "(51) 99999-8765", plan: "Trimestral", status: "Ativo", expires: "2024-10-10" },
]

export default function MembersPage() {
  const [members, setMembers] = React.useState(initialMembers)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [dob, setDob] = React.useState<Date | undefined>()
  const [plan, setPlan] = React.useState("Mensal")
  const [expires, setExpires] = React.useState<Date | undefined>(new Date())

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !plan || !expires || !email) return

    const newMember = {
      id: `A${String(members.length + 1).padStart(3, '0')}`,
      name,
      email,
      phone: phone || "",
      plan,
      status: "Ativo",
      expires: format(expires, "yyyy-MM-dd"),
    }
    setMembers((prevMembers) => [...prevMembers, newMember])

    // Reset form
    setName("")
    setEmail("")
    setPhone("")
    setDob(undefined)
    setPlan("Mensal")
    setExpires(new Date())
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Alunos</CardTitle>
              <CardDescription>Gerencie os alunos da sua academia.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Adicionar Aluno</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes abaixo para adicionar um novo aluno.
                  </DialogDescription>
                </DialogHeader>
                <form id="add-member-form" onSubmit={handleAddMember} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Nome completo do aluno" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      E-mail
                    </Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="email@exemplo.com" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      WhatsApp
                    </Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" placeholder="(99) 99999-9999" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dob" className="text-right">
                      Nascimento
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !dob && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dob ? format(dob, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dob}
                          onSelect={setDob}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
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
                          {expires ? format(expires, "dd/MM/yyyy") : <span>Escolha uma data</span>}
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
                  <Button type="submit" form="add-member-form">Salvar Aluno</Button>
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

function MemberTable({ data }: { data: (typeof initialMembers) }) {
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
                <TableCell className="hidden md:table-cell">{format(new Date(member.expires), "dd/MM/yyyy")}</TableCell>
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
