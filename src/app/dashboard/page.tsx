import { ArrowUpRight, Users, UserX, CalendarCheck } from "lucide-react"

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
  { title: "Membros Ativos", value: "1,204", change: "+12.5%", Icon: Users },
  { title: "Contas Atrasadas", value: "87", change: "+5.1%", Icon: UserX },
  { title: "Acessos Hoje", value: "238", change: "-2.3%", Icon: CalendarCheck },
  { title: "Novos no Mês", value: "45", change: "+20.1%", Icon: ArrowUpRight },
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
              <p className="text-xs text-muted-foreground">{stat.change} do último mês</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Crescimento Mensal</CardTitle>
            <CardDescription>Registros de novos membros nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyGrowthChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Presença Diária</CardTitle>
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
