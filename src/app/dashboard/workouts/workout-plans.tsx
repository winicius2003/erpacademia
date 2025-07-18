"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, type SubmitHandler, type UseFormReturn, type Control, type ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { GripVertical, MoreVertical, PlusCircle, Trash2, XIcon, Loader2, ChevronsUpDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getWorkoutPlans, addWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan, type WorkoutPlan } from "@/services/workouts"
import { getExercises, type ExerciseListItem } from "@/services/exercises"


const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório."),
  sets: z.string().min(1, "Séries são obrigatórias."),
  reps: z.string().min(1, "Repetições são obrigatórias."),
  rest: z.string().min(1, "Descanso é obrigatório."),
  imageUrl: z.string().optional(),
});

const workoutDaySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome do dia de treino é obrigatório."),
  exercises: z.array(exerciseSchema).min(1, "Adicione pelo menos um exercício."),
});

const workoutPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome do plano é obrigatório."),
  goal: z.enum(["Hipertrofia", "Emagrecimento", "Resistência"]),
  level: z.enum(["Iniciante", "Intermediário", "Avançado"]),
  workouts: z.array(workoutDaySchema).min(1, "Adicione pelo menos um dia de treino."),
});

type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;

export function WorkoutPlans() {
  const [plans, setPlans] = React.useState<WorkoutPlan[]>([]);
  const [exerciseOptions, setExerciseOptions] = React.useState<ExerciseListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<WorkoutPlan | null>(null);
  const { toast } = useToast();

  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: "",
      goal: "Hipertrofia",
      level: "Iniciante",
      workouts: [],
    },
  });

  const { fields: workoutFields, append: appendWorkout, remove: removeWorkout } = useFieldArray({
    control: form.control,
    name: "workouts",
  });

  const fetchPlansAndExercises = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [plansData, exercisesData] = await Promise.all([getWorkoutPlans(), getExercises()]);
      setPlans(plansData);
      setExerciseOptions(exercisesData);
    } catch (error) {
      toast({ title: "Erro ao buscar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchPlansAndExercises();
  }, [fetchPlansAndExercises]);

  const handleAddNew = () => {
    setEditingPlan(null);
    form.reset({
      name: "",
      goal: "Hipertrofia",
      level: "Iniciante",
      workouts: [{ name: "Treino A", exercises: [{ name: "", sets: "", reps: "", rest: "", imageUrl: "" }] }],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    form.reset(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    await deleteWorkoutPlan(planId);
    toast({ title: "Plano Excluído", description: "O plano de treino foi removido." });
    fetchPlansAndExercises();
  };

  const onSubmit: SubmitHandler<WorkoutPlanFormValues> = async (data) => {
    try {
      if (editingPlan) {
        await updateWorkoutPlan(editingPlan.id, data);
        toast({ title: "Plano Atualizado", description: "O plano de treino foi salvo com sucesso." });
      } else {
        await addWorkoutPlan(data);
        toast({ title: "Plano Criado", description: "O novo plano de treino foi criado com sucesso." });
      }
      fetchPlansAndExercises();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o plano.", variant: "destructive" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-headline">Planos de Treino</CardTitle>
              <CardDescription>Crie, visualize e gerencie os modelos de treino da academia.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Plano de Treino
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : plans.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {plans.map((plan) => (
                <AccordionItem value={plan.id} key={plan.id} className="border rounded-md bg-card">
                  <div className="flex items-center w-full">
                    <AccordionTrigger className="flex-1 text-left px-4 py-3 hover:no-underline font-medium">
                      <span className="text-base font-semibold text-foreground">{plan.name}</span>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2 pr-4">
                      <Badge variant="outline">{plan.level}</Badge>
                      <Badge variant="secondary">{plan.goal}</Badge>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEdit(plan)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Atribuir a Aluno</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDelete(plan.id)} className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <AccordionContent className="pb-4 px-4">
                    {plan.workouts.map((day, index) => (
                      <div key={day.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <h4 className="font-semibold text-md mb-2">{day.name}</h4>
                        <div className="space-y-3 rounded-md border p-2">
                          {day.exercises.map(ex => (
                            <div key={ex.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                              <div className="relative w-24 h-16 flex-shrink-0">
                                <Image
                                  src={ex.imageUrl || `https://placehold.co/400x300.png`}
                                  alt={ex.name}
                                  fill
                                  className="rounded-md object-cover"
                                  data-ai-hint={ex.name.split(' ').slice(0, 2).join(' ').toLowerCase()}
                                />
                              </div>
                              <div className="flex-1 font-medium">{ex.name}</div>
                              <div className="flex gap-6 text-center text-sm">
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
                      </div>  
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md text-muted-foreground">
              <p>Nenhum plano de treino criado ainda.</p>
              <Button variant="link" onClick={handleAddNew}>Crie o primeiro plano</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90svh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano de Treino" : "Novo Plano de Treino"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Ajuste os detalhes deste plano de treino." : "Crie um novo modelo de treino para seus alunos."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="workout-plan-form" className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl><Input placeholder="Ex: Hipertrofia para Iniciantes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Principal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
                        <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
                        <SelectItem value="Resistência">Resistência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível do Aluno</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              <div>
                <Label className="text-lg font-semibold">Dias de Treino</Label>
                <div className="space-y-4 mt-2">
                  {workoutFields.map((field, index) => (
                    <WorkoutDayField 
                      key={field.id} 
                      control={form.control} 
                      dayIndex={index} 
                      removeDay={removeWorkout} 
                      exerciseOptions={exerciseOptions}
                      form={form}
                    />
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendWorkout({ name: `Treino ${String.fromCharCode(65 + workoutFields.length)}`, exercises: [{ name: "", sets: "3", reps: "10-12", rest: "60s", imageUrl: "" }] })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Dia de Treino
                </Button>
              </div>
            </form>
          </Form>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" form="workout-plan-form" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WorkoutDayField({ 
  control,
  dayIndex, 
  removeDay, 
  exerciseOptions,
  form
} : {
  control: Control<WorkoutPlanFormValues>,
  dayIndex: number,
  removeDay: (index: number) => void,
  exerciseOptions: ExerciseListItem[],
  form: UseFormReturn<WorkoutPlanFormValues>
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `workouts.${dayIndex}.exercises`,
  });

  return (
    <Card className="bg-muted/50">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <FormField
          control={control}
          name={`workouts.${dayIndex}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Ex: Treino A: Peito e Tríceps" {...field} className="text-md font-semibold border-0 bg-transparent shadow-none focus-visible:ring-1" />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="ghost" size="icon" onClick={() => removeDay(dayIndex)} className="h-8 w-8">
            <XIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          {/* Headers */}
          <div className="flex items-center gap-x-2 px-2 mb-2 text-sm font-medium text-muted-foreground min-w-[600px]">
            <div className="flex items-center gap-2 flex-grow-[2] min-w-[200px] flex-1">
              <GripVertical className="h-5 w-5 text-transparent" /> {/* Spacer */}
              Exercício
            </div>
            <div className="w-[80px] text-center">Séries</div>
            <div className="w-[80px] text-center">Reps</div>
            <div className="w-[80px] text-center">Descanso</div>
            <div className="w-9" /> {/* Spacer for delete button */}
          </div>

          <div className="space-y-2 min-w-[600px]">
            {fields.map((field, exIndex) => (
              <div key={field.id} className="flex items-start gap-x-2 p-2 -mx-2 rounded-md hover:bg-background/50">
                <div className="flex items-center gap-2 flex-grow-[2] min-w-[200px] flex-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <FormField
                    control={control}
                    name={`workouts.${dayIndex}.exercises.${exIndex}.name`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <ExerciseCombobox field={field} exerciseOptions={exerciseOptions} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={control} name={`workouts.${dayIndex}.exercises.${exIndex}.sets`} render={({ field }) => (
                  <FormItem className="w-[80px]"><FormControl><Input placeholder="3" {...field} className="text-center" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name={`workouts.${dayIndex}.exercises.${exIndex}.reps`} render={({ field }) => (
                  <FormItem className="w-[80px]"><FormControl><Input placeholder="10-12" {...field} className="text-center" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name={`workouts.${dayIndex}.exercises.${exIndex}.rest`} render={({ field }) => (
                  <FormItem className="w-[80px]"><FormControl><Input placeholder="60s" {...field} className="text-center" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(exIndex)} className="h-9 w-9 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: "", sets: "3", reps: "10-12", rest: "60s", imageUrl: "" })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exercício
        </Button>
      </CardContent>
    </Card>
  );
}


function ExerciseCombobox({
  field,
  exerciseOptions,
}: {
  field: ControllerRenderProps<WorkoutPlanFormValues, `workouts.${number}.exercises.${number}.name`>;
  exerciseOptions: ExerciseListItem[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value || "Selecione ou digite um exercício"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Pesquisar exercício..."
            onValueChange={field.onChange}
            value={field.value || ''}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm text-muted-foreground">
                Nenhum exercício encontrado.
                <br />
                O valor digitado será usado como um novo exercício.
              </div>
            </CommandEmpty>
            {exerciseOptions.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.exercises.map((exercise) => (
                  <CommandItem
                    value={exercise.name}
                    key={exercise.name}
                    onSelect={() => {
                      field.onChange(exercise.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        exercise.name === field.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
