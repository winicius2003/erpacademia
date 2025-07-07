"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutPlans } from "./workout-plans"
import { RecommendationForm } from "./recommendation-form"
import { Sparkles, ListChecks } from "lucide-react"

export default function WorkoutsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-headline">Gerenciamento de Treinos</h1>
      <p className="text-muted-foreground">
        Crie modelos de treino reutilizáveis ou use a inteligência artificial para gerar planos personalizados.
      </p>
      <Tabs defaultValue="plans" className="pt-2">
        <TabsList>
          <TabsTrigger value="plans">
            <ListChecks className="mr-2 h-4 w-4" />
            Modelos de Treino
          </TabsTrigger>
          <TabsTrigger value="ai-generator">
            <Sparkles className="mr-2 h-4 w-4" />
            Gerador com IA
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          <WorkoutPlans />
        </TabsContent>
        <TabsContent value="ai-generator" className="mt-4">
          <RecommendationForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
