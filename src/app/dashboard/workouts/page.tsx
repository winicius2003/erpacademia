"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutPlans } from "./workout-plans"
import { ExerciseLibrary } from "./exercise-library"
import { ListChecks, Library } from "lucide-react"

export default function WorkoutsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-headline">Gerenciamento de Treinos</h1>
      <p className="text-muted-foreground">
        Crie modelos de treino reutilizáveis e gerencie seu banco de exercícios.
      </p>
      <Tabs defaultValue="plans" className="pt-2">
        <TabsList>
          <TabsTrigger value="plans">
            <ListChecks className="mr-2 h-4 w-4" />
            Modelos de Treino
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <Library className="mr-2 h-4 w-4" />
            Banco de Exercícios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          <WorkoutPlans />
        </TabsContent>
        <TabsContent value="exercises" className="mt-4">
          <ExerciseLibrary />
        </TabsContent>
      </Tabs>
    </div>
  )
}
