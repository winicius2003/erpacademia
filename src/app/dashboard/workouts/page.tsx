import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RecommendationForm } from "./recommendation-form"

export default function WorkoutsPage() {
  return (
    <Tabs defaultValue="ai-recommendation" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="plans">Planos de Treino</TabsTrigger>
        <TabsTrigger value="ai-recommendation">Recomendação IA</TabsTrigger>
      </TabsList>
      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Planos de Treino</CardTitle>
            <CardDescription>
              Crie, visualize e gerencie planos de treino para seus membros.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Gerenciamento de planos de treino em breve.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ai-recommendation">
        <RecommendationForm />
      </TabsContent>
    </Tabs>
  )
}
