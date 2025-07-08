"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Loader2, Wallet } from "lucide-react"

import { getPaymentsByStudentId, type Payment } from "@/services/payments"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function StudentFinancialPage() {
    const [payments, setPayments] = React.useState<Payment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const sessionUser = sessionStorage.getItem("fitcore.user")
        if (!sessionUser) {
            setIsLoading(false)
            return;
        }

        const parsedUser = JSON.parse(sessionUser)

        async function fetchData() {
            try {
                const paymentsData = await getPaymentsByStudentId(parsedUser.id);
                setPayments(paymentsData);
            } catch (error) {
                console.error("Failed to fetch student financial data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Meu Financeiro</h1>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wallet /> Histórico de Pagamentos</CardTitle>
                    <CardDescription>Visualize todas as suas transações e faturas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Forma de Pagamento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? payments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-medium">{payment.items.map(i => i.description).join(', ')}</TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.status === 'Pago' ? 'secondary' : 'destructive'}>{payment.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">R$ {payment.amount}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhum pagamento encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
