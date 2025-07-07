
"use client"

import * as React from "react"
import Link from "next/link"
import { Users, UserMinus, TrendingUp, BadgePercent, Loader2, UserX, ClipboardX, CalendarCheck, Target, CakeSlice } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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


function OperationalStat({ title, icon: Icon, members, theme, emptyText }: { title: string, icon: React.ElementType, members: Member[], theme: {bg: string, text: string}, emptyText: string }) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <>
            <div 
                className="block p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => members.length > 0 && setIsDialogOpen(true)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${theme.bg}`}>
                       <Icon className={`h-6 w-6 ${theme.text}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{members.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Lista de alunos correspondentes a este critério.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                        {members.length > 0 ? (
                            <ul className="space-y-2">
                                {members.map(member => (
                                    <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                        <Link href={`/dashboard/members/${member.id}`} legacyBehavior>
                                          <a onClick={() => setIsDialogOpen(false)}>
                                            <Button variant="ghost" size="sm">Ver Ficha</Button>
                                          </a>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">{emptyText}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}


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

  const getOperationalStats = () => {
    if (!members) return { overdue: [], absent: [], birthdays: [] };
    
    const overdueMembers = members.filter(m => m.status === 'Atrasado');
    const absentMembers = members.filter(m => m.attendanceStatus === 'Faltante');
    
    const today = new Date();
    
    const birthdayMembers = members.filter(m => {
        if (!m.dob) return false;
        const dobDate = new Date(m.dob.replace(/-/g, '/'));
        return dobDate.getMonth() === today.getMonth() && dobDate.getDate() === today.getDate();
    });
    
    return { overdue: overdueMembers, absent: absentMembers, birthdays: birthdayMembers };
  }

  const stats = user.role === 'Professor' ? getProfessorStats() : getAdminStats();
  const operationalStats = user.role !== 'Professor' ? getOperationalStats() : null;

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

      {user.role !== 'Professor' && operationalStats && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Avisos Operacionais do Dia</CardTitle>
                <CardDescription>Resumo rápido das principais ações para hoje.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <OperationalStat 
                  title="Alunos Inadimplentes"
                  icon={UserX}
                  members={operationalStats.overdue}
                  theme={{ bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' }}
                  emptyText="Nenhum aluno inadimplente hoje."
                />
                <OperationalStat 
                  title="Alunos Faltantes"
                  icon={UserMinus}
                  members={operationalStats.absent}
                  theme={{ bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300' }}
                  emptyText="Nenhum aluno faltante nos últimos dias."
                />
                <OperationalStat 
                  title="Aniversariantes do Dia"
                  icon={CakeSlice}
                  members={operationalStats.birthdays}
                  theme={{ bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-600 dark:text-sky-300' }}
                  emptyText="Nenhum aniversariante hoje."
                />
            </CardContent>
        </Card>
      )}

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
