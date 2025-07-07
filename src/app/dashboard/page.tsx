
"use client"

import * as React from "react"
import { Users, UserMinus, TrendingUp, BadgePercent, Loader2, UserX, ClipboardX, CalendarCheck, Target } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MonthlyGrowthChart } from "@/components/monthly-growth-chart"
import { DailyPresenceChart } from "@/components/daily-presence-chart"
import { ProjectedRevenueChart } from "@/components/projected-revenue-chart"
import type { Role } from "@/services/employees"
import { getMembers, type Member } from "@/services/members"


const adminStatsTemplate = [
  { key: "activeMembers", title: "Alunos Ativos", change: "+12.5% em relação ao último mês", Icon: Users },
  { key: "inactiveMembers", title: "Alunos Inativos", change: "+5.1% em relação ao último mês", Icon: UserMinus },
  { key: "monthlyRevenue", title: "Receita Mensal", value: "R$ 45.231,89", change: "+20.1% em relação ao último mês", Icon: TrendingUp },
  { key: "retentionRate", title: "Taxa de Retenção", value: "92%", change: "+2% em relação ao último mês", Icon: BadgePercent },
]

// Dummy data for the new projected revenue chart
const projectedRevenueData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Simulate realized revenue up to day 20
    const realizado = day <= 20 ? 1500 + Math.random() * 500 - (day * 20) : 0;
    const previsto = 1500 + Math.random() * 200 - (day*15); // Projected for the whole month
    return { day: day.toString(), realizado, previsto };
});


export default function Dashboard() {
  const [user, setUser] = React.useState<{ name: string; role: Role } | null>(null)
  const [members, setMembers] = React.useState<Member[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    try {
      const userData = sessionStorage.getItem("fitcore.user")
      if (!userData) {
        router.replace("/login")
      } else {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      router.replace("/login")
    }
  }, [router])
  
  React.useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true)
      try {
        const data = await getMembers()
        setMembers(data)
      } catch (error) {
        console.error("Failed to fetch members", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMembers()
  }, [])

  if (!user || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getProfessorStats = () => {
    if (!user) return []
    const myStudents = members.filter(m => m.professor === user.name)
    const absentStudents = myStudents.filter(m => m.attendanceStatus === "Faltante").length
    const pendingWorkouts = myStudents.filter(m => m.workoutStatus === "Pendente").length

    return [
      { title: "Meus Alunos", value: myStudents.length.toString(), change: "Total de alunos sob sua responsabilidade", Icon: Users },
      { title: "Alunos Faltantes", value: absentStudents.toString(), change: "Não compareceram na última semana", Icon: UserX },
      { title: "Treinos Pendentes", value: pendingWorkouts.toString(), change: "Precisam de um novo treino", Icon: ClipboardX },
      { title: "Check-ins Hoje", value: "12", change: "Alunos que treinaram hoje", Icon: CalendarCheck },
    ]
  }
  
  const getAdminStats = () => {
    const activeMembers = members.filter(m => m.status === 'Ativo').length
    const inactiveMembers = members.length - activeMembers
    
    const statsValues = {
      activeMembers: activeMembers.toString(),
      inactiveMembers: inactiveMembers.toString(),
    }
    
    return adminStatsTemplate.map(stat => ({
        ...stat,
        value: stat.key in statsValues ? statsValues[stat.key as keyof typeof statsValues] : stat.value,
    }))
  }

  const stats = user.role === 'Professor' ? getProfessorStats() : getAdminStats();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {user.role !== 'Professor' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Receita Realizada vs. Projetada (Mês)</CardTitle>
              <CardDescription>Acompanhe o desempenho financeiro diário em relação à meta.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectedRevenueChart data={projectedRevenueData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Novos Alunos (Mês)</CardTitle>
              <CardDescription>Registros de novos alunos nos últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyGrowthChart />
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Check-ins na Semana</CardTitle>
              <CardDescription>Volume de presença de alunos nos últimos 7 dias.</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyPresenceChart />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
