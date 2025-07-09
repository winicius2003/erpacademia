"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { User, Printer, Loader2, Search, Dumbbell, Check } from "lucide-react"

import { getMembers, type Member } from "@/services/members"
import { getWorkoutPlanById, type WorkoutPlan, getWorkoutPlans } from "@/services/workouts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export default function PrintWorkoutPage() {
    const [members, setMembers] = React.useState<Member[]>([])
    const [allWorkoutPlans, setAllWorkoutPlans] = React.useState<WorkoutPlan[]>([])
    const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
    const [selectedPlan, setSelectedPlan] = React.useState<WorkoutPlan | null>(null);
    const [selectedWorkout, setSelectedWorkout] = React.useState<WorkoutPlan['workouts'][0] | null>(null);
    const [isLoading, setIsLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // Fetch all members and all workout plans separately for efficiency
                const [membersData, plansData] = await Promise.all([
                    getMembers(),
                    getWorkoutPlans()
                ]);
                setMembers(membersData);
                setAllWorkoutPlans(plansData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSelectMember = (memberName: string) => {
        setOpen(false);
        setSelectedWorkout(null); // Reset selected workout when member changes
        const member = members.find(m => m.name === memberName);
        
        if (!member) {
            setSelectedMember(null);
            setSelectedPlan(null);
            return;
        }

        setSelectedMember(member);
        
        if (member.assignedPlanId) {
            const plan = allWorkoutPlans.find(p => p.id === member.assignedPlanId);
            setSelectedPlan(plan || null);
        } else {
            setSelectedPlan(null);
        }
    };
    
    const handlePrint = () => {
        window.print();
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline">Imprimir Treino do Dia</CardTitle>
                <CardDescription>Pesquise pelo aluno, selecione o treino e imprima o cupom para a musculação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Aluno</label>
                     <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : (selectedMember ? selectedMember.name : "Selecione um aluno...")}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                            <Command>
                                <CommandInput placeholder="Pesquisar aluno..." />
                                <CommandList>
                                    <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        {members.map((member) => (
                                            <CommandItem
                                                key={member.id}
                                                value={member.name}
                                                onSelect={() => handleSelectMember(member.name)}
                                                onClick={() => handleSelectMember(member.name)}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", selectedMember?.id === member.id ? "opacity-100" : "opacity-0")} />
                                                {member.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                
                {selectedMember && (
                    <>
                        {selectedPlan ? (
                            <div className="space-y-2 border-t pt-4">
                                <label className="text-sm font-medium">Selecione o Treino para Imprimir:</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPlan.workouts.map(workoutDay => (
                                        <Button 
                                            key={workoutDay.id} 
                                            variant={selectedWorkout?.id === workoutDay.id ? "default" : "secondary"} 
                                            onClick={() => setSelectedWorkout(workoutDay)}
                                        >
                                            {workoutDay.name.split(':')[0] || workoutDay.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4 border-t mt-4">Este aluno não possui um treino atribuído.</p>
                        )}
                    </>
                )}

                {selectedWorkout && (
                    <div id="printable-area" className="printable-workout border-t pt-4">
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-lg">Academia Exemplo</h3>
                            <p><strong>Aluno(a):</strong> {selectedMember?.name}</p>
                            <p><strong>Data:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
                        </div>
                        <hr />
                         <div className="space-y-2">
                            <h4 className="font-bold text-center uppercase">{selectedWorkout.name}</h4>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="text-left">Exercício</th>
                                        <th className="text-center">Séries</th>
                                        <th className="text-center">Reps</th>
                                        <th className="text-right">Desc.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {selectedWorkout.exercises.map(ex => (
                                    <tr key={ex.id}>
                                        <td>{ex.name}</td>
                                        <td className="text-center">{ex.sets}</td>
                                        <td className="text-center">{ex.reps}</td>
                                        <td className="text-right">{ex.rest}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                         <hr />
                         <p className="text-center text-xs font-semibold">Bons treinos!</p>
                    </div>
                )}

            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handlePrint} disabled={!selectedMember || !selectedWorkout}>
                    <Printer className="mr-2" />
                    Imprimir Treino Selecionado
                </Button>
            </CardFooter>
        </Card>
    );
}
