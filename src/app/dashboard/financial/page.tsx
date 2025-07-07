
"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { format, isToday, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, TrendingUp, Users, AlertCircle, Trash2, X, Target, Loader2, UsersRound, ArrowRightLeft, MinusCircle, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useToast } from "@/hooks/use-toast"
import { getMembers, type Member } from "@/services/members"
import { getPayments, addPayment, type Payment } from "@/services/payments"
import { getExpenses, addExpense, type Expense, type ExpenseCategory } from "@/services/expenses"
import { useSubscription } from "@/lib/subscription-context"
import { getPlans } from "@/services/plans"
import { getProducts } from "@/services/products"
import type { Role } from "@/services/employees"

type Transaction = {
    id: string;
    time: string;
    description: string;
    amount: number;
    type: 'inflow' | 'outflow';
    category?: string;
    originalDoc: Payment | Expense;
}

const initialExpenseFormState = {
    description: "",
    amount: 0,
    category: "Outros" as ExpenseCategory,
}

export default function FinancialPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const { status: subscriptionStatus } = useSubscription()
    const studentNameParam = searchParams.get('studentName')

    // State to manage the post-creation payment trigger
    const [paymentAction, setPaymentAction] = React.useState<{studentId: string; studentName: string; planName: string; planPrice: string;} | null>(null);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = React.useState(false);


    const [user, setUser] = React.useState<{ id: string, name: string, role: Role } | null>(null);
    const [payments, setPayments] = React.useState<Payment[]>([])
    const [expenses, setExpenses] = React.useState<Expense[]>([])
    const [members, setMembers] = React.useState<Member[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [availableProducts, setAvailableProducts] = React.useState<{ name: string, price: number }[]>([]);
    
    // States for Cash Flow tab
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
    const [dailyTransactions, setDailyTransactions] = React.useState<Transaction[]>([])
    const [dailySummary, setDailySummary] = React.useState({ inflow: 0, outflow: 0, balance: 0 })
    
    // States for dialogs
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false)
    const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false)
    const [currentInvoice, setCurrentInvoice] = React.useState<Payment | null>(null)
    const [isStudentComboboxOpen, setIsStudentComboboxOpen] = React.useState(false)
    const [studentSearch, setStudentSearch] = React.useState("")


    // States for cashier closing
    const [todaySummary, setTodaySummary] = React.useState({ inflow: 0, outflow: 0, balance: 0 })
    const [cashierSummary, setCashierSummary] = React.useState<{ name: string, total: number, count: number }[]>([]);

    const isSalesBlocked = subscriptionStatus === 'overdue' || subscriptionStatus === 'blocked';

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [paymentsData, expensesData, membersData, plansData, productsData] = await Promise.all([
                getPayments(),
                getExpenses(),
                getMembers(),
                getPlans(),
                getProducts()
            ]);
            
            setMembers(membersData);
            setPayments(paymentsData);
            setExpenses(expensesData);

            const planItems = plansData.map(p => ({ name: p.name, price: p.price }));
            const productItems = productsData.map(p => ({ name: p.name, price: p.price }));
            const serviceItems = [{ name: "Avaliação Física", price: 150.00 }];

            setAvailableProducts([...planItems, ...serviceItems, ...productItems]);
        } catch (error) {
            toast({ title: "Erro ao buscar dados", description: "Não foi possível carregar os dados financeiros.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        const userData = sessionStorage.getItem("fitcore.user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchData();
    }, [fetchData]);
    
    // Part 1: Check for action on mount, store it in state, and clean the URL
    React.useEffect(() => {
        const action = searchParams.get('action');
        const studentId = searchParams.get('studentId');
        const studentName = searchParams.get('studentName');
        const planName = searchParams.get('planName');
        const planPrice = searchParams.get('planPrice');

        if (action === 'new_payment' && studentId && studentName && planName && planPrice) {
            setPaymentAction({ studentId, studentName, planName, planPrice });
            // Clean up URL to prevent re-triggering
            router.replace('/dashboard/financial', { scroll: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount to capture the params

    // Part 2: Open dialog only when the trigger is set and the data is ready
     React.useEffect(() => {
        if (paymentAction && members.length > 0) {
            const studentExists = members.some(m => m.id === paymentAction.studentId);
            if (studentExists) {
                // SUCCESS: Student found, open dialog.
                setNewPaymentData({
                    studentId: paymentAction.studentId,
                    date: new Date(),
                    items: [{ id: 1, description: paymentAction.planName, quantity: 1, price: parseFloat(paymentAction.planPrice) }],
                });
                setIsPaymentDialogOpen(true);
                toast({
                    title: "Primeiro Pagamento",
                    description: `Registre o pagamento inicial para ${paymentAction.studentName}.`,
                });
                setPaymentAction(null); // Reset action
            } else if (!hasAttemptedRefetch) {
                // FAIL: Student not found, try to refetch data ONCE.
                setHasAttemptedRefetch(true); // Mark that we've tried to refetch
                fetchData(); // Call fetchData again, hopefully it gets the fresh list
            }
        }
    }, [paymentAction, members, toast, fetchData, hasAttemptedRefetch]);

    // Effect for Cash Flow Tab
    React.useEffect(() => {
        if (!selectedDate) {
            setDailyTransactions([]);
            setDailySummary({ inflow: 0, outflow: 0, balance: 0 });
            return;
        }

        const paymentsOfDay = payments
            .filter(p => isSameDay(parseISO(p.date), selectedDate))
            .map(p => ({
                id: p.id,
                time: p.time,
                description: p.items.map(i => `${i.quantity}x ${i.description}`).join(', '),
                amount: parseFloat(p.amount),
                type: 'inflow' as const,
                originalDoc: p
            }));

        const expensesOfDay = expenses
            .filter(e => isSameDay(parseISO(e.date), selectedDate))
            .map(e => ({
                id: e.id,
                time: e.time,
                description: e.description,
                amount: e.amount,
                type: 'outflow' as const,
                category: e.category,
                originalDoc: e
            }));

        const allTransactions = [...paymentsOfDay, ...expensesOfDay].sort((a, b) => a.time.localeCompare(b.time));
        setDailyTransactions(allTransactions);

        const inflow = paymentsOfDay.reduce((sum, t) => sum + t.amount, 0);
        const outflow = expensesOfDay.reduce((sum, t) => sum + t.amount, 0);
        setDailySummary({ inflow, outflow, balance: inflow - outflow });

    }, [selectedDate, payments, expenses]);


    // Effect for Cashier Closing Tab & other summaries
    React.useEffect(() => {
        const today = new Date();
        const todayPayments = payments.filter(p => isSameDay(parseISO(p.date), today));
        const todayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), today));

        const todayInflow = todayPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0)
        const todayOutflow = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
        setTodaySummary({ inflow: todayInflow, outflow: todayOutflow, balance: todayInflow - todayOutflow });

        if (user && (user.role === 'Admin' || user.role === 'Gestor')) {
            const summary = todayPayments.reduce((acc, payment) => {
                const { registeredByName, amount } = payment;
                if (!acc[registeredByName]) {
                    acc[registeredByName] = { total: 0, count: 0 };
                }
                acc[registeredByName].total += parseFloat(amount);
                acc[registeredByName].count += 1;
                return acc;
            }, {} as Record<string, { total: number; count: number }>);
    
            const summaryArray = Object.entries(summary).map(([name, data]) => ({
                name,
                ...data,
            })).sort((a,b) => b.total - a.total);
    
            setCashierSummary(summaryArray);
        }
    }, [payments, expenses, user]);

    // Payment Dialog Logic
    const [newPaymentData, setNewPaymentData] = React.useState({
        studentId: "",
        date: new Date(),
        items: [{ id: 1, description: "", quantity: 1, price: 0.00 }],
    });
    const totalAmount = newPaymentData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const handleItemChange = (index, field, value) => setNewPaymentData(p => ({ ...p, items: p.items.map((it, i) => i === index ? {...it, [field]: value} : it) }));
    const handleAddItem = () => setNewPaymentData(p => ({ ...p, items: [...p.items, { id: Date.now(), description: "", quantity: 1, price: 0 }] }));
    const handleRemoveItem = (index) => setNewPaymentData(p => ({ ...p, items: p.items.filter((_, i) => i !== index) }));
    const handleProductSelect = (index, productName) => {
        const product = availableProducts.find(p => p.name === productName);
        if(product) handleItemChange(index, 'price', product.price);
        handleItemChange(index, 'description', productName);
    };

    const handleSavePayment = async (e) => {
        e.preventDefault();
        const selectedMember = members.find(m => m.id === newPaymentData.studentId);
        if (!selectedMember || newPaymentData.items.length === 0 || !user) {
            toast({ title: "Dados incompletos", variant: "destructive" });
            return;
        }

        const newPayment = {
            studentId: newPaymentData.studentId, student: selectedMember.name, items: newPaymentData.items,
            amount: totalAmount.toFixed(2), date: format(newPaymentData.date, "yyyy-MM-dd"),
            time: format(new Date(), "HH:mm"), status: "Pago", registeredById: user.id, registeredByName: user.name,
        };

        setIsLoading(true);
        try {
            const savedPayment = await addPayment(newPayment);
            setPayments(prev => [savedPayment, ...prev]);
            setCurrentInvoice(savedPayment);
            setIsPaymentDialogOpen(false);
            setIsInvoiceOpen(true);
            setNewPaymentData({ studentId: "", date: new Date(), items: [{ id: 1, description: "", quantity: 1, price: 0.00 }] });
            toast({ title: "Pagamento Registrado" });
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally { setIsLoading(false); }
    };

    // Expense Dialog Logic
    const [newExpenseData, setNewExpenseData] = React.useState(initialExpenseFormState)
    const handleSaveExpense = async (e) => {
        e.preventDefault();
        if (!newExpenseData.description || newExpenseData.amount <= 0 || !user) {
            toast({ title: "Dados incompletos", variant: "destructive" });
            return;
        }

        const expenseData = {
            ...newExpenseData,
            date: format(selectedDate || new Date(), "yyyy-MM-dd"),
            time: format(new Date(), "HH:mm"),
            registeredById: user.id,
            registeredByName: user.name,
        };

        setIsLoading(true);
        try {
            const savedExpense = await addExpense(expenseData);
            setExpenses(prev => [savedExpense, ...prev]);
            setIsExpenseDialogOpen(false);
            setNewExpenseData(initialExpenseFormState);
            toast({ title: "Despesa Registrada" });
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally { setIsLoading(false); }
    };
    
    const clearFilter = () => router.push('/dashboard/financial');
    
    const defaultTab = studentNameParam ? "payments" : "cashflow";

    if (isLoading && !user) return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    return (
    <>
        <InvoiceDialog isOpen={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} invoiceData={currentInvoice} />
        <Tabs defaultValue={defaultTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="cashier_closing">Fechamento de Caixa</TabsTrigger>
                <TabsTrigger value="payments">Histórico de Pagamentos</TabsTrigger>
                <TabsTrigger value="invoices">Faturas</TabsTrigger>
            </TabsList>

            <TabsContent value="cashflow" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="w-full"
                                    locale={ptBR}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">
                                    Movimentações de {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Nenhum dia selecionado"}
                                </CardTitle>
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Entradas</p>
                                        <p className="text-xl font-bold text-green-900 dark:text-green-200">{dailySummary.inflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Saídas</p>
                                        <p className="text-xl font-bold text-red-900 dark:text-red-200">{dailySummary.outflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Saldo</p>
                                        <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{dailySummary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">Hora</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-center w-28">Tipo</TableHead>
                                            <TableHead className="text-right w-32">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyTransactions.length > 0 ? dailyTransactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.time}</TableCell>
                                                <TableCell className="font-medium">{t.description}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={t.type === 'inflow' ? 'secondary' : 'destructive'}>{t.type === 'inflow' ? 'Entrada' : 'Saída'}</Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold ${t.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma movimentação neste dia.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button onClick={() => setIsPaymentDialogOpen(true)} disabled={isSalesBlocked} className="flex-1"><PlusCircle className="mr-2"/> Registrar Venda</Button>
                                <Button onClick={() => setIsExpenseDialogOpen(true)} variant="outline" className="flex-1"><MinusCircle className="mr-2"/> Registrar Despesa</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            
            <TabsContent value="cashier_closing">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="font-headline">Fechamento de Caixa de Hoje</CardTitle>
                        <CardDescription>Resumo de vendas e despesas registradas hoje, {format(new Date(), "dd/MM/yyyy")}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Total em Vendas (Entradas)</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{todaySummary.inflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Total em Despesas (Saídas)</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{todaySummary.outflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">Saldo do Caixa</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{todaySummary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
                            </Card>
                        </div>
                        {user && (user.role === 'Admin' || user.role === 'Gestor') && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Vendas por Funcionário</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead><UsersRound className="inline-block mr-2" /> Funcionário</TableHead>
                                            <TableHead className="text-center">Vendas Realizadas</TableHead>
                                            <TableHead className="text-right">Total Arrecadado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cashierSummary.length > 0 ? cashierSummary.map(item => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.count}</TableCell>
                                                <TableCell className="text-right">{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhuma venda registrada hoje.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" onClick={() => toast({ title: "Caixa Fechado!", description: "O resumo do dia foi salvo e o caixa foi fechado com sucesso." })}>
                            <ArrowRightLeft className="mr-2" /> Fechar Caixa e Bater Valores
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            
            <TabsContent value="payments">
                <Card className="mt-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">Histórico de Pagamentos</CardTitle>
                                {studentNameParam ? (
                                    <CardDescription>Exibindo pagamentos para <span className="font-bold text-foreground">{studentNameParam}</span>.</CardDescription>
                                ) : (
                                    <CardDescription>Gerencie todos os pagamentos dos alunos.</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {studentNameParam && (<Button variant="outline" size="sm" onClick={clearFilter}><X className="mr-2 h-4 w-4" />Limpar filtro</Button>)}
                                <Button onClick={() => setIsPaymentDialogOpen(true)} disabled={isSalesBlocked} title={isSalesBlocked ? "Bloqueado por pendência" : ""}>
                                    <PlusCircle className="mr-2 h-4 w-4" />Registrar Pagamento
                                </Button>
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
                                {payments.length > 0 ? payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.student}</TableCell>
                                        <TableCell>R$ {payment.amount}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell><Badge variant={payment.status === 'Pago' ? 'secondary' : 'destructive'}>{payment.status}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menu</span></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setCurrentInvoice(payment); setIsInvoiceOpen(true); }}>Ver Fatura</DropdownMenuItem>
                                                    <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum pagamento encontrado.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="invoices">
                 <Card className="mt-4">
                    <CardHeader><CardTitle className="font-headline">Faturas</CardTitle><CardDescription>Visualize e emita faturas para seus alunos.</CardDescription></CardHeader>
                    <CardContent><p className="text-muted-foreground text-center py-8">Funcionalidade em desenvolvimento.</p></CardContent>
                 </Card>
            </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Registrar Novo Pagamento</DialogTitle><DialogDescription>Preencha os detalhes para registrar um pagamento e gerar a fatura.</DialogDescription></DialogHeader>
                <form id="payment-form" onSubmit={handleSavePayment}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="student">Aluno</Label>
                                <Popover open={isStudentComboboxOpen} onOpenChange={setIsStudentComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isStudentComboboxOpen}
                                            className="w-full justify-between"
                                        >
                                            {newPaymentData.studentId
                                                ? members.find((member) => member.id === newPaymentData.studentId)?.name
                                                : "Selecione ou pesquise um aluno..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                                        <div className="p-2">
                                            <Input
                                                placeholder="Pesquisar aluno..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-[250px] overflow-auto">
                                            {members
                                                .filter(member => member.name.toLowerCase().includes(studentSearch.toLowerCase()))
                                                .map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="text-sm p-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                                                        onClick={() => {
                                                            setNewPaymentData({ ...newPaymentData, studentId: member.id });
                                                            setIsStudentComboboxOpen(false);
                                                            setStudentSearch("");
                                                        }}
                                                    >
                                                        {member.name}
                                                    </div>
                                                ))
                                            }
                                            {members.filter(member => member.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                                                <p className="p-2 text-sm text-center text-muted-foreground">Nenhum aluno encontrado.</p>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2"><Label htmlFor="paymentDate">Data</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left", !newPaymentData.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newPaymentData.date ? format(newPaymentData.date, "dd/MM/yyyy") : <span>Escolha uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newPaymentData.date} onSelect={(date) => date && setNewPaymentData({...newPaymentData, date})} initialFocus /></PopoverContent></Popover></div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="mb-2 block">Itens da Fatura</Label>
                            <div className="space-y-2">{newPaymentData.items.map((item, index) => (<div key={item.id} className="flex items-end gap-2"><div className="flex-1"><Label htmlFor={`item-desc-${index}`} className="sr-only">Descrição</Label><Select onValueChange={(value) => handleProductSelect(index, value)} defaultValue={item.description}><SelectTrigger><SelectValue placeholder="Selecione um item" /></SelectTrigger><SelectContent>{availableProducts.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></div><div className="w-20"><Label htmlFor={`item-qty-${index}`} className="sr-only">Qtd.</Label><Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} placeholder="Qtd." /></div><div className="w-28"><Label htmlFor={`item-price-${index}`} className="sr-only">Preço</Label><Input id={`item-price-${index}`} type="number" step="0.01" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))} placeholder="Preço" /></div><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}</div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}>Adicionar Item</Button>
                        </div>
                        <Separator />
                        <div className="flex justify-end text-right"><div><p className="text-muted-foreground">Total</p><p className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</p></div></div>
                    </div>
                </form>
                <DialogFooter><Button type="submit" form="payment-form" disabled={isLoading}>Salvar Pagamento e Gerar Nota</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Registrar Nova Despesa</DialogTitle><DialogDescription>Preencha os detalhes para registrar uma saída de caixa.</DialogDescription></DialogHeader>
                <form id="expense-form" onSubmit={handleSaveExpense}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label htmlFor="exp-desc">Descrição</Label><Input id="exp-desc" value={newExpenseData.description} onChange={e => setNewExpenseData(s => ({...s, description: e.target.value}))} placeholder="Ex: Compra de material de limpeza" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="exp-amount">Valor (R$)</Label><Input id="exp-amount" type="number" step="0.01" value={newExpenseData.amount} onChange={e => setNewExpenseData(s => ({...s, amount: parseFloat(e.target.value)}))} placeholder="150.00" /></div>
                            <div className="grid gap-2"><Label htmlFor="exp-cat">Categoria</Label><Select value={newExpenseData.category} onValueChange={(v: ExpenseCategory) => setNewExpenseData(s => ({...s, category: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Fornecedores">Fornecedores</SelectItem><SelectItem value="Salários">Salários</SelectItem><SelectItem value="Manutenção">Manutenção</SelectItem><SelectItem value="Marketing">Marketing</SelectItem><SelectItem value="Outros">Outros</SelectItem></SelectContent></Select></div>
                        </div>
                    </div>
                </form>
                <DialogFooter><Button type="submit" form="expense-form" disabled={isLoading}>Salvar Despesa</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  )
}
