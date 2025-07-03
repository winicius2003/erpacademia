"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Bot, Loader2, Sparkles } from "lucide-react"

import { getWorkoutRecommendation, type WorkoutRecommendationOutput } from "@/ai/flows/workout-recommendation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  workoutHistory: z.string().min(10, {
    message: "Por favor, forneça um breve histórico de treinos.",
  }),
  fitnessGoals: z.string().min(10, {
    message: "Por favor, descreva seus objetivos de fitness.",
  }),
  studentPreferences: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function RecommendationForm() {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendationOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workoutHistory: "",
      fitnessGoals: "",
      studentPreferences: "",
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true)
    setRecommendation(null)
    try {
      const result = await getWorkoutRecommendation(data)
      setRecommendation(result)
    } catch (error) {
      console.error("Falha ao obter recomendação de treino:", error)
      toast({
        title: "Erro",
        description: "Falha ao gerar recomendação de treino. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gerador de Treino IA</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para obter um plano de treino personalizado gerado por IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="workoutHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Histórico de Treinos</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex: 3x por semana, foco em cardio..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fitnessGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metas de Fitness</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex: Perder 10kg, ganhar massa muscular, correr 5km..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferências (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex: Prefiro pesos livres, não gosto de correr..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Plano
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card className="min-h-[300px]">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline">Seu Novo Treino</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Gerando seu plano personalizado...</p>
              </div>
            )}
            {!isLoading && !recommendation && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Seu treino recomendado aparecerá aqui.</p>
              </div>
            )}
            {recommendation && (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {recommendation.workoutRecommendation}
              </div>
            )}
          </CardContent>
        </Card>
        {recommendation?.reasoning && (
           <Card>
            <CardHeader>
                <CardTitle className="font-headline text-base">Justificativa</CardTitle>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recommendation.reasoning}</p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  )
}
