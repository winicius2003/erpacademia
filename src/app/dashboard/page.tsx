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
import type { Role } from "./access-control/page"

// Temporarily keeping mock data here until other pages are connected to Firestore
const initialMembers = [
  { id: "A001", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321", plan: "Anual", status: "Ativo", expires: "2024-12-31", cpf: "123.456.789-10", rg: "12.345.678-9", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A002", name: "Maria Oliveira", email: "maria.o@example.com", phone: "(21) 91234-5678", plan: "Trimestral", status: "Ativo", expires: "2024-11-30", cpf: "111.222.333-44", rg: "11.222.333-4", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A003", name: "Carlos Pereira", email: "carlos.p@example.com", phone: "(31) 95555-1234", plan: "Mensal", status: "Atrasado", expires: "2024-05-15", cpf: "222.333.444-55", rg: "22.333.444-5", professor: "Ricardo Alves", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A004", name: "Ana Costa", email: "ana.costa@example.com", phone: "(41) 98888-4321", plan: "Anual", status: "Ativo", expires: "2025-01-20", cpf: "333.444.555-66", rg: "33.444.555-6", professor: "Carlos de Souza", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A005", name: "Paulo Souza", email: "paulo.souza@example.com", phone: "(51) 99999-8765", plan: "Trimestral", status: "Ativo", expires: "2024-10-10", cpf: "444.555.666-77", rg: "44.555.666-7", professor: "Ricardo Alves", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A006", name: "Beatriz Lima", email: "beatriz.l@example.com", phone: "(61) 98765-1111", plan: "Mensal", status: "Ativo", expires: "2024-08-30", cpf: "100.000.000-01", rg: "10.000.000-1", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A007", name: "Lucas Martins", email: "lucas.m@example.com", phone: "(61) 98765-2222", plan: "Anual", status: "Ativo", expires: "2025-07-20", cpf: "100.000.000-02", rg: "10.000.000-2", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A008", name: "Julia Almeida", email: "julia.a@example.com", phone: "(61) 98765-3333", plan: "Trimestral", status: "Ativo", expires: "2024-09-15", cpf: "100.000.000-03", rg: "10.000.000-3", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Pendente" },
  { id: "A009", name: "Guilherme Barros", email: "guilherme.b@example.com", phone: "(61) 98765-4444", plan: "Mensal", status: "Ativo", expires: "2024-08-25", cpf: "100.000.000-04", rg: "10.000.000-4", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A010", name: "Isabela Gomes", email: "isabela.g@example.com", phone: "(61) 98765-5555", plan: "Anual", status: "Ativo", expires: "2025-06-30", cpf: "100.000.000-05", rg: "10.000.000-5", professor: "Winicius", attendanceStatus: "Faltante", workoutStatus: "Completo" },
  { id: "A011", name: "Mateus Ferreira", email: "mateus.f@example.com", phone: "(61) 98765-6666", plan: "Trimestral", status: "Ativo", expires: "2024-11-10", cpf: "100.000.000-06", rg: "10.000.000-6", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A012", name: "Larissa Ribeiro", email: "larissa.r@example.com", phone: "(61) 98765-7777", plan: "Mensal", status: "Ativo", expires: "2024-08-28", cpf: "100.000.000-07", rg: "10.000.000-7", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Pendente" },
  { id: "A013", name: "Rafael Dias", email: "rafael.d@example.com", phone: "(61) 98765-8888", plan: "Anual", status: "Ativo", expires: "2025-05-22", cpf: "100.000.000-08", rg: "10.000.000-8", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A014", name: "Sofia Nogueira", email: "sofia.n@example.com", phone: "(61) 98765-9999", plan: "Trimestral", status: "Ativo", expires: "2024-12-01", cpf: "100.000.000-09", rg: "10.000.000-9", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A015", name: "Thiago Mendes", email: "thiago.m@example.com", phone: "(61) 98765-1010", plan: "Mensal", status: "Ativo", expires: "2024-08-19", cpf: "100.000.000-10", rg: "10.000.000-10", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A016", name: "Vitoria Rocha", email: "vitoria.r@example.com", phone: "(61) 98765-1212", plan: "Anual", status: "Ativo", expires: "2025-04-14", cpf: "100.000.000-11", rg: "10.000.000-11", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A017", name: "Bruno Pinto", email: "bruno.p@example.com", phone: "(61) 98765-1313", plan: "Trimestral", status: "Ativo", expires: "2024-10-25", cpf: "100.000.000-12", rg: "10.000.000-12", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A018", name: "Clara Santos", email: "clara.s@example.com", phone: "(61) 98765-1414", plan: "Mensal", status: "Ativo", expires: "2024-08-22", cpf: "100.000.000-13", rg: "10.000.000-13", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A019", name: "Daniel Cardoso", email: "daniel.c@example.com", phone: "(61) 98765-1515", plan: "Anual", status: "Ativo", expires: "2025-03-18", cpf: "100.000.000-14", rg: "10.000.000-14", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A020", name: "Evelyn Monteiro", email: "evelyn.m@example.com", phone: "(61) 98765-1616", plan: "Trimestral", status: "Ativo", expires: "2024-11-28", cpf: "100.000.000-15", rg: "10.000.000-15", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A021", name: "Felipe Ramos", email: "felipe.r@example.com", phone: "(61) 98765-1717", plan: "Mensal", status: "Ativo", expires: "2024-08-31", cpf: "100.000.000-16", rg: "10.000.000-16", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A022", name: "Gabriela Azevedo", email: "gabriela.a@example.com", phone: "(61) 98765-1818", plan: "Anual", status: "Ativo", expires: "2025-02-10", cpf: "100.000.000-17", rg: "10.000.000-17", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A023", name: "Heitor Cunha", email: "heitor.c@example.com", phone: "(61) 98765-1919", plan: "Trimestral", status: "Ativo", expires: "2024-10-05", cpf: "100.000.000-18", rg: "10.000.000-18", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A024", name: "Igor Teixeira", email: "igor.t@example.com", phone: "(61) 98765-2020", plan: "Mensal", status: "Ativo", expires: "2024-08-15", cpf: "100.000.000-19", rg: "10.000.000-19", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
  { id: "A025", name: "Yasmin Sousa", email: "yasmin.s@example.com", phone: "(61) 98765-2121", plan: "Anual", status: "Ativo", expires: "2025-01-25", cpf: "100.000.000-20", rg: "10.000.000-20", professor: "Winicius", attendanceStatus: "Presente", workoutStatus: "Completo" },
];


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
