"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react"

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
import { RevenueChart } from "@/components/revenue-chart"


const payments = [
  { id: "P001", student: "João Silva", plan: "Anual", amount: "97.00", date: "2024-07-01", status: "Pago" },
  { id: "P002", student: "Maria Oliveira", plan: "Trimestral", amount: "197.00", date: "2024-07-05", status: "Pago" },
  { id: "P003", student: "Carlos Pereira", plan: "Mensal", amount: "97.00", date: "2024-07-10", status: "Pendente" },
  { id: "P004", student: "Ana Costa", plan: "Anual", amount: "97.00", date: "2024-07-15", status: "Pago" },
]

const invoices = [
    { id: "F001", student: "João Silva", amount: "97.00", dueDate: "2024-08-01", status: "Pendente" },
    { id: "F002", student: "Maria Oliveira", amount: "197.00", dueDate: "2024-10-05", status: "Pendente" },
    { id: "F003", student: "Carlos Pereira", amount: "97.00", dueDate: "2024-07-15", status: "Vencida" },
    { id: "F004", student: "Ana Costa", amount: "97.00", dueDate: "2025-01-20", status: "Pendente" },
]

export default function FinancialPage() {
    const [paymentDate, setPaymentDate] = React.useState<Date | undefined>(new Date())

    return (
    <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <div className="grid gap-6 mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 45.231,89</div>
                            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 1.231,50</div>
                            <p className="text-xs text-muted-foreground">12 alunos com pagamentos atrasados</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pagamentos Hoje</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+R$ 2.350,00</div>
                            <p className="text-xs text-muted-foreground">5 pagamentos recebidos</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Próximos Vencimentos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 5.870,00</div>
                            <p className="text-xs text-muted-foreground">nos próximos 7 dias</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Receita (Últimos 6 meses)</CardTitle>
                        <CardDescription>Visão geral da receita mensal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="cashflow">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="font-headline">Fluxo de Caixa</CardTitle>
                    <CardDescription>
                        Acompanhe as entradas e saídas. Selecione o período.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <p>Controle de fluxo de caixa diário, semanal, mensal e anual em breve.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payments">
            <Card className="mt-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Pagamentos</CardTitle>
                            <CardDescription>Gerencie os pagamentos dos alunos.</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4" />Registrar Pagamento</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                                    <DialogDescription>
                                        Preencha os detalhes para registrar um pagamento.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="student" className="text-right">Aluno</Label>
                                        <Select>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Selecione um aluno" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="joao-silva">João Silva</SelectItem>
                                                <SelectItem value="maria-oliveira">Maria Oliveira</SelectItem>
                                                <SelectItem value="carlos-pereira">Carlos Pereira</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="plan" className="text-right">Plano</Label>
                                        <Select>
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
                                        <Label htmlFor="amount" className="text-right">Valor</Label>
                                        <Input id="amount" type="number" placeholder="R$ 0,00" className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="paymentDate" className="text-right">Data</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant={"outline"}
                                                className={cn("col-span-3 justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {paymentDate ? format(paymentDate, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Salvar Pagamento</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead className="hidden md:table-cell">Plano</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">{payment.student}</TableCell>
                                    <TableCell className="hidden md:table-cell">{payment.plan}</TableCell>
                                    <TableCell>R$ {payment.amount}</TableCell>
                                    <TableCell>{format(new Date(payment.date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.status === 'Pago' ? 'secondary' : 'destructive'}>
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="invoices">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="font-headline">Faturas</CardTitle>
                    <CardDescription>
                        Visualize e emita faturas para seus alunos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.student}</TableCell>
                                    <TableCell>R$ {invoice.amount}</TableCell>
                                    <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Pendente' ? 'outline' : 'destructive'}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-3 w-3" />
                                            Emitir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  )
}
