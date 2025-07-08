"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Dumbbell, Bell, BarChart, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { getMemberById, type Member } from "@/services/members"
import { getWorkoutPlanById, type WorkoutPlan } from "@/services/workouts"
import { getNotificationsForAcademy, type Notification } from "@/services/notifications"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const statusConfig = {
    Ativo: { icon: CheckCircle, color: "text-green-500", label: "Ativo" },
    Atrasado: { icon: AlertCircle, color: "text-yellow-500", label: "Atrasado" },
    Inativo: { icon: XCircle, color: "text-red-500", label: "Inativo" },
}

export default function StudentDashboardPage() {
    const [user, setUser] = React.useState<Member | null>(null)
    const [workoutPlan, setWorkoutPlan] = React.useState<WorkoutPlan | null>(null)
    const [notifications, setNotifications] = React.useState<Notification[]>([])
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
                // Assuming student's academy ID is 'gym-1' for demo purposes
                const ACADEMY_ID = 'gym-1';

                const [memberData, notificationsData] = await Promise.all([
                    getMemberById(parsedUser.id),
                    getNotificationsForAcademy(ACADEMY_ID),
                ]);

                setUser(memberData);
                setNotifications(notificationsData);

                if (memberData?.assignedPlanId) {
                    const planData = await getWorkoutPlanById(memberData.assignedPlanId)
                    setWorkoutPlan(planData)
                }

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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="text-primary"/> Avisos da Academia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length > 0 ? (
                                <ul className="space-y-4">
                                    {notifications.map(item => (
                                        <li key={item.id} className="space-y-1">
                                            <p className="font-semibold text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-muted-foreground py-4">Nenhum aviso no momento.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
