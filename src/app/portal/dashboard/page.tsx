
"use client"

import * as React from "react"
import { format, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"
import { Loader2, Dumbbell, PartyPopper, MessageSquareWarning, CalendarX } from "lucide-react"

import { getMemberById, type Member } from "@/services/members"
import { getWorkoutPlanById, type WorkoutPlan } from "@/services/workouts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


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

            <div>
                <h1 className="text-3xl font-bold font-headline">Meu Treino</h1>
                {user && <p className="text-muted-foreground">Bem-vindo(a) de volta, {user.name.split(' ')[0]}!</p>}
            </div>
            
            <div className="space-y-6">
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
                                            <div className="space-y-4">
                                                {day.exercises.map(ex => (
                                                    <div key={ex.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-3 rounded-lg bg-muted/50">
                                                        <div className="relative w-full md:w-24 h-32 md:h-20 flex-shrink-0">
                                                            <Image
                                                                src={ex.imageUrl || `https://placehold.co/400x300.png`}
                                                                alt={ex.name}
                                                                fill
                                                                className="rounded-md object-cover"
                                                                data-ai-hint={ex.name.split(' ').slice(0, 2).join(' ').toLowerCase()}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-foreground">{ex.name}</p>
                                                        </div>
                                                        <div className="flex gap-6 text-center w-full justify-around md:w-auto md:justify-start pt-4 md:pt-0 mt-4 md:mt-0 border-t md:border-none border-border">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Séries</p>
                                                                <p className="font-bold">{ex.sets}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Reps</p>
                                                                <p className="font-bold">{ex.reps}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Descanso</p>
                                                                <p className="font-bold">{ex.rest}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
        </div>
    )
}
