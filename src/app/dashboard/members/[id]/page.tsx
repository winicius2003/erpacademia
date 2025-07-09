"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Dumbbell, Receipt, HeartPulse, Loader2, Shield, FileText, MapPin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getMemberById, type Member } from "@/services/members"
import { getAssessments, type Assessment } from "@/services/assessments"
import { getPaymentsByStudentId, type Payment } from "@/services/payments"

export default function MemberProfilePage() {
    const params = useParams()
    const router = useRouter()
    const memberId = params.id as string

    const [member, setMember] = React.useState<Member | null>(null)
    const [assessments, setAssessments] = React.useState<Assessment[]>([])
    const [payments, setPayments] = React.useState<Payment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!memberId) return

        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [memberData, assessmentsData, paymentsData] = await Promise.all([
                    getMemberById(memberId),
                    getAssessments(memberId), // Assuming getAssessments can filter by studentId
                    getPaymentsByStudentId(memberId)
                ]);

                setMember(memberData);
                setAssessments(assessmentsData.filter(a => a.studentId === memberId));
                setPayments(paymentsData);

            } catch (error) {
                console.error("Failed to fetch member data:", error)
                // Optionally, show a toast message
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [memberId])

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!member) {
        return (
            <div className="text-center">
                <p>Aluno não encontrado.</p>
                <Button variant="link" asChild><Link href="/dashboard/members">Voltar para a lista</Link></Button>
            </div>
        )
    }

    const statusVariant = {
        "Ativo": "secondary" as const,
        "Inativo": "outline" as const,
        "Atrasado": "destructive" as const,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline">{member.name}</h1>
                    <p className="text-muted-foreground">Ficha completa do aluno</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center">
                            <Avatar className="h-24 w-24 mb-2">
                                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person face" />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{member.name}</CardTitle>
                            <CardDescription>
                                <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plano:</span>
                                <span className="font-medium">{member.plan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vencimento:</span>
                                <span className="font-medium">{format(parseISO(member.expires), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Professor:</span>
                                <span className="font-medium">{member.professor}</span>
                            </div>
                            <Separator />
                             <div className="space-y-1">
                                <h4 className="font-medium text-muted-foreground">Objetivo Principal</h4>
                                <p>{member.goal || "Não informado"}</p>
                            </div>
                             <div className="space-y-1">
                                <h4 className="font-medium text-muted-foreground">Observações</h4>
                                <p>{member.notes || "Nenhuma"}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações de Contato</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">E-mail:</span>
                                <span className="font-medium">{member.email}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Telefone:</span>
                                <span className="font-medium">{member.phone}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">CPF:</span>
                                <span className="font-medium">{member.cpf}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-muted-foreground flex-shrink-0"><MapPin className="inline h-4 w-4 mr-1" /> Endereço:</span>
                                <span className="font-medium text-right">{`${member.address.street}, ${member.address.number} - ${member.address.neighborhood}`}</span>
                            </div>
                        </CardContent>
                    </Card>
                    {member.guardian && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Shield /> Responsável</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nome:</span>
                                    <span className="font-medium">{member.guardian.name}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Telefone:</span>
                                    <span className="font-medium">{member.guardian.phone}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">CPF:</span>
                                    <span className="font-medium">{member.guardian.cpf}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <Tabs defaultValue="payments">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="payments"><Receipt className="mr-2" /> Pagamentos</TabsTrigger>
                            <TabsTrigger value="workouts"><Dumbbell className="mr-2" /> Treino</TabsTrigger>
                            <TabsTrigger value="assessments"><HeartPulse className="mr-2" /> Avaliações</TabsTrigger>
                            <TabsTrigger value="medical"><FileText className="mr-2" /> Atestados</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="payments" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Histórico de Pagamentos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Descrição</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.length > 0 ? payments.map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                                                    <TableCell>R$ {payment.amount}</TableCell>
                                                    <TableCell><Badge variant={payment.status === 'Pago' ? 'secondary' : 'destructive'}>{payment.status}</Badge></TableCell>
                                                    <TableCell>{payment.items.map(i => i.description).join(', ')}</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">Nenhum pagamento encontrado.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="workouts" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plano de Treino Atual</CardTitle>
                                </CardHeader>
                                <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
                                    <p>Funcionalidade de atribuição de treinos em breve.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="assessments" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Histórico de Avaliações Físicas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Peso</TableHead>
                                                <TableHead>% Gordura</TableHead>
                                                <TableHead>M. Muscular</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assessments.length > 0 ? assessments.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{format(parseISO(item.date), "dd/MM/yyyy")}</TableCell>
                                                    <TableCell>{item.measures.weight.toFixed(1)} kg</TableCell>
                                                    <TableCell>{item.measures.bodyFat?.toFixed(1) || '-'} %</TableCell>
                                                    <TableCell>{item.measures.muscleMass?.toFixed(1) || '-'} kg</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">Nenhuma avaliação encontrada.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="medical" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Atestados e Laudos Médicos</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {member.medicalNotes ? (
                                        <p>{member.medicalNotes}</p>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center">
                                            <p>Nenhum atestado ou laudo registrado para este aluno.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
