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
import { Button } from "@/components/ui/button"
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
  const [exerciseFormData, setExerciseFormData] = React.useState<ExerciseFormData>(initialFormState)
  const { toast } = useToast()

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
    setExerciseFormData(initialFormState)
    setIsDialogOpen(true)
  }

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Exercício Salvo!",
      description: `O exercício "${exerciseFormData.name}" foi salvo (simulação).`,
    })
    setIsDialogOpen(false)
  }
  
  const handleInputChange = (field: keyof ExerciseFormData, value: string) => {
    setExerciseFormData(prev => ({...prev, [field]: value}));
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.exercises.map((exercise) => (
                        <Card key={exercise} className="group overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative aspect-video">
                              <Image
                                src={`https://placehold.co/400x300.png`}
                                alt={exercise}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={exercise.split(' ').slice(0, 2).join(' ').toLowerCase()}
                              />
                               <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
                               </div>
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold truncate">{exercise}</h4>
                            </div>
                          </CardContent>
                        </Card>
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
              <DialogTitle>Adicionar Novo Exercício</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para adicionar um novo exercício ao banco.
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
                  <Label htmlFor="imageUrl">Imagem ou GIF</Label>
                  <Input id="imageUrl" type="file" disabled />
                  <p className="text-xs text-muted-foreground">O upload de arquivos estará disponível em breve. Use um link externo por enquanto.</p>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" form="exercise-form">Salvar Exercício</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}
