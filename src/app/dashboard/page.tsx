"use client"

import * as React from "react"
import { Users, UserMinus, TrendingUp, BadgePercent, Loader2, UserX, ClipboardX, CalendarCheck } from "lucide-react"
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
import { initialMembers } from "./members/page"
import type { Role } from "./access-control/page"

const adminStats = [
  { title: "Alunos Ativos", value: "1,204", change: "+12.5% em relação ao último mês", Icon: Users },
  { title: "Alunos Inativos", value: "87", change: "+5.1% em relação ao último mês", Icon: UserMinus },
  { title: "Receita Mensal", value: "R$ 45.231,89", change: "+20.1% em relação ao último mês", Icon: TrendingUp },
  { title: "Taxa de Retenção", value: "92%", change: "+2% em relação ao último mês", Icon: BadgePercent },
]

export default function Dashboard() {
  const [user, setUser] = React.useState<{ name: string; role: Role } | null>(null)
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

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getProfessorStats = () => {
    const myStudents = initialMembers.filter(m => m.professor === user.name)
    const absentStudents = myStudents.filter(m => m.attendanceStatus === "Faltante").length
    const pendingWorkouts = myStudents.filter(m => m.workoutStatus === "Pendente").length

    return [
      { title: "Meus Alunos", value: myStudents.length.toString(), change: "Total de alunos sob sua responsabilidade", Icon: Users },
      { title: "Alunos Faltantes", value: absentStudents.toString(), change: "Não compareceram na última semana", Icon: UserX },
      { title: "Treinos Pendentes", value: pendingWorkouts.toString(), change: "Precisam de um novo treino", Icon: ClipboardX },
      { title: "Check-ins Hoje", value: "12", change: "Alunos que treinaram hoje", Icon: CalendarCheck },
    ]
  }

  const stats = user.role === 'Professor' ? getProfessorStats() : adminStats;

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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Novos Alunos (Mês)</CardTitle>
              <CardDescription>Registros de novos alunos nos últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyGrowthChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Check-ins (Semana)</CardTitle>
              <CardDescription>Número de check-ins nos últimos 7 dias.</CardDescription>
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
