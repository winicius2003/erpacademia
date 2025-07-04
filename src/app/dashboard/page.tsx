import { Users, UserMinus, TrendingUp, BadgePercent } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MonthlyGrowthChart } from "@/components/monthly-growth-chart"
import { DailyPresenceChart } from "@/components/daily-presence-chart"

const stats = [
  { title: "Alunos Ativos", value: "1,204", change: "+12.5%", Icon: Users },
  { title: "Alunos Inativos", value: "87", change: "+5.1%", Icon: UserMinus },
  { title: "Receita Mensal", value: "R$ 45.231,89", change: "+20.1%", Icon: TrendingUp },
  { title: "Taxa de Retenção", value: "92%", change: "+2%", Icon: BadgePercent },
]

export default function Dashboard() {
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
              <p className="text-xs text-muted-foreground">{stat.change} em relação ao último mês</p>
            </CardContent>
          </Card>
        ))}
      </div>
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
    </div>
  )
}
