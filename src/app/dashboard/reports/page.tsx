"use client"

import * as React from "react"
import { FileDown, UserCheck, UserX, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

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

  return (
    <div className="grid gap-6">
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
              <FileDown className="mr-2 h-4 w-4" />
              Aniversariantes do Mês
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
              Receita Mensal Detalhada
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Relatório de Inadimplência")}>
              <FileDown className="mr-2 h-4 w-4" />
              Relatório de Inadimplência
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateReport("Planos Mais Vendidos")}>
              <FileDown className="mr-2 h-4 w-4" />
              Planos Mais Vendidos
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
              <FileDown className="mr-2 h-4 w-4" />
              Gerar Declaração de Matrícula
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateDocument("Contrato de Prestação de Serviços")}>
              <FileDown className="mr-2 h-4 w-4" />
              Gerar Contrato Padrão
            </Button>
             <Button className="w-full justify-start" variant="outline" onClick={() => handleGenerateDocument("Recibo de Pagamento")}>
              <FileDown className="mr-2 h-4 w-4" />
              Emitir Recibo Avulso
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
