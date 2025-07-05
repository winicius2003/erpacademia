import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecommendationForm } from "./recommendation-form"
import { WorkoutPlans } from "./workout-plans"

export default function WorkoutsPage() {
  return (
    <Tabs defaultValue="plans" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="plans">Planos de Treino</TabsTrigger>
        <TabsTrigger value="ai-recommendation">Recomendação IA</TabsTrigger>
      </TabsList>
      <TabsContent value="plans">
        <WorkoutPlans />
      </TabsContent>
      <TabsContent value="ai-recommendation">
        <RecommendationForm />
      </TabsContent>
    </Tabs>
  )
}
