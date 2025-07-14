"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Dumbbell, Receipt, HeartPulse, Loader2, Shield, FileText, MapPin, MessageSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMemberById, updateMember, type Member } from "@/services/members"
import { getAssessments, type Assessment } from "@/services/assessments"
import { getPaymentsByStudentId, type Payment } from "@/services/payments"
import { getWorkoutPlans, type WorkoutPlan } from "@/services/workouts"

export default function MemberProfilePage() {
    const params = useParams()
    const router = useRouter()
    const memberId = params.id as string
    const { toast } = useToast()

    const [member, setMember] = React.useState<Member | null>(null)
    const [assessments, setAssessments] = React.useState<Assessment[]>([])
    const [payments, setPayments] = React.useState<Payment[]>([])
    const [workoutPlans, setWorkoutPlans] = React.useState<WorkoutPlan[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false);
    const [muralMessage, setMuralMessage] = React.useState("");

    React.useEffect(() => {
        if (!memberId) return

        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [memberData, assessmentsData, paymentsData, plansData] = await Promise.all([
                    getMemberById(memberId),
                    getAssessments(memberId), 
                    getPaymentsByStudentId(memberId),
                    getWorkoutPlans()
                ]);

                setMember(memberData);
                if (memberData) {
                    setAssessments(assessmentsData.filter(a => a.studentId === memberId));
                    setMuralMessage(memberData.mural || "");
                }
                setPayments(paymentsData);
                setWorkoutPlans(plansData);

            } catch (error) {
                console.error("Failed to fetch member data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [memberId])

    const handleSaveMural = async () => {
        if (!member) return;
        setIsSaving(true);
        try {
            await updateMember(member.id, { mural: muralMessage });
            toast({ title: "Mural Atualizado", description: "A mensagem foi salva e está visível para o aluno." });
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAssignPlan = async (planId: string) => {
        if (!member) return;
        setIsSaving(true);
        try {
            await updateMember(member.id, { assignedPlanId: planId });
            const updatedMember = await getMemberById(member.id); // Refetch member data
            setMember(updatedMember);
            toast({ title: "Plano Atribuído!", description: "O aluno agora tem um novo plano de treino." });
        } catch (error) {
            toast({ title: "Erro ao atribuir plano", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

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
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="payments"><Receipt className="mr-2" /> Pagamentos</TabsTrigger>
                            <TabsTrigger value="workouts"><Dumbbell className="mr-2" /> Treino</TabsTrigger>
                            <TabsTrigger value="assessments"><HeartPulse className="mr-2" /> Avaliações</TabsTrigger>
                            <TabsTrigger value="medical"><FileText className="mr-2" /> Atestados</TabsTrigger>
                             <TabsTrigger value="mural"><MessageSquare className="mr-2" /> Mural</TabsTrigger>
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
                                <CardContent className="space-y-4">
                                     <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="workout-plan">Atribuir Plano de Treino</Label>
                                         <Select 
                                            onValueChange={handleAssignPlan}
                                            value={member.assignedPlanId || ""}
                                            disabled={isSaving}
                                        >
                                            <SelectTrigger id="workout-plan">
                                                <SelectValue placeholder="Selecione um plano de treino" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workoutPlans.map(plan => (
                                                    <SelectItem key={plan.id} value={plan.id}>
                                                        {plan.name} ({plan.level})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="h-24 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                                        <p>Selecione um plano acima para atribuí-lo ao aluno.</p>
                                    </div>
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
                                <CardContent className="space-y-4">
                                     <div className="grid gap-2">
                                        <Label htmlFor="contractFile" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Anexar Atestado/Laudo
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input id="contractFile" type="file" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                            <Button>Enviar</Button>
                                        </div>
                                    </div>
                                    <Separator/>
                                    <div className="space-y-2">
                                        <Label htmlFor="medicalNotes">Observações Médicas</Label>
                                        <Textarea 
                                            id="medicalNotes" 
                                            defaultValue={member.medicalNotes} 
                                            placeholder="Descreva aqui o conteúdo de atestados, laudos ou qualquer observação médica relevante."
                                            rows={6}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="mural" className="mt-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Mural de Recados</CardTitle>
                                    <CardDescription>
                                        Deixe uma mensagem, dica ou orientação que ficará visível no portal deste aluno.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid w-full gap-2">
                                        <Label htmlFor="mural-message">Mensagem para o aluno</Label>
                                        <Textarea 
                                            id="mural-message"
                                            placeholder="Ex: Não se esqueça de focar na execução correta do agachamento. Vamos corrigir na próxima aula!" 
                                            rows={5}
                                            value={muralMessage}
                                            onChange={(e) => setMuralMessage(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleSaveMural} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Salvar no Mural
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
