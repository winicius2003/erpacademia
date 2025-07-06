"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Building, Loader2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getAcademies, addAcademy, updateAcademy, deleteAcademy, type Academy, type AcademyStatus } from "@/services/academies"
import { Separator } from "@/components/ui/separator"

const initialFormState = {
    name: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    subscriptionPlan: "Iniciante" as Academy['subscriptionPlan'],
    expiresAt: format(new Date(), "yyyy-MM-dd"),
};
type AcademyFormData = typeof initialFormState;


export default function AcademiesPage() {
    const [academies, setAcademies] = React.useState<Academy[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [academyFormData, setAcademyFormData] = React.useState<AcademyFormData>(initialFormState);
    
    const [itemToDelete, setItemToDelete] = React.useState<Academy | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

    const fetchAcademies = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAcademies();
            setAcademies(data);
        } catch (error) {
            toast({ title: "Erro ao buscar academias", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchAcademies();
    }, [fetchAcademies]);

    const handleInputChange = (field: keyof AcademyFormData, value: string) => {
        setAcademyFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveAcademy = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {
            name: academyFormData.name,
            adminName: academyFormData.adminName,
            adminEmail: academyFormData.adminEmail,
            subscriptionPlan: academyFormData.subscriptionPlan,
            expiresAt: academyFormData.expiresAt,
        };

        setIsLoading(true);
        try {
            await addAcademy(dataToSave, academyFormData.adminPassword);
            toast({ title: "Academia Criada", description: "A nova academia e seu administrador foram cadastrados." });
            fetchAcademies();
            setIsDialogOpen(false);
            setAcademyFormData(initialFormState);
        } catch (error) {
            toast({ title: "Erro ao criar academia", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (academy: Academy, newStatus: AcademyStatus) => {
        await updateAcademy(academy.id, { status: newStatus });
        toast({ title: "Status Atualizado", description: `A academia ${academy.name} foi marcada como ${newStatus}.` });
        fetchAcademies();
    };

    const handleDeleteClick = (academy: Academy) => {
        setItemToDelete(academy);
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        await deleteAcademy(itemToDelete.id);
        toast({ title: "Academia Excluída", description: `A academia ${itemToDelete.name} foi removida.` });
        fetchAcademies();
        setIsDeleteAlertOpen(false);
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-headline">Gerenciamento de Academias</CardTitle>
                        <CardDescription>Adicione, suspenda e gerencie todas as academias na plataforma.</CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2" /> Nova Academia</Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Academia</TableHead>
                                <TableHead>Administrador</TableHead>
                                <TableHead>Alunos</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {academies.map(academy => (
                                <TableRow key={academy.id}>
                                    <TableCell className="font-medium">{academy.name}</TableCell>
                                    <TableCell>{academy.adminName}</TableCell>
                                    <TableCell>{academy.studentCount}</TableCell>
                                    <TableCell><Badge variant="outline">{academy.subscriptionPlan}</Badge></TableCell>
                                    <TableCell>{format(new Date(academy.expiresAt.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                                    <TableCell><Badge variant={academy.status === 'Ativa' ? 'secondary' : 'destructive'}>{academy.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                {academy.status === 'Ativa' ? (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(academy, 'Suspensa')}>Suspender</DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(academy, 'Ativa')}>Reativar</DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(academy)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
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
                    <DialogTitle>Cadastrar Nova Academia</DialogTitle>
                    <DialogDescription>Preencha os dados para criar uma nova academia e seu administrador.</DialogDescription>
                </DialogHeader>
                <form id="academy-form" onSubmit={handleSaveAcademy}>
                    <div className="grid gap-4 py-4">
                        <h4 className="font-semibold text-sm">Dados da Academia</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Academia</Label>
                            <Input id="name" value={academyFormData.name} onChange={e => handleInputChange('name', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="grid gap-2">
                                <Label htmlFor="subscriptionPlan">Plano de Assinatura</Label>
                                <Select value={academyFormData.subscriptionPlan} onValueChange={(v: Academy['subscriptionPlan']) => handleInputChange('subscriptionPlan', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                                        <SelectItem value="Profissional">Profissional</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="expiresAt">Vencimento da Assinatura</Label>
                                <Input id="expiresAt" type="date" value={academyFormData.expiresAt} onChange={e => handleInputChange('expiresAt', e.target.value)} />
                            </div>
                        </div>

                        <Separator className="my-2" />
                        <h4 className="font-semibold text-sm">Dados do Administrador</h4>
                         <div className="grid gap-2">
                            <Label htmlFor="adminName">Nome do Administrador</Label>
                            <Input id="adminName" value={academyFormData.adminName} onChange={e => handleInputChange('adminName', e.target.value)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="adminEmail">E-mail (Será o login)</Label>
                                <Input id="adminEmail" type="email" value={academyFormData.adminEmail} onChange={e => handleInputChange('adminEmail', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="adminPassword">Senha Provisória</Label>
                                <Input id="adminPassword" type="password" value={academyFormData.adminPassword} onChange={e => handleInputChange('adminPassword', e.target.value)} />
                            </div>
                        </div>

                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="academy-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a academia <span className="font-semibold">{itemToDelete?.name}</span> e todos os seus dados associados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
