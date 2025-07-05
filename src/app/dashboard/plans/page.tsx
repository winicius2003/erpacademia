"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getPlans, addPlan, updatePlan, deletePlan, type Plan } from "@/services/plans"

const initialFormState = {
  id: "",
  name: "",
  price: 0,
  durationDays: 30,
};

type PlanFormData = typeof initialFormState;

export default function PlansPage() {
    const [plans, setPlans] = React.useState<Plan[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [planFormData, setPlanFormData] = React.useState<PlanFormData>(initialFormState);

    const fetchPlans = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            toast({ title: "Erro ao buscar planos", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleAddNewClick = () => {
        setIsEditing(false);
        setPlanFormData(initialFormState);
        setIsDialogOpen(true);
    };

    const handleEditClick = (plan: Plan) => {
        setIsEditing(true);
        setPlanFormData(plan);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (planId: string) => {
        try {
            await deletePlan(planId);
            toast({ title: "Plano Excluído" });
            fetchPlans();
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };
    
    const handleInputChange = (field: keyof PlanFormData, value: any) => {
        setPlanFormData(prev => ({ ...prev, [field]: value }))
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {
            name: planFormData.name,
            price: Number(planFormData.price),
            durationDays: Number(planFormData.durationDays),
        };

        setIsLoading(true);
        try {
            if (isEditing) {
                await updatePlan(planFormData.id, dataToSave);
                toast({ title: "Plano Atualizado" });
            } else {
                await addPlan(dataToSave);
                toast({ title: "Plano Adicionado" });
            }
            fetchPlans();
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Planos da Academia</CardTitle>
                            <CardDescription>
                                Gerencie os planos de matrícula oferecidos aos seus alunos.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Plano</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-64 w-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Plano</TableHead>
                                    <TableHead>Preço (R$)</TableHead>
                                    <TableHead>Duração (dias)</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map(plan => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>{plan.price.toFixed(2)}</TableCell>
                                        <TableCell>{plan.durationDays}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleEditClick(plan)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleDeleteClick(plan.id)} className="text-destructive">Excluir</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar Plano" : "Adicionar Novo Plano"}</DialogTitle>
                    </DialogHeader>
                    <form id="plan-form" onSubmit={handleSavePlan}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={planFormData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Ex: Plano Mensal" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" type="number" step="0.01" value={planFormData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder="97.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="durationDays">Duração (dias)</Label>
                                    <Input id="durationDays" type="number" value={planFormData.durationDays} onChange={e => handleInputChange('durationDays', e.target.value)} placeholder="30" />
                                </div>
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="plan-form">{isEditing ? "Salvar Alterações" : "Salvar Plano"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
