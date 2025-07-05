"use client"

import * as React from "react"
import { PlusCircle, MoreVertical, Clock, User, Tag, Edit, Trash2, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getSchedule, addClass, updateClass, deleteClass, type ScheduledClass } from "@/services/schedule"
import { getEmployees, type Employee } from "@/services/employees"

const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const initialFormState = {
  id: "",
  name: "",
  dayOfWeek: "Segunda",
  startTime: "",
  endTime: "",
  instructorId: "",
  plan: "All-inclusive",
}

type ClassFormData = typeof initialFormState;

export default function SchedulePage() {
  const [schedule, setSchedule] = React.useState<Record<string, ScheduledClass[]>>({})
  const [instructors, setInstructors] = React.useState<Employee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [classFormData, setClassFormData] = React.useState<ClassFormData>(initialFormState)
  
  const [classToDelete, setClassToDelete] = React.useState<ScheduledClass | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);


  const fetchScheduleAndInstructors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [scheduleData, employeesData] = await Promise.all([
        getSchedule(),
        getEmployees(),
      ]);
      
      const groupedSchedule = scheduleData.reduce((acc, currentClass) => {
        (acc[currentClass.dayOfWeek] = acc[currentClass.dayOfWeek] || []).push(currentClass);
        return acc;
      }, {} as Record<string, ScheduledClass[]>);

      // Sort classes by start time
      for (const day in groupedSchedule) {
        groupedSchedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
      
      setSchedule(groupedSchedule);
      setInstructors(employeesData.filter(e => e.role === 'Professor'));

    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a agenda e os instrutores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchScheduleAndInstructors();
  }, [fetchScheduleAndInstructors]);

  const handleInputChange = (field: keyof ClassFormData, value: any) => {
    setClassFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddNewClick = () => {
    setIsEditing(false);
    setClassFormData(initialFormState);
    setIsDialogOpen(true);
  }
  
  const handleEditClick = (scheduledClass: ScheduledClass) => {
    setIsEditing(true);
    setClassFormData({
      id: scheduledClass.id,
      name: scheduledClass.name,
      dayOfWeek: scheduledClass.dayOfWeek,
      startTime: scheduledClass.startTime,
      endTime: scheduledClass.endTime,
      instructorId: scheduledClass.instructorId,
      plan: scheduledClass.plan,
    });
    setIsDialogOpen(true);
  }

  const handleDeleteClick = (scheduledClass: ScheduledClass) => {
    setClassToDelete(scheduledClass);
    setIsDeleteAlertOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setIsLoading(true);
    try {
        await deleteClass(classToDelete.id);
        toast({ title: "Aula Excluída", description: "A aula foi removida da agenda." });
        fetchScheduleAndInstructors();
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover a aula.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setClassToDelete(null);
        setIsDeleteAlertOpen(false);
    }
  };


  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.name || !classFormData.startTime || !classFormData.endTime || !classFormData.instructorId) {
        toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos.", variant: "destructive" });
        return;
    }

    const instructorName = instructors.find(i => i.id === classFormData.instructorId)?.name || 'N/A';
    
    const classData = {
        name: classFormData.name,
        dayOfWeek: classFormData.dayOfWeek,
        startTime: classFormData.startTime,
        endTime: classFormData.endTime,
        instructorId: classFormData.instructorId,
        instructorName: instructorName,
        plan: classFormData.plan as ScheduledClass['plan'],
    }

    setIsLoading(true);
    try {
        if (isEditing) {
            await updateClass(classFormData.id, classData);
            toast({ title: "Aula Atualizada", description: "Os dados da aula foram atualizados." });
        } else {
            await addClass(classData);
            toast({ title: "Aula Adicionada", description: "A nova aula foi adicionada à agenda." });
        }
        fetchScheduleAndInstructors();
    } catch (error) {
        toast({ title: "Erro ao salvar", description: "Não foi possível salvar a aula.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsDialogOpen(false);
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-headline">Agenda de Aulas</CardTitle>
              <CardDescription>
                Gerencie o calendário de aulas especiais da academia.
              </CardDescription>
            </div>
            <Button onClick={handleAddNewClick} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />Adicionar Aula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {daysOfWeek.slice(1).map(day => ( // Skip Sunday for now
                <div key={day} className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-center pb-2 border-b-2">{day}</h3>
                  <div className="space-y-3 min-h-[200px]">
                    {schedule[day]?.map(cls => (
                      <Card key={cls.id} className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                             <h4 className="font-semibold text-primary">{cls.name}</h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleEditClick(cls)}>
                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDeleteClick(cls)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                         
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{cls.instructorName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              <Badge variant="secondary">{cls.plan}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {!schedule[day] && (
                        <div className="text-center text-sm text-muted-foreground pt-8">
                            Nenhuma aula agendada.
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Aula" : "Adicionar Nova Aula"}</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da aula especial.
              </DialogDescription>
            </DialogHeader>
            <form id="class-form" onSubmit={handleSaveClass}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Aula</Label>
                  <Input id="name" value={classFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ex: Ritbox, Muay Thai" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="startTime">Horário Início</Label>
                        <Input id="startTime" type="time" value={classFormData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="endTime">Horário Fim</Label>
                        <Input id="endTime" type="time" value={classFormData.endTime} onChange={(e) => handleInputChange('endTime', e.target.value)} />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="dayOfWeek">Dia da Semana</Label>
                    <Select value={classFormData.dayOfWeek} onValueChange={(v: string) => handleInputChange('dayOfWeek', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {daysOfWeek.slice(1, 6).map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="instructor">Professor(a)</Label>
                    <Select value={classFormData.instructorId} onValueChange={(v: string) => handleInputChange('instructorId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione um professor" /></SelectTrigger>
                        <SelectContent>
                            {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="plan">Plano Associado</Label>
                    <Select value={classFormData.plan} onValueChange={(v: string) => handleInputChange('plan', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All-inclusive">All-inclusive</SelectItem>
                            <SelectItem value="Aeróbico">Aeróbico</SelectItem>
                            <SelectItem value="Lutas">Lutas</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="class-form" disabled={isLoading}>{isEditing ? "Salvar Alterações" : "Adicionar Aula"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a aula de <span className="font-semibold">{classToDelete?.name}</span> da agenda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
