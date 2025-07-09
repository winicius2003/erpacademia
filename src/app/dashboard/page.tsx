
"use client"

import * as React from "react"
import { Users, TrendingUp, Loader2, UserX, ClipboardX, CalendarCheck, Target, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, parseISO, differenceInDays, isAfter, subDays } from "date-fns"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProjectedRevenueChart } from "@/components/projected-revenue-chart"
import { MemberActivityChart } from "@/components/member-activity-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/services/employees"
import { getMembers, type Member } from "@/services/members"
import { getRecentAccessLogs, type AccessLog } from "@/services/access-logs";


const adminStatsTemplate = [
  { key: "activeMembers", title: "Alunos Ativos", Icon: Users },
  { key: "newMembers", title: "Novos Alunos (30d)", Icon: UserPlus },
  { key: "riskGroup", title: "Grupo de Risco", Icon: Target },
  { key: "defaultRate", title: "Índice de Inadimplência", Icon: UserX },
  { key: "churn", title: "Desistências (30d)", Icon: ClipboardX },
  { key: "monthlyRevenue", title: "Receita Mensal", value: "R$ 45.231,89", change: "+20.1% em relação ao último mês", Icon: TrendingUp },
];

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
  const [recentLogs, setRecentLogs] = React.useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true)
  const [riskGroupMembers, setRiskGroupMembers] = React.useState<Member[]>([]);
  const [churnMembers, setChurnMembers] = React.useState<Member[]>([]);
  const [newMembersCount, setNewMembersCount] = React.useState(0);
  const [isRiskGroupDialogOpen, setIsRiskGroupDialogOpen] = React.useState(false);
  const [isChurnDialogOpen, setIsChurnDialogOpen] = React.useState(false);
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
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        const [membersData, logsData] = await Promise.all([
            getMembers(),
            getRecentAccessLogs(10)
        ]);
        setMembers(membersData);
        setRecentLogs(logsData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const riskGroup = membersData.filter(m => m.attendanceStatus === 'Faltante' && m.status === 'Ativo');
        setRiskGroupMembers(riskGroup);

        const churn = membersData.filter(m => {
            const expiresDate = parseISO(m.expires);
            const diffDays = differenceInDays(today, expiresDate);
            // Inativo (diff > 3) and within the last 30 days
            return diffDays > 3 && diffDays <= 30;
        });
        setChurnMembers(churn);

        const thirtyDaysAgo = subDays(today, 30);
        const newMembers = membersData.filter(m => isAfter(parseISO(m.createdAt), thirtyDaysAgo));
        setNewMembersCount(newMembers.length);


      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
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
    const totalMembers = members.length;
    if (totalMembers === 0) return adminStatsTemplate.map(s => ({...s, value: s.value || '0'}));

    const activeMembers = members.filter(m => m.status === 'Ativo');
    const overdueMembers = members.filter(m => m.status === 'Atrasado');
    
    const defaultRate = activeMembers.length > 0 ? (overdueMembers.length / activeMembers.length) * 100 : 0;

    const statsValues = {
      activeMembers: { value: activeMembers.length.toString(), change: `${activeMembers.length} de ${totalMembers} alunos totais` },
      newMembers: { value: newMembersCount.toString(), change: 'Novas matrículas no período' },
      defaultRate: { value: `${defaultRate.toFixed(1)}%`, change: `${overdueMembers.length} alunos com pagamentos atrasados` },
      riskGroup: { value: riskGroupMembers.length.toString(), change: 'Alunos ativos com baixa frequência' },
      churn: { value: churnMembers.length.toString(), change: 'Planos que expiraram no período' }
    };
    
    return adminStatsTemplate.map(stat => {
        const dynamicStat = statsValues[stat.key as keyof typeof statsValues];
        return {
            ...stat,
            value: dynamicStat ? dynamicStat.value : stat.value,
            change: dynamicStat ? dynamicStat.change : stat.change,
        }
    });
  }

  const stats = user.role === 'Professor' ? getProfessorStats() : getAdminStats();

  const renderStatsCard = (stat: any) => {
    const cardContent = (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <stat.Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stat.value}</div>
          <p className="text-xs text-muted-foreground">{stat.change}</p>
        </CardContent>
      </Card>
    );

    if (stat.key === "riskGroup" && riskGroupMembers.length > 0) {
      return (
        <Dialog key={stat.title} open={isRiskGroupDialogOpen} onOpenChange={setIsRiskGroupDialogOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer">{cardContent}</div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Alunos em Grupo de Risco</DialogTitle>
              <DialogDescription>
                Estes são alunos ativos que não frequentam a academia há mais de 4 dias. É recomendado entrar em contato.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Última Frequência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskGroupMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{format(parseISO(member.lastSeen), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
    
    if (stat.key === "churn" && churnMembers.length > 0) {
      return (
        <Dialog key={stat.title} open={isChurnDialogOpen} onOpenChange={setIsChurnDialogOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer">{cardContent}</div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Alunos Desistentes (Últimos 30 dias)</DialogTitle>
              <DialogDescription>
                Estes são alunos cujo plano expirou recentemente. É uma boa oportunidade para entrar em contato e oferecer uma nova condição.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Plano Expirou em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {churnMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{format(parseISO(member.expires), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return <div key={stat.title}>{cardContent}</div>;
  };


  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => renderStatsCard(stat))}
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
                <CardTitle className="font-headline">Últimos Acessos</CardTitle>
                <CardDescription>
                    Últimos 10 acessos registrados na catraca.
                </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto">
                <div className="space-y-4">
                    {recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person face" />
                                <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{log.userName}</p>
                                <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {log.userType}</p>
                            </div>
                            <Badge variant={log.status === 'Permitido' ? 'secondary' : 'destructive'} className="ml-auto">{log.status}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Atividade de Alunos (Últimos 6 meses)</CardTitle>
              <CardDescription>Novos alunos, renovações e desistências.</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberActivityChart />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

    
