"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, DollarSign, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAcademies, type Academy } from "@/services/academies"

const planPrices = {
    "Iniciante": 97,
    "Profissional": 197,
    "Business": 397,
    "Enterprise": 697,
};

export default function SuperAdminBillingPage() {
    const [academies, setAcademies] = React.useState<Academy[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const data = await getAcademies();
            setAcademies(data);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const activeSubscriptions = academies.filter(a => a.status === 'Ativa');
    const totalMRR = activeSubscriptions.reduce((acc, a) => {
        return acc + (planPrices[a.subscriptionPlan] || 0);
    }, 0);
    const arpa = activeSubscriptions.length > 0 ? totalMRR / activeSubscriptions.length : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-headline">Faturamento e Métricas</h1>
                <p className="text-muted-foreground">Análise da receita recorrente e saúde financeira da plataforma.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Mensal Recorrente (MRR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <p className="text-xs text-muted-foreground">Receita total de assinaturas ativas.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Média por Conta (ARPA)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{arpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <p className="text-xs text-muted-foreground">Valor médio pago por academia.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
                        <p className="text-xs text-muted-foreground">Clientes pagantes atualmente.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes das Assinaturas</CardTitle>
                    <CardDescription>Lista de todas as academias com assinaturas ativas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Academia</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Data de Cadastro</TableHead>
                                <TableHead className="text-right">Valor Mensal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeSubscriptions.map(academy => (
                                <TableRow key={academy.id}>
                                    <TableCell className="font-medium">{academy.name}</TableCell>
                                    <TableCell><Badge variant="outline">{academy.subscriptionPlan}</Badge></TableCell>
                                    <TableCell>{format(new Date(academy.createdAt.replace(/-/g, '/')), "dd 'de' MMMM, yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell className="text-right">{planPrices[academy.subscriptionPlan].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
