import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecommendationForm } from "./recommendation-form"

export default function WorkoutsPage() {
  return (
    <Tabs defaultValue="ai-recommendation" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="plans">Workout Plans</TabsTrigger>
        <TabsTrigger value="ai-recommendation">AI Recommendation</TabsTrigger>
      </TabsList>
      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Workout Plans</CardTitle>
            <CardDescription>
              Create, view, and manage workout plans for your members.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Workout plan management coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ai-recommendation">
        <RecommendationForm />
      </TabsContent>
    </Tabs>
  )
}
