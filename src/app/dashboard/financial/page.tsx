
"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { format, isToday, isSameDay, parseISO, parse, startOfDay, endOfDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, TrendingUp, Users, AlertCircle, Trash2, X, Target, Loader2, UsersRound, ArrowRightLeft, MinusCircle, ChevronsUpDown, Search, Upload, RotateCcw } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { getPayments, addPayment, reversePayment, type Payment, type PaymentMethod, type PaymentStatus } from "@/services/payments"
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

type ImportedPayment = {
    nome: string,
    email?: string,
    itemDescricao: string,
    valor: string,
    formaPagamento: PaymentMethod,
    data: string, // YYYY-MM-DD
    idTransacao?: string,
}

const initialExpenseFormState = {
    description: "",
    amount: 0,
    category: "Outros" as ExpenseCategory,
}

const initialPaymentFormState = {
    studentId: "",
    date: new Date(),
    items: [{ id: 1, description: "", quantity: 1, price: 0.00 }],
    paymentMethod: "Dinheiro" as PaymentMethod,
    transactionId: "",
}

export default function FinancialPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const { status: subscriptionStatus } = useSubscription()
    const studentNameParam = searchParams.get('studentName')

    const [paymentAction, setPaymentAction] = React.useState<{studentId: string; studentName: string; planName: string; planPrice: string;} | null>(null);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = React.useState(false);


    const [user, setUser] = React.useState<{ id: string, name: string, role: Role } | null>(null);
    const [payments, setPayments] = React.useState<Payment[]>([])
    const [expenses, setExpenses] = React.useState<Expense[]>([])
    const [members, setMembers] = React.useState<Member[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [availableProducts, setAvailableProducts] = React.useState<{ name: string, price: number }[]>([]);
    
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    })
    const [periodTransactions, setPeriodTransactions] = React.useState<Transaction[]>([])
    const [periodSummary, setPeriodSummary] = React.useState({ inflow: 0, outflow: 0, balance: 0 })
    
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false)
    const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false)
    const [currentInvoice, setCurrentInvoice] = React.useState<Payment | null>(null)
    const [isStudentComboboxOpen, setIsStudentComboboxOpen] = React.useState(false)
    const [studentSearch, setStudentSearch] = React.useState("")
    const [paymentSearch, setPaymentSearch] = React.useState("");
    const [paymentToReverse, setPaymentToReverse] = React.useState<Payment | null>(null)
    const [isReverseAlertOpen, setIsReverseAlertOpen] = React.useState(false)

    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)
    const [importFile, setImportFile] = React.useState<File | null>(null)
    const [importPreview, setImportPreview] = React.useState<ImportedPayment[]>([]);
    const [importErrors, setImportErrors] = React.useState<string[]>([])
    const [isImporting, setIsImporting] = React.useState(false)
    const [importStep, setImportStep] = React.useState(1)


    const [todaySummary, setTodaySummary] = React.useState({ inflow: 0, outflow: 0, balance: 0 })
    const [cashierSummary, setCashierSummary] = React.useState<{ name: string, total: number, count: number }[]>([]);
    const [personalCashierSummary, setPersonalCashierSummary] = React.useState<{ total: number; count: number } | null>(null);


    const isSalesBlocked = subscriptionStatus === 'overdue' || subscriptionStatus === 'blocked';
    const hasFullAccess = user?.role === 'Admin' || user?.role === 'Gestor';

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
    
    React.useEffect(() => {
        const action = searchParams.get('action');
        const studentId = searchParams.get('studentId');
        const studentName = searchParams.get('studentName');
        const planName = searchParams.get('planName');
        const planPrice = searchParams.get('planPrice');

        if (action === 'new_payment' && studentId && studentName && planName && planPrice) {
            setPaymentAction({ studentId, studentName, planName, planPrice });
            router.replace('/dashboard/financial', { scroll: false });
        }
    }, []); 

     React.useEffect(() => {
        if (paymentAction && members.length > 0) {
            const studentExists = members.some(m => m.id === paymentAction.studentId);
            if (studentExists) {
                setNewPaymentData(prev => ({
                    ...prev,
                    studentId: paymentAction.studentId,
                    items: [{ id: 1, description: paymentAction.planName, quantity: 1, price: parseFloat(paymentAction.planPrice) }],
                }));
                setIsPaymentDialogOpen(true);
                toast({
                    title: "Primeiro Pagamento",
                    description: `Registre o pagamento inicial para ${paymentAction.studentName}.`,
                });
                setPaymentAction(null); 
            } else if (!hasAttemptedRefetch) {
                setHasAttemptedRefetch(true); 
                fetchData(); 
            }
        }
    }, [paymentAction, members, toast, fetchData, hasAttemptedRefetch]);

    React.useEffect(() => {
        if (!date?.from) {
            setPeriodTransactions([]);
            setPeriodSummary({ inflow: 0, outflow: 0, balance: 0 });
            return;
        }

        const fromDate = startOfDay(date.from);
        const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);

        const paymentsOfDay = payments
            .filter(p => {
              const pDate = parseISO(p.date)
              return pDate >= fromDate && pDate <= toDate
            })
            .map(p => ({
                id: p.id,
                time: p.time,
                description: p.items.map(i => `${i.quantity}x ${i.description}`).join(', '),
                amount: parseFloat(p.amount),
                type: 'inflow' as const,
                originalDoc: p
            }));

        const expensesOfDay = expenses
            .filter(e => {
              const eDate = parseISO(e.date)
              return eDate >= fromDate && eDate <= toDate
            })
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
        setPeriodTransactions(allTransactions);

        const inflow = paymentsOfDay.reduce((sum, t) => sum + t.amount, 0);
        const outflow = expensesOfDay.reduce((sum, t) => sum + t.amount, 0);
        setPeriodSummary({ inflow, outflow, balance: inflow - outflow });

    }, [date, payments, expenses]);


    React.useEffect(() => {
        const today = new Date();
        const todayPayments = payments.filter(p => isSameDay(parseISO(p.date), today));
        const todayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), today));

        const todayInflow = todayPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0)
        const todayOutflow = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
        setTodaySummary({ inflow: todayInflow, outflow: todayOutflow, balance: todayInflow - todayOutflow });

        if (user) {
            if (user.role === 'Admin' || user.role === 'Gestor') {
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
            } else {
                 // Personal summary logic for Gerente/Recepção
                const mySales = todayPayments.filter(p => p.registeredById === user.id);
                const myTotal = mySales.reduce((acc, p) => acc + parseFloat(p.amount), 0);
                setPersonalCashierSummary({ total: myTotal, count: mySales.length });
            }
        }
    }, [payments, expenses, user]);

    const [newPaymentData, setNewPaymentData] = React.useState(initialPaymentFormState);
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
            time: format(new Date(), "HH:mm"), status: "Pago" as const, registeredById: user.id, registeredByName: user.name,
            paymentMethod: newPaymentData.paymentMethod,
            transactionId: newPaymentData.transactionId
        };

        setIsLoading(true);
        try {
            const savedPayment = await addPayment(newPayment as Omit<Payment, 'id'>);
            setPayments(prev => [savedPayment, ...prev]);
            setCurrentInvoice(savedPayment);
            setIsPaymentDialogOpen(false);
            setIsInvoiceOpen(true);
            setNewPaymentData(initialPaymentFormState);
            toast({ title: "Pagamento Registrado" });
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally { setIsLoading(false); }
    };

    const [newExpenseData, setNewExpenseData] = React.useState(initialExpenseFormState)
    const handleSaveExpense = async (e) => {
        e.preventDefault();
        if (!newExpenseData.description || newExpenseData.amount <= 0 || !user) {
            toast({ title: "Dados incompletos", variant: "destructive" });
            return;
        }

        const expenseData = {
            ...newExpenseData,
            date: format(date?.from || new Date(), "yyyy-MM-dd"),
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
    
    const defaultTab = hasFullAccess ? (studentNameParam ? "payments" : "cashflow") : "cashier_closing";
    
    const filteredPayments = React.useMemo(() => {
        const lowercasedSearch = paymentSearch.toLowerCase();
        
        if (!lowercasedSearch) {
            if (studentNameParam) {
                const lowercasedStudentName = studentNameParam.toLowerCase();
                return payments.filter(p => p.student.toLowerCase() === lowercasedStudentName);
            }
            return payments;
        }

        return payments.filter(payment =>
            payment.student.toLowerCase().includes(lowercasedSearch) ||
            (payment.transactionId && payment.transactionId.toLowerCase().includes(lowercasedSearch)) ||
            payment.id.toLowerCase().includes(lowercasedSearch)
        );
    }, [payments, paymentSearch, studentNameParam]);

    const resetImportDialog = () => {
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      setImportStep(1);
      setIsImporting(false);
    }
  
    const handleDownloadTemplate = () => {
      const headers = `"Nome do Aluno","Email do Aluno","Item Descrição","Valor","Forma Pagamento (Dinheiro, Pix, Cartão de Débito, Cartão de Crédito, Boleto)","Data (YYYY-MM-DD)","ID Transação (Opcional)"`;
      const sampleData = `\n"João da Silva","joao.silva@example.com","Plano Mensal","97.00","Cartão de Crédito","${format(new Date(), 'yyyy-MM-dd')}","12345ABC"`;
      const csvContent = "data:text/csv;charset=utf-8," + headers + sampleData;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "modelo_importacao_pagamentos.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handlePreviewImport = () => {
        if (!importFile) return;
        setIsImporting(true);
        setImportErrors([]);
        
        const processData = (data: any[]) => {
            const membersByName = new Map(members.map(m => [m.name.toLowerCase(), m]));
            let currentErrors: string[] = [];
            
            const mappedData = data.map((row, index) => {
                 const normalizedRow: {[key: string]: any} = {};
                 // Normalize headers to be lowercase and without accents/special chars for flexible matching
                 for (const key in row) {
                    const normalizedKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    normalizedRow[normalizedKey] = row[key];
                 }

                 // Prioritize 'Nome' as the key identifier for the student
                 const studentName = normalizedRow['nome'];

                 if (!studentName) {
                     currentErrors.push(`Linha ${index + 2}: A coluna "Nome" do aluno é obrigatória e não foi encontrada na sua planilha.`);
                     return null;
                 }
                 
                 // Map other fields with fallbacks for different column names
                 const itemDescricao = normalizedRow['plano'] || normalizedRow['produto'] || normalizedRow['item descricao'];
                 const valor = String(normalizedRow['valor'] || '').replace(',', '.');
                 const formaPagamento = normalizedRow['forma pagamento'] || normalizedRow['condicao pagamento'];
                 const dataPagamento = normalizedRow['data lancamento'] || normalizedRow['data termino'] || normalizedRow['data de cadastro'] || normalizedRow['data'];

                 // Validate required fields
                 if (!itemDescricao) { currentErrors.push(`Linha ${index + 2}: Coluna 'Plano' ou 'Produto' não encontrada para o aluno "${studentName}".`); return null; }
                 if (!valor || isNaN(parseFloat(valor))) { currentErrors.push(`Linha ${index + 2}: Valor inválido ou não encontrado para o aluno "${studentName}".`); return null; }
                 if (!formaPagamento) { currentErrors.push(`Linha ${index + 2}: 'Forma Pagamento' não encontrada para o aluno "${studentName}".`); return null; }
                 if (!dataPagamento) { currentErrors.push(`Linha ${index + 2}: Coluna de data ('Data Lançamento', 'Data Término' ou 'Data de Cadastro') não encontrada para o aluno "${studentName}".`); return null; }


                 // Check if student exists in the system by name
                 if (!membersByName.has(String(studentName).toLowerCase())) { 
                     currentErrors.push(`Linha ${index + 2}: Aluno "${studentName}" não encontrado no sistema. Verifique se o nome na planilha corresponde exatamente ao do cadastro.`); 
                 }
                 
                 const payment: ImportedPayment = {
                     nome: studentName,
                     email: normalizedRow['email'], // Email is optional
                     itemDescricao: itemDescricao,
                     valor: valor,
                     formaPagamento: formaPagamento as PaymentMethod,
                     data: String(dataPagamento),
                     idTransacao: normalizedRow['id transacao'] || normalizedRow['no contrato'],
                 };

                 return payment;
            }).filter((p): p is ImportedPayment => Boolean(p));

            setImportPreview(mappedData);
            setImportErrors(currentErrors);
            setImportStep(2);
            setIsImporting(false);
        };

        if (importFile.name.endsWith('.csv')) {
            Papa.parse(importFile, { header: true, skipEmptyLines: true, complete: res => processData(res.data) });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                // For Excel, we might need to handle dates differently.
                // sheet_to_json by default might convert dates to numbers.
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                // Re-format dates from Excel if they are parsed as Date objects
                const processedJson = json.map(row => {
                    const newRow = {...row};
                    for (const key in newRow) {
                        if (newRow[key] instanceof Date) {
                            newRow[key] = format(newRow[key] as Date, 'yyyy-MM-dd');
                        }
                    }
                    return newRow;
                });
                processData(processedJson);
            };
            reader.readAsArrayBuffer(importFile);
        }
    }

    const handleConfirmImport = async () => {
        toast({ title: "Importação de Pagamentos", description: "Esta funcionalidade ainda está em desenvolvimento." });
    }

    const handleReverseClick = (payment: Payment) => {
        setPaymentToReverse(payment);
        setIsReverseAlertOpen(true);
    };

    const handleConfirmReverse = async () => {
        if (!paymentToReverse || !user) return;

        setIsLoading(true);
        try {
            await reversePayment(paymentToReverse.id, user.id, user.name);
            toast({ title: "Pagamento Estornado", description: "A transação foi revertida com sucesso." });
            fetchData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Não foi possível estornar o pagamento.";
            toast({ title: "Erro ao Estornar", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
            setPaymentToReverse(null);
            setIsReverseAlertOpen(false);
        }
    };


    if (isLoading && !user) return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    return (
    <>
        <InvoiceDialog isOpen={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} invoiceData={currentInvoice} />
        <Tabs defaultValue={defaultTab} className="flex-1">
            <TabsList className={cn("grid w-full", hasFullAccess ? "grid-cols-4" : "grid-cols-3")}>
                {hasFullAccess && <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>}
                <TabsTrigger value="cashier_closing">Fechamento de Caixa</TabsTrigger>
                <TabsTrigger value="payments">Histórico de Pagamentos</TabsTrigger>
                <TabsTrigger value="invoices">Faturas</TabsTrigger>
            </TabsList>

            {hasFullAccess && (
            <TabsContent value="cashflow" className="mt-4">
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                  <CardTitle className="font-headline">
                                      Movimentações do Período
                                  </CardTitle>
                                  <CardDescription>
                                    Selecione um dia ou um período para visualizar as transações.
                                  </CardDescription>
                              </div>
                               <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                    date.to ? (
                                        <>
                                        {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                                        {format(date.to, "LLL dd, y", { locale: ptBR })}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y", { locale: ptBR })
                                    )
                                    ) : (
                                    <span>Escolha um período</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                />
                                </PopoverContent>
                            </Popover>
                            </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Entradas</p>
                                  <p className="text-xl font-bold text-green-900 dark:text-green-200">{periodSummary.inflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Saídas</p>
                                  <p className="text-xl font-bold text-red-900 dark:text-red-200">{periodSummary.outflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Saldo</p>
                                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{periodSummary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              </div>
                          </div>
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
                                    {periodTransactions.length > 0 ? periodTransactions.map(t => (
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
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma movimentação neste período.</TableCell></TableRow>
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
            </TabsContent>
            )}
            
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
                        
                        {hasFullAccess ? (
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
                        ) : personalCashierSummary && (
                             <Card>
                                <CardHeader><CardTitle className="text-base">Meu Resumo de Vendas de Hoje</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
                                        <p className="text-2xl font-bold">{personalCashierSummary.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Arrecadado</p>
                                        <p className="text-2xl font-bold">{personalCashierSummary.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
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
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle className="font-headline">Histórico de Pagamentos</CardTitle>
                                {studentNameParam ? (
                                    <CardDescription>Exibindo pagamentos para <span className="font-bold text-foreground">{studentNameParam}</span>.</CardDescription>
                                ) : (
                                    <CardDescription>Gerencie todos os pagamentos dos alunos.</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Pesquisar por aluno, ID..."
                                        className="pl-8 w-full md:w-[250px]"
                                        value={paymentSearch}
                                        onChange={(e) => setPaymentSearch(e.target.value)}
                                    />
                                </div>
                                {studentNameParam && (<Button variant="outline" size="sm" onClick={clearFilter}><X className="mr-2 h-4 w-4" />Limpar filtro</Button>)}
                                <Button variant="outline" onClick={() => { setIsImportDialogOpen(true); resetImportDialog(); }}>
                                    <Upload className="mr-2 h-4 w-4" /> Importar Excel
                                </Button>
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
                                    <TableHead>ID</TableHead>
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
                                        <TableCell className="font-mono text-xs text-muted-foreground">{payment.transactionId || payment.id}</TableCell>
                                        <TableCell>R$ {payment.amount}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                payment.status === 'Pago' ? 'secondary' :
                                                payment.status === 'Vencida' ? 'destructive' : 'outline'
                                            } className={cn(payment.status === 'Estornado' && 'border-yellow-500 text-yellow-600')}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menu</span></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setCurrentInvoice(payment); setIsInvoiceOpen(true); }}>Ver Fatura</DropdownMenuItem>
                                                    <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => handleReverseClick(payment)} disabled={payment.status === 'Estornado'} className="text-destructive focus:text-destructive">
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        Estornar Pagamento
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum pagamento encontrado.</TableCell></TableRow>
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

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div className="grid gap-2">
                                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                                <Select value={newPaymentData.paymentMethod} onValueChange={(v: PaymentMethod) => setNewPaymentData({...newPaymentData, paymentMethod: v, transactionId: ''})}>
                                    <SelectTrigger id="paymentMethod"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="Pix">Pix</SelectItem>
                                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="Boleto">Boleto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            { (newPaymentData.paymentMethod === 'Cartão de Crédito' || newPaymentData.paymentMethod === 'Cartão de Débito') && (
                            <div className="grid gap-2">
                                <Label htmlFor="transactionId">ID da Transação</Label>
                                <Input id="transactionId" value={newPaymentData.transactionId} onChange={e => setNewPaymentData({...newPaymentData, transactionId: e.target.value})} placeholder="Código do comprovante" />
                            </div>
                            )}
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

         {/* Import Payments Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Importar Pagamentos</DialogTitle>
                <DialogDescription>
                  {importStep === 1 
                    ? "Faça o upload de um arquivo CSV ou Excel. O sistema registrará os pagamentos para os alunos existentes."
                    : "Confirme os dados para importação. Pagamentos com erros não serão importados."}
                </DialogDescription>
            </DialogHeader>

            {importStep === 1 && (
              <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                      <Label htmlFor="csv-file">Arquivo CSV ou Excel</Label>
                      <Input 
                          id="csv-file" 
                          type="file" 
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          disabled={isImporting}
                      />
                      <Button variant="link" size="sm" className="p-0 h-auto justify-start" onClick={handleDownloadTemplate}>
                        Baixar modelo de exemplo (.csv)
                      </Button>
                  </div>
              </div>
            )}
            
            {importStep === 2 && (
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                {importErrors.length > 0 && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    <h3 className="font-bold mb-2">Erros Encontrados:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                <h3 className="font-bold">Pré-visualização ({importPreview.length} pagamentos):</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Forma Pgto.</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreview.map((p, index) => (
                      <TableRow key={index} className={importErrors.some(e => e.startsWith(`Linha ${index + 2}`)) ? 'bg-destructive/10' : ''}>
                        <TableCell>{p.nome || p.email}</TableCell>
                        <TableCell>{p.itemDescricao}</TableCell>
                        <TableCell>{p.valor}</TableCell>
                        <TableCell><Badge variant="outline">{p.formaPagamento}</Badge></TableCell>
                        <TableCell>{p.data}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsImportDialogOpen(false)}>Cancelar</Button>
                {importStep === 1 && (
                  <Button onClick={handlePreviewImport} disabled={isImporting || !importFile}>
                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Visualizar Importação
                  </Button>
                )}
                 {importStep === 2 && (
                   <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setImportStep(1)}>Voltar</Button>
                      <Button onClick={handleConfirmImport} disabled={isImporting || importPreview.length === 0 || importErrors.length > 0}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Importar {importPreview.length} Pagamentos
                      </Button>
                   </div>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isReverseAlertOpen} onOpenChange={setIsReverseAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Estorno do Pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pagamento de <span className="font-bold">{paymentToReverse?.amount ? parseFloat(paymentToReverse.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</span> será marcado como "Estornado".
              Uma transação de saída correspondente será criada no fluxo de caixa para balancear as contas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleConfirmReverse}
              disabled={isLoading}
            >
              Confirmar Estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
