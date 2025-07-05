"use client"

import * as React from "react"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { PlusCircle, Printer, Loader2, Calendar as CalendarIcon, Ruler, Weight, User, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getMembers, type Member } from "@/services/members"
import { getAssessments, addAssessment, type Assessment } from "@/services/assessments"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const measuresSchema = z.object({
  weight: z.coerce.number().positive("Inválido"),
  height: z.coerce.number().positive("Inválido"),
  bodyFat: z.coerce.number().positive("Inválido"),
  muscleMass: z.coerce.number().positive("Inválido"),
  chest: z.coerce.number().positive("Inválido"),
  waist: z.coerce.number().positive("Inválido"),
  hips: z.coerce.number().positive("Inválido"),
  rightArm: z.coerce.number().positive("Inválido"),
  leftArm: z.coerce.number().positive("Inválido"),
  rightThigh: z.coerce.number().positive("Inválido"),
  leftThigh: z.coerce.number().positive("Inválido"),
});

const assessmentSchema = z.object({
  studentId: z.string().min(1, "Selecione um aluno"),
  date: z.date({ required_error: "A data é obrigatória." }),
  measures: measuresSchema,
  notes: z.string().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

export default function AssessmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [assessments, setAssessments] = React.useState<Assessment[]>([])
  const [members, setMembers] = React.useState<Member[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [assessmentsData, membersData] = await Promise.all([getAssessments(), getMembers()]);
      setAssessments(assessmentsData);
      setMembers(membersData);
    } catch (error) {
      toast({ title: "Erro ao buscar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNewClick = () => {
    form.reset({
      date: new Date(),
      measures: { weight: 0, height: 0, bodyFat: 0, muscleMass: 0, chest: 0, waist: 0, hips: 0, rightArm: 0, leftArm: 0, rightThigh: 0, leftThigh: 0 }
    });
    setIsDialogOpen(true);
  };

  const onSubmit: SubmitHandler<AssessmentFormValues> = async (data) => {
    const studentName = members.find(m => m.id === data.studentId)?.name || 'Desconhecido';
    const bmi = (data.measures.weight / ((data.measures.height / 100) ** 2)).toFixed(2);
    
    const assessmentData = {
      studentId: data.studentId,
      studentName: studentName,
      date: format(data.date, "yyyy-MM-dd"),
      measures: { ...data.measures, bmi: parseFloat(bmi) },
      notes: data.notes,
    };

    try {
      await addAssessment(assessmentData);
      toast({ title: "Avaliação Registrada", description: "Os dados da avaliação foram salvos com sucesso." });
      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/members/${studentId}`);
  };

  return (
    <>
      <Tabs defaultValue="history">
        <div className="flex items-center justify-between mb-4">
            <TabsList>
                <TabsTrigger value="history">Histórico de Avaliações</TabsTrigger>
                <TabsTrigger value="printable">Ficha para Impressão</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Registrar Nova Avaliação</Button>
            </div>
        </div>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Histórico de Avaliações</CardTitle>
              <CardDescription>Acompanhe a evolução corporal dos seus alunos.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Peso (kg)</TableHead>
                      <TableHead className="text-center">Gordura (%)</TableHead>
                      <TableHead className="text-center">M. Muscular (kg)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.studentName}</TableCell>
                        <TableCell>{format(new Date(item.date.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="text-center">{item.measures.weight.toFixed(1)}</TableCell>
                        <TableCell className="text-center">{item.measures.bodyFat.toFixed(1)}</TableCell>
                        <TableCell className="text-center">{item.measures.muscleMass.toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleViewProfile(item.studentId)}>
                                Ver Ficha do Aluno
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Editar Avaliação
                              </DropdownMenuItem>
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
        </TabsContent>
        <TabsContent value="printable">
          <PrintableAssessmentSheet />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registrar Nova Avaliação Física</DialogTitle>
            <DialogDescription>Preencha todos os campos com os dados coletados.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form id="assessment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="studentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aluno</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members.map(member => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Avaliação</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-md font-medium">Medidas Antropométricas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="measures.weight" render={({ field }) => ( <FormItem><FormLabel>Peso (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.height" render={({ field }) => ( <FormItem><FormLabel>Altura (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.bodyFat" render={({ field }) => ( <FormItem><FormLabel>% Gordura</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.muscleMass" render={({ field }) => ( <FormItem><FormLabel>M. Muscular (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                </div>
              </div>
              <Separator />
               <div className="space-y-4">
                <h3 className="text-md font-medium">Perímetros (cm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="measures.chest" render={({ field }) => ( <FormItem><FormLabel>Tórax</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.waist" render={({ field }) => ( <FormItem><FormLabel>Cintura</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.hips" render={({ field }) => ( <FormItem><FormLabel>Quadril</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.rightArm" render={({ field }) => ( <FormItem><FormLabel>Braço D.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.leftArm" render={({ field }) => ( <FormItem><FormLabel>Braço E.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.rightThigh" render={({ field }) => ( <FormItem><FormLabel>Coxa D.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    <FormField control={form.control} name="measures.leftThigh" render={({ field }) => ( <FormItem><FormLabel>Coxa E.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                </div>
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea placeholder="Observações adicionais sobre a avaliação..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
              )} />
            </form>
          </Form>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" form="assessment-form" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


function PrintableAssessmentSheet() {
    const Field = ({ label, lines=1 }) => (
        <div className="flex flex-col">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-6 border-b border-gray-400 mt-1"></div>
            ))}
        </div>
    );
    
    return (
        <div className="printable-invoice bg-white text-black p-8 rounded-lg shadow-none border-none">
            <Card className="shadow-none border-none">
                <CardHeader className="p-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <Ruler className="h-12 w-12 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline">Ficha de Avaliação Física</h1>
                                <p className="text-gray-600">Academia Exemplo</p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold">Avaliador(a): ___________________</p>
                        </div>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
                       <Field label="Aluno(a)" />
                       <Field label="Data da Avaliação" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Separator className="my-6 bg-gray-300" />
                    <h2 className="text-lg font-bold font-headline mb-4">Medidas Antropométricas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                        <Field label="Peso (kg)" />
                        <Field label="Altura (cm)" />
                        <Field label="IMC" />
                        <Field label="% Gordura" />
                        <Field label="Massa Muscular (kg)" />
                        <Field label="Idade Metabólica" />
                    </div>

                    <Separator className="my-6 bg-gray-300" />
                    <h2 className="text-lg font-bold font-headline mb-4">Perímetros (cm)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                        <Field label="Tórax" />
                        <Field label="Cintura" />
                        <Field label="Abdômen" />
                        <Field label="Quadril" />
                        <Field label="Braço D." />
                        <Field label="Braço E." />
                        <Field label="Coxa D." />
                        <Field label="Coxa E." />
                    </div>
                     <Separator className="my-6 bg-gray-300" />
                    <h2 className="text-lg font-bold font-headline mb-4">Observações</h2>
                    <div className="grid grid-cols-1 gap-4">
                       <Field label="" lines={4} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
