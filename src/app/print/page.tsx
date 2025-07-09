
"use client"

import * as React from "react"
import { format } from "date-fns"
import { User, Printer, Loader2, Search, X } from "lucide-react"

import { getMembers, type Member } from "@/services/members"
import { type WorkoutPlan, getWorkoutPlans } from "@/services/workouts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


function PrintableView({ member, workout }: { member: Member | null, workout: WorkoutPlan['workouts'][0] | null }) {
    if (!workout || !member) return null;

    return (
        <div id="printable-area" className="printable-workout text-black">
            <div className="text-center space-y-1">
                <h3 className="font-bold text-lg">Academia Exemplo</h3>
                <p><strong>Aluno(a):</strong> {member?.name}</p>
                <p><strong>Data:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
            <hr />
            <div className="space-y-2">
                <h4 className="font-bold text-center uppercase">{workout.name}</h4>
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
                    {workout.exercises.map(ex => (
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
    );
}


export default function PrintWorkoutPage() {
    const [allMembers, setAllMembers] = React.useState<Member[]>([]);
    const [allWorkoutPlans, setAllWorkoutPlans] = React.useState<WorkoutPlan[]>([]);
    
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
    
    const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
    const [selectedPlan, setSelectedPlan] = React.useState<WorkoutPlan | null>(null);
    const [selectedWorkout, setSelectedWorkout] = React.useState<WorkoutPlan['workouts'][0] | null>(null);
    
    const [isLoading, setIsLoading] = React.useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    // Fetch initial data
    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [membersData, plansData] = await Promise.all([
                    getMembers(),
                    getWorkoutPlans()
                ]);
                setAllMembers(membersData);
                setAllWorkoutPlans(plansData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Handle search filtering
    React.useEffect(() => {
        if (searchQuery.length > 1) {
            const results = allMembers.filter(m => 
                m.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(results);
        } else {
            setFilteredMembers([]);
        }
    }, [searchQuery, allMembers]);


    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setSearchQuery(""); // Clear search
        setFilteredMembers([]); // Hide results list
        
        if (member.assignedPlanId) {
            const plan = allWorkoutPlans.find(p => p.id === member.assignedPlanId);
            setSelectedPlan(plan || null);
        } else {
            setSelectedPlan(null);
        }
    };

    const handleReset = () => {
        setSelectedMember(null);
        setSelectedPlan(null);
        setSelectedWorkout(null);
        setSearchQuery("");
    };
    
    const handlePrint = () => {
        window.print();
        setIsPreviewOpen(false);
    }
    
    const handleOpenPreview = () => {
        setIsPreviewOpen(true);
    }

    return (
        <>
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="font-headline">Imprimir Treino do Dia</CardTitle>
                    <CardDescription>Pesquise pelo aluno, selecione o treino e imprima o cupom para a musculação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[300px]">
                    {!selectedMember ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Digite o nome do aluno..." 
                                    className="pl-10 text-lg h-12"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                            {filteredMembers.length > 0 && (
                                <div className="border rounded-md max-h-64 overflow-y-auto">
                                    {filteredMembers.map(member => (
                                        <button 
                                            key={member.id} 
                                            className="w-full text-left flex items-center gap-3 p-3 hover:bg-muted first:rounded-t-md last:rounded-b-md"
                                            onClick={() => handleSelectMember(member)}
                                        >
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-primary"/>
                                    <span className="font-bold text-lg">{selectedMember.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    <X className="mr-2 h-4 w-4"/>Trocar Aluno
                                </Button>
                            </div>
                            
                            {selectedPlan ? (
                                <div className="space-y-2 pt-4">
                                    <label className="text-sm font-medium text-muted-foreground">Selecione o Treino para Imprimir:</label>
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
                                <p className="text-center text-muted-foreground py-6">Este aluno não possui um treino atribuído.</p>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleOpenPreview} disabled={!selectedWorkout}>
                        <Printer className="mr-2" />
                        Imprimir Treino Selecionado
                    </Button>
                </CardFooter>
            </Card>

            {/* Hidden div for printing */}
            <div className="hidden">
                <PrintableView member={selectedMember} workout={selectedWorkout} />
            </div>
            
            {/* Print Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pré-visualização da Impressão</DialogTitle>
                        <DialogDescription>
                            É assim que o cupom de treino será impresso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-md p-4 my-4 bg-gray-100 dark:bg-gray-800 flex justify-center">
                       <div className="w-[302px] bg-white p-2 shadow-lg"> {/* Simulate 80mm receipt paper */}
                           <PrintableView member={selectedMember} workout={selectedWorkout} />
                       </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancelar</Button>
                        <Button onClick={handlePrint}>Confirmar e Imprimir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
