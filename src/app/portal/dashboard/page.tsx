"use client"

import * as React from "react"
import { format, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Dumbbell, BarChart, CheckCircle, XCircle, AlertCircle, PartyPopper, MessageSquareWarning, CalendarX } from "lucide-react"

import { getMemberById, type Member } from "@/services/members"
import { getWorkoutPlanById, type WorkoutPlan } from "@/services/workouts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


const statusConfig = {
    Ativo: { icon: CheckCircle, color: "text-green-500", label: "Ativo" },
    Atrasado: { icon: AlertCircle, color: "text-yellow-500", label: "Pendente" },
    Inativo: { icon: XCircle, color: "text-red-500", label: "Inativo" },
}

type PersonalAlert = {
    type: 'birthday' | 'payment' | 'absence' | 'none';
    Icon: React.ElementType;
    title: string;
    message: string;
}

export default function StudentDashboardPage() {
    const [user, setUser] = React.useState<Member | null>(null)
    const [workoutPlan, setWorkoutPlan] = React.useState<WorkoutPlan | null>(null)
    const [personalAlert, setPersonalAlert] = React.useState<PersonalAlert | null>(null);
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
                const memberData = await getMemberById(parsedUser.id);
                setUser(memberData);

                if (memberData?.assignedPlanId) {
                    const planData = await getWorkoutPlanById(memberData.assignedPlanId)
                    setWorkoutPlan(planData)
                }

                // --- Generate Personal Alert ---
                if (memberData) {
                    const today = new Date();
                    const dob = parseISO(memberData.dob);
                    if (isSameDay(today, dob)) {
                         setPersonalAlert({
                            type: 'birthday',
                            Icon: PartyPopper,
                            title: 'Feliz Aniversário!',
                            message: `A equipe da Academia Exemplo deseja a você um dia incrível, cheio de alegrias e ótimos treinos!`
                        });
                    } else if (memberData.status === 'Atrasado') {
                         setPersonalAlert({
                            type: 'payment',
                            Icon: MessageSquareWarning,
                            title: 'Pagamento Pendente',
                            message: 'Olá! Identificamos uma pendência no seu plano. Por favor, procure a recepção para regularizar sua situação.'
                        });
                    } else if (memberData.attendanceStatus === 'Faltante') {
                        setPersonalAlert({
                            type: 'absence',
                            Icon: CalendarX,
                            title: 'Sentimos sua falta!',
                            message: 'Que tal voltar a treinar com a gente hoje? Estamos te esperando para manter o foco nos seus objetivos!'
                        });
                    }
                }
                // -----------------------------

            } catch (error) {
                console.error("Failed to fetch student dashboard data:", error)
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

            {personalAlert && (
                <Alert className="bg-primary/5 border-primary/20">
                    <personalAlert.Icon className="h-4 w-4 text-primary" />
                    <AlertTitle className="font-headline text-primary">{personalAlert.title}</AlertTitle>
                    <AlertDescription>
                        {personalAlert.message}
                    </AlertDescription>
                </Alert>
            )}

            <h1 className="text-3xl font-bold font-headline">Bem-vindo(a) de volta, {user.name.split(' ')[0]}!</h1>
            
            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                {/* Main content: Workout Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Dumbbell className="text-primary"/> Seu Treino da Semana</CardTitle>
                            <CardDescription>
                                {workoutPlan 
                                    ? `Plano: ${workoutPlan.name} | Objetivo: ${workoutPlan.goal}` 
                                    : "Você ainda não tem um plano de treino atribuído."
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workoutPlan ? (
                                <Accordion type="single" collapsible defaultValue={workoutPlan.workouts[0]?.id}>
                                    {workoutPlan.workouts.map(day => (
                                        <AccordionItem value={day.id} key={day.id}>
                                            <AccordionTrigger className="font-semibold">{day.name}</AccordionTrigger>
                                            <AccordionContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Exercício</TableHead>
                                                            <TableHead className="text-center">Séries</TableHead>
                                                            <TableHead className="text-center">Reps</TableHead>
                                                            <TableHead className="text-center">Descanso</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {day.exercises.map(ex => (
                                                            <TableRow key={ex.id}>
                                                                <TableCell className="font-medium">{ex.name}</TableCell>
                                                                <TableCell className="text-center">{ex.sets}</TableCell>
                                                                <TableCell className="text-center">{ex.reps}</TableCell>
                                                                <TableCell className="text-center">{ex.rest}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>Converse com seu professor para que ele monte um plano de treino para você.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Status and Notifications */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart /> Meu Plano</CardTitle>
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
            </div>
        </div>
    )
}
