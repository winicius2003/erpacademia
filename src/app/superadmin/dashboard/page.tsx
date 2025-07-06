"use client"

import * as React from "react"
import { Building, Users, DollarSign, Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAcademies, type Academy } from "@/services/academies"

export default function SuperAdminDashboard() {
  const [academies, setAcademies] = React.useState<Academy[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getAcademies();
      setAcademies(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  const activeAcademies = academies.filter(a => a.status === 'Ativa').length;
  const totalStudents = academies.reduce((acc, a) => acc + a.studentCount, 0);
  // Simulated revenue
  const totalRevenue = academies.reduce((acc, a) => {
    const planPrices = { "Iniciante": 97, "Profissional": 197, "Business": 397, "Enterprise": 697 };
    return acc + (planPrices[a.subscriptionPlan] || 0);
  }, 0);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold font-headline">Dashboard Global</h1>
        <p className="text-muted-foreground">Visão geral de toda a plataforma FitCore.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academias Ativas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAcademies}</div>
            <p className="text-xs text-muted-foreground">de {academies.length} academias totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">em toda a plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <p className="text-xs text-muted-foreground">Receita recorrente estimada</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
