"use client"

import * as React from "react"
import { 
    UserCheck, 
    UserX, 
    ReceiptText, 
    ClipboardCheck,
    CakeSlice,
    FileClock,
    Tags,
    Spline,
    Printer,
    UserCog
} from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getMembers } from "@/services/members"

export default function ReportsPage() {
  const { toast } = useToast()

  const handleGenerateReport = (reportName: string) => {
    toast({
      title: "Relatório Gerado",
      description: `O relatório "${reportName}" está sendo preparado para download.`,
    })
  }

  const handleGenerateDocument = (docName: string) => {
    toast({
      title: "Documento Gerado",
      description: `O documento "${docName}" foi gerado e está pronto para impressão.`,
    })
  }

  const handleGenerateFrequencyReport = async () => {
    toast({
      title: "Gerando Relatório de Frequência...",
      description: "Isso pode levar alguns instantes.",
    })
    
    const members = await getMembers();
    
    const reportData = members.map(member => ({
        "Nome do Aluno": member.name,
        "Status do Plano": member.status,
        "Status de Presença": member.attendanceStatus,
        "Último Vencimento": member.expires,
        "Professor Responsável": member.professor,
    }));

    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_frequencia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Relatórios e Documentos</h1>
        <p className="text-muted-foreground">Exporte dados e gere documentos importantes para a gestão.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Alunos</CardTitle>
            <CardDescription>Exporte listas de alunos baseadas no status atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Lista de Alunos Ativos")}>
              <UserCheck className="mr-2 h-4 w-4" />
              Exportar Alunos Ativos
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Lista de Alunos Inativos")}>
              <UserX className="mr-2 h-4 w-4" />
              Exportar Alunos Inativos
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Aniversariantes do Mês")}>
              <CakeSlice className="mr-2 h-4 w-4" />
              Exportar Aniversariantes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Financeiros</CardTitle>
            <CardDescription>Acompanhe a saúde financeira da sua academia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Receita Mensal Detalhada")}>
              <ReceiptText className="mr-2 h-4 w-4" />
              Exportar Receita Mensal
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Relatório de Inadimplência")}>
              <FileClock className="mr-2 h-4 w-4" />
              Exportar Inadimplentes
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Planos Mais Vendidos")}>
              <Tags className="mr-2 h-4 w-4" />
              Exportar Planos Vendidos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Avaliações</CardTitle>
            <CardDescription>Acompanhe a evolução física dos seus alunos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Evolução Corporal dos Alunos")}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Exportar Evolução Corporal
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Comparativo de Avaliações")}>
              <Spline className="mr-2 h-4 w-4" />
              Exportar Comparativo
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Modelos de Documentos</CardTitle>
            <CardDescription>Gere declarações e outros documentos rapidamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateDocument("Declaração de Matrícula")}>
              <Printer className="mr-2 h-4 w-4" />
              Declaração de Matrícula
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateDocument("Contrato Padrão")}>
              <Printer className="mr-2 h-4 w-4" />
              Contrato Padrão
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateDocument("Recibo Avulso")}>
              <Printer className="mr-2 h-4 w-4" />
              Recibo Avulso
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Operacionais</CardTitle>
            <CardDescription>Dados sobre a frequência e atividade dos alunos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={handleGenerateFrequencyReport}>
              <UserCog className="mr-2 h-4 w-4" />
              Exportar Frequência de Alunos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
