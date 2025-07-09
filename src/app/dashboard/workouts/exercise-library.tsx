"use client"

import * as React from "react"
import Image from "next/image"
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getExercises, type ExerciseListItem } from "@/services/exercises"

const initialFormState = {
  name: "",
  group: "Peito (Chest)",
  imageUrl: "",
}

type ExerciseFormData = typeof initialFormState

export function ExerciseLibrary() {
  const [exerciseGroups, setExerciseGroups] = React.useState<ExerciseListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [exerciseFormData, setExerciseFormData] = React.useState<ExerciseFormData>(initialFormState)
  const { toast } = useToast()

  const [exerciseToDelete, setExerciseToDelete] = React.useState<{group: string, name: string} | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

  const fetchExercises = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getExercises()
      setExerciseGroups(data)
    } catch (error) {
      toast({ title: "Erro ao buscar exercícios", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const handleAddNew = () => {
    setIsEditing(false)
    setExerciseFormData(initialFormState)
    setIsDialogOpen(true)
  }
  
  const handleEditClick = (exercise: { name: string, group: string }) => {
    setIsEditing(true)
    setExerciseFormData({
      name: exercise.name,
      group: exercise.group,
      imageUrl: "" // Assuming we don't store the URL, so it's fresh for edit
    })
    setIsDialogOpen(true)
  }
  
  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditing) {
       toast({
        title: "Exercício Atualizado!",
        description: `O exercício "${exerciseFormData.name}" foi atualizado (simulação).`,
      })
    } else {
      toast({
        title: "Exercício Salvo!",
        description: `O exercício "${exerciseFormData.name}" foi salvo (simulação).`,
      })
    }
    
    setIsDialogOpen(false)
  }
  
  const handleInputChange = (field: keyof ExerciseFormData, value: string) => {
    setExerciseFormData(prev => ({...prev, [field]: value}));
  }
  
  const handleDeleteClick = (group: string, exerciseName: string) => {
    setExerciseToDelete({group: group, name: exerciseName});
    setIsDeleteAlertOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!exerciseToDelete) return;
    // In a real app, you would call an API to delete the exercise
    toast({
        title: "Exercício Excluído (Simulação)",
        description: `O exercício "${exerciseToDelete.name}" foi removido.`,
        variant: "destructive",
    })
    setIsDeleteAlertOpen(false);
    setExerciseToDelete(null);
    // In a real app, you would call fetchExercises() here to refresh the list.
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Banco de Exercícios</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os exercícios disponíveis para montar os treinos.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exercício
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Accordion type="multiple" className="w-full space-y-2">
              {exerciseGroups.map((group) => (
                <AccordionItem value={group.group} key={group.group} className="border rounded-md bg-muted/30">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium text-lg">
                    {group.group}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-background">
                    <div className="space-y-2">
                      {group.exercises.map((exercise) => (
                        <div key={exercise} className="group flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                          <div className="relative w-24 h-16 flex-shrink-0">
                            <Image
                              src={`https://placehold.co/400x300.png`}
                              alt={exercise}
                              fill
                              className="rounded-md object-cover"
                              data-ai-hint={exercise.split(' ').slice(0, 2).join(' ').toLowerCase()}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise}</h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick({ name: exercise, group: group.group })}><Edit className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(group.group, exercise)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Exercício" : "Adicionar Novo Exercício"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Altere os dados do exercício." : "Preencha os detalhes para adicionar um novo exercício ao banco."}
              </DialogDescription>
            </DialogHeader>
            <form id="exercise-form" onSubmit={handleSaveExercise}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Exercício</Label>
                  <Input id="name" value={exerciseFormData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Ex: Supino Reto com Barra" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="group">Grupo Muscular</Label>
                    <Select value={exerciseFormData.group} onValueChange={(v) => handleInputChange('group', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {exerciseGroups.map(g => <SelectItem key={g.group} value={g.group}>{g.group}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid gap-2">
                  <Label htmlFor="imageUrl">URL da Imagem ou GIF</Label>
                  <Input 
                    id="imageUrl" 
                    type="text" 
                    value={exerciseFormData.imageUrl} 
                    onChange={e => handleInputChange('imageUrl', e.target.value)} 
                    placeholder="Cole o link da imagem aqui" 
                  />
                  <p className="text-xs text-muted-foreground">Cole um link de uma imagem ou GIF para representar o exercício.</p>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" form="exercise-form">{isEditing ? "Salvar Alterações" : "Salvar Exercício"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o exercício <span className="font-semibold">{exerciseToDelete?.name}</span> do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className={buttonVariants({ variant: "destructive" })}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
