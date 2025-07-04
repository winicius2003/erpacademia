
"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { format, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, TrendingUp, Users, AlertCircle, Trash2, X, Target } from "lucide-react"

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
import { ProjectedRevenueChart } from "@/components/projected-revenue-chart"
import { InvoiceDialog } from "@/components/invoice-dialog"
import { Separator } from "@/components/ui/separator"

const initialPayments = [
  { id: "P001", student: "João Silva", items: [{id: 1, description: "Plano Anual", quantity: 1, price: 97.00}], amount: "97.00", date: format(new Date(), "yyyy-MM-dd"), status: "Pago" },
  { id: "P002", student: "Maria Oliveira", items: [{id: 1, description: "Plano Trimestral", quantity: 1, price: 197.00}], amount: "197.00", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), status: "Pago" },
  { id: "P003", student: "Carlos Pereira", items: [{id: 1, description: "Plano Mensal", quantity: 1, price: 97.00}], amount: "97.00", date: "2024-07-10", status: "Pendente" },
  { id: "P004", student: "Ana Costa", items: [{id: 1, description: "Plano Anual", quantity: 1, price: 97.00}], amount: "97.00", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), status: "Pago" },
  { id: "P005", student: "João Silva", items: [{id: 1, description: "Plano Mensal", quantity: 1, price: 97.00}], amount: "97.00", date: "2024-06-01", status: "Pago" },
]

const initialMembers = [
    { id: "A001", name: "João Silva", plan: "Anual", status: "Ativo" },
    { id: "A002", name: "Maria Oliveira", plan: "Trimestral", status: "Ativo" },
    { id: "A003", name: "Carlos Pereira", plan: "Mensal", status: "Atrasado" },
    { id: "A004", name: "Ana Costa", plan: "Anual", status: "Ativo" },
    { id: "A005", name: "Paulo Souza", plan: "Trimestral", status: "Ativo" },
    { id: "A006", name: "Beatriz Lima", plan: "Mensal", status: "Ativo" },
    { id: "A007", name: "Lucas Martins", plan: "Anual", status: "Ativo" },
]

const planPrices = {
    "Mensal": { price: 97.00, duration: 30 },
    "Trimestral": { price: 277.00, duration: 90 },
    "Anual": { price: 997.00, duration: 365 },
}

const invoices = [
    { id: "F001", student: "João Silva", amount: "97.00", dueDate: "2024-08-01", status: "Pendente" },
    { id: "F002", student: "Maria Oliveira", amount: "197.00", dueDate: "2024-10-05", status: "Pendente" },
    { id: "F003", student: "Carlos Pereira", amount: "97.00", dueDate: "2024-07-15", status: "Vencida" },
    { id: "F004", student: "Ana Costa", amount: "97.00", dueDate: "2025-01-20", status: "Pendente" },
]

const availableProducts = [
  { name: "Plano Mensal", price: 97.00 },
  { name: "Plano Trimestral", price: 277.00 },
  { name: "Plano Anual", price: 997.00 },
  { name: "Avaliação Física", price: 150.00 },
  { name: "Garrafa de Água", price: 25.00 },
  { name: "Toalha FitCore", price: 35.00 },
]

export default function FinancialPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const studentName = searchParams.get('student')

    const [payments, setPayments] = React.useState(initialPayments)
    const [filteredPayments, setFilteredPayments] = React.useState(initialPayments)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
    const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false)
    const [currentInvoice, setCurrentInvoice] = React.useState(null)
    const [cashFlowData, setCashFlowData] = React.useState({ daily: {}, weekly: {}, monthly: {} })
    const [projectionChartData, setProjectionChartData] = React.useState([])


    React.useEffect(() => {
        if (studentName) {
            setFilteredPayments(payments.filter(p => p.student === studentName));
        } else {
            setFilteredPayments(payments);
        }
    }, [studentName, payments]);
    
    React.useEffect(() => {
        // --- Calculations ---
        const activeMembers = initialMembers.filter(m => m.status === 'Ativo')
        
        // Projected Revenue
        const projectedDailyRevenue = activeMembers.reduce((acc, member) => {
            const plan = planPrices[member.plan]
            if(plan) {
                return acc + (plan.price / plan.duration)
            }
            return acc
        }, 0)
        
        const projectedWeeklyRevenue = projectedDailyRevenue * 7
        const projectedMonthlyRevenue = projectedDailyRevenue * 30

        // Actual Revenue
        const now = new Date()
        const actualDailyRevenue = payments
            .filter(p => isToday(new Date(p.date.replace(/-/g, '/'))))
            .reduce((acc, p) => acc + parseFloat(p.amount), 0)
        
        const actualWeeklyRevenue = payments
            .filter(p => isThisWeek(new Date(p.date.replace(/-/g, '/')), { weekStartsOn: 1 }))
            .reduce((acc, p) => acc + parseFloat(p.amount), 0)

        const actualMonthlyRevenue = payments
            .filter(p => isThisMonth(new Date(p.date.replace(/-/g, '/'))))
            .reduce((acc, p) => acc + parseFloat(p.amount), 0)

        setCashFlowData({
            daily: { actual: actualDailyRevenue, projected: projectedDailyRevenue },
            weekly: { actual: actualWeeklyRevenue, projected: projectedWeeklyRevenue },
            monthly: { actual: actualMonthlyRevenue, projected: projectedMonthlyRevenue }
        })

        // Projection Chart Data (last 7 days)
        const past7Days = eachDayOfInterval({
            start: subDays(now, 6),
            end: now
        });

        const chartData = past7Days.map(day => {
            const dailyActual = payments
                .filter(p => isSameDay(new Date(p.date.replace(/-/g, '/')), day))
                .reduce((acc, p) => acc + parseFloat(p.amount), 0)

            return {
                date: format(day, 'dd/MM'),
                day: format(day, 'eee', { locale: ptBR }),
                realizado: dailyActual,
                previsto: projectedDailyRevenue,
            }
        });
        setProjectionChartData(chartData)

    }, [payments])

    const [newPaymentData, setNewPaymentData] = React.useState({
        student: "João Silva",
        date: new Date(),
        items: [{ id: 1, description: "Plano Mensal", quantity: 1, price: 97.00 }],
    })

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newPaymentData.items]
        updatedItems[index][field] = value
        setNewPaymentData({ ...newPaymentData, items: updatedItems })
    }

    const handleAddItem = () => {
        const newItem = { id: Date.now(), description: "", quantity: 1, price: 0 }
        setNewPaymentData({ ...newPaymentData, items: [...newPaymentData.items, newItem] })
    }

    const handleRemoveItem = (index) => {
        const updatedItems = newPaymentData.items.filter((_, i) => i !== index)
        setNewPaymentData({ ...newPaymentData, items: updatedItems })
    }
    
    const handleProductSelect = (index, productName) => {
        const product = availableProducts.find(p => p.name === productName);
        if (product) {
            const updatedItems = [...newPaymentData.items];
            updatedItems[index] = { ...updatedItems[index], description: product.name, price: product.price };
            setNewPaymentData({ ...newPaymentData, items: updatedItems });
        }
    };

    const totalAmount = newPaymentData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaymentData.student || newPaymentData.items.length === 0) {
            return;
        }

        const newPayment = {
            id: `P${String(payments.length + 1).padStart(3, '0')}`,
            student: newPaymentData.student,
            items: newPaymentData.items,
            amount: totalAmount.toFixed(2),
            date: format(newPaymentData.date, "yyyy-MM-dd"),
            status: "Pago",
        }
        setPayments(prev => [newPayment, ...prev]);
        setCurrentInvoice(newPayment);
        setIsPaymentDialogOpen(false);
        setIsInvoiceOpen(true);
        setNewPaymentData({ student: "", date: new Date(), items: [{ id: 1, description: "", quantity: 1, price: 0.00 }] });
    }

    const clearFilter = () => {
        router.push('/dashboard/financial');
    };
    
    const defaultTab = studentName ? "payments" : "overview";

    return (
    <>
        <InvoiceDialog isOpen={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} invoiceData={currentInvoice} />
        <Tabs defaultValue={defaultTab}>
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
                     <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Receita (Últimos 6 meses)</CardTitle>
                                <CardDescription>Visão geral da receita mensal.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Projeção de Receita (7 dias)</CardTitle>
                                <CardDescription>Receita realizada vs. prevista para a última semana.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProjectedRevenueChart data={projectionChartData} />
                            </CardContent>
                        </Card>
                    </div>
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
                    <CardContent>
                        <Tabs defaultValue="daily" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily">Diário</TabsTrigger>
                                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                            </TabsList>
                            <TabsContent value="daily" className="mt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Realizada (Hoje)</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.daily.actual?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Total de pagamentos recebidos hoje</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Prevista (Hoje)</CardTitle>
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.daily.projected?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Projeção com base nos alunos ativos</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent value="weekly" className="mt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Realizada (Semana)</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.weekly.actual?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Total de pagamentos recebidos na semana</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Prevista (Semana)</CardTitle>
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.weekly.projected?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Projeção com base nos alunos ativos</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent value="monthly" className="mt-4">
                                 <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Realizada (Mês)</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.monthly.actual?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Total de pagamentos recebidos no mês</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita Prevista (Mês)</CardTitle>
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">R$ {cashFlowData.monthly.projected?.toFixed(2) || '0.00'}</div>
                                            <p className="text-xs text-muted-foreground">Projeção com base nos alunos ativos</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="payments">
                <Card className="mt-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">Pagamentos</CardTitle>
                                {studentName ? (
                                    <CardDescription>
                                        Exibindo histórico de pagamentos para <span className="font-bold text-foreground">{studentName}</span>.
                                    </CardDescription>
                                ) : (
                                    <CardDescription>Gerencie os pagamentos dos alunos.</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {studentName && (
                                     <Button variant="outline" size="sm" onClick={clearFilter}>
                                        <X className="mr-2 h-4 w-4" />
                                        Limpar filtro
                                    </Button>
                                )}
                                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className="mr-2 h-4 w-4" />Registrar Pagamento</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                                            <DialogDescription>
                                                Preencha os detalhes para registrar um pagamento e gerar a fatura.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form id="payment-form" onSubmit={handleSavePayment}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="student">Aluno</Label>
                                                    <Select value={newPaymentData.student} onValueChange={(value) => setNewPaymentData({...newPaymentData, student: value})}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um aluno" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="João Silva">João Silva</SelectItem>
                                                            <SelectItem value="Maria Oliveira">Maria Oliveira</SelectItem>
                                                            <SelectItem value="Carlos Pereira">Carlos Pereira</SelectItem>
                                                            <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="paymentDate">Data</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal", !newPaymentData.date && "text-muted-foreground")}
                                                            >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {newPaymentData.date ? format(newPaymentData.date, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar mode="single" selected={newPaymentData.date} onSelect={(date) => setNewPaymentData({...newPaymentData, date})} initialFocus />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                            
                                            <Separator />

                                            <div>
                                                <Label className="mb-2 block">Itens da Fatura</Label>
                                                <div className="space-y-2">
                                                    {newPaymentData.items.map((item, index) => (
                                                        <div key={item.id} className="flex items-end gap-2">
                                                            <div className="flex-1">
                                                                <Label htmlFor={`item-desc-${index}`} className="sr-only">Descrição</Label>
                                                                <Select onValueChange={(value) => handleProductSelect(index, value)}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione ou digite um item" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availableProducts.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="w-20">
                                                                <Label htmlFor={`item-qty-${index}`} className="sr-only">Qtd.</Label>
                                                                <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} placeholder="Qtd." />
                                                            </div>
                                                            <div className="w-28">
                                                                <Label htmlFor={`item-price-${index}`} className="sr-only">Preço</Label>
                                                                <Input id={`item-price-${index}`} type="number" step="0.01" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))} placeholder="Preço" />
                                                            </div>
                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}>Adicionar Item</Button>
                                            </div>
                                            
                                            <Separator />

                                            <div className="flex justify-end text-right">
                                                <div>
                                                    <p className="text-muted-foreground">Total</p>
                                                    <p className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        </form>
                                        <DialogFooter>
                                            <Button type="submit" form="payment-form">Salvar Pagamento e Gerar Nota</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead className="hidden md:table-cell">Data</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead><span className="sr-only">Ações</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.student}</TableCell>
                                        <TableCell>R$ {payment.amount}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(new Date(payment.date.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => { setCurrentInvoice(payment); setIsInvoiceOpen(true); }}>Ver Fatura</DropdownMenuItem>
                                                    <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nenhum pagamento encontrado{studentName ? ` para ${studentName}` : ''}.
                                        </TableCell>
                                    </TableRow>
                                )}
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
    </>
  )
}
