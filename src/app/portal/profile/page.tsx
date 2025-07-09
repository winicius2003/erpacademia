"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Loader2, User, FileSignature, CalendarDays, CheckCircle, AlertCircle, XCircle } from "lucide-react"

import { getMemberById, type Member } from "@/services/members"
import { getAssessments, type Assessment } from "@/services/assessments"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const statusConfig = {
    Ativo: { icon: CheckCircle, color: "text-green-500", label: "Ativo" },
    Atrasado: { icon: AlertCircle, color: "text-yellow-500", label: "Pendente" },
    Inativo: { icon: XCircle, color: "text-red-500", label: "Inativo" },
}

export default function StudentProfilePage() {
    const [user, setUser] = React.useState<Member | null>(null)
    const [assessments, setAssessments] = React.useState<Assessment[]>([])
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
                const [memberData, assessmentsData] = await Promise.all([
                    getMemberById(parsedUser.id),
                    getAssessments(),
                ]);
                
                setUser(memberData);
                if (memberData) {
                    setAssessments(assessmentsData.filter(a => a.studentId === memberData.id));
                }

            } catch (error) {
                console.error("Failed to fetch student profile data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    if (!user) {
        return <div className="text-center">Não foi possível carregar seus dados. Tente fazer login novamente.</div>
    }

    const CurrentStatusIcon = statusConfig[user.status].icon
    const currentStatusColor = statusConfig[user.status].color

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User /> Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Nome:</span>
                                <span className="font-semibold">{user.name}</span>
                            </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-semibold">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Telefone:</span>
                                <span className="font-semibold">{user.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nascimento:</span>
                                <span className="font-semibold">{format(parseISO(user.dob), "dd/MM/yyyy")}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">CPF:</span>
                                <span className="font-semibold">{user.cpf}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileSignature /> Dados do Plano</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Plano Atual:</span>
                                <span className="font-semibold">{user.plan}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Vencimento:</span>
                                <span className="font-semibold">{format(parseISO(user.expires), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={user.status === 'Ativo' ? 'secondary' : 'destructive'} className="gap-1">
                                    <CurrentStatusIcon className={`h-3 w-3 ${currentStatusColor}`} />
                                    <span className={currentStatusColor}>{statusConfig[user.status].label}</span>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarDays /> Histórico de Avaliações</CardTitle>
                            <CardDescription>Acompanhe sua evolução física ao longo do tempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Peso</TableHead>
                                        <TableHead>% Gordura</TableHead>
                                        <TableHead>M. Muscular</TableHead>
                                        <TableHead>Tipo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assessments.length > 0 ? assessments.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{format(new Date(item.date.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{item.measures.weight.toFixed(1)} kg</TableCell>
                                            <TableCell>{item.measures.bodyFat?.toFixed(1) || '-'} %</TableCell>
                                            <TableCell>{item.measures.muscleMass?.toFixed(1) || '-'} kg</TableCell>
                                            <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Nenhuma avaliação encontrada.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
