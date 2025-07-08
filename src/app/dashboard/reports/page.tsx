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
    UserCog,
    Handshake,
    Copy,
    Loader2
} from "lucide-react"
import Papa from "papaparse"
import { format } from "date-fns"

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
import { getGympassCheckins, type GympassCheckin } from "@/services/gympass"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const { toast } = useToast()
  const [gympassCheckins, setGympassCheckins] = React.useState<GympassCheckin[]>([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = React.useState(true);

  React.useEffect(() => {
    async function fetchCheckins() {
      setIsLoadingCheckins(true);
      try {
        const checkins = await getGympassCheckins();
        setGympassCheckins(checkins);
      } catch (error) {
        toast({ title: "Erro ao buscar check-ins do Gympass", variant: "destructive" });
      } finally {
        setIsLoadingCheckins(false);
      }
    }
    fetchCheckins();
  }, [toast]);

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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "O código foi copiado para a área de transferência." });
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
        
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Handshake /> Integração Gympass
              </CardTitle>
              <CardDescription>Histórico de check-ins de alunos parceiros.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild><Button variant="secondary">Ver Detalhes da API</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>API de Check-in Gympass</DialogTitle>
                  <DialogDescription>
                    Use este endpoint para que sistemas externos registrem um check-in no FitCore.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <p><strong>Endpoint:</strong> <code className="bg-muted px-1 py-0.5 rounded-sm">POST /api/gympass/checkin</code></p>
                  <div>
                    <p className="font-medium">Exemplo de Requisição (cURL):</p>
                    <div className="bg-muted rounded-md p-3 relative mt-1">
                      <pre className="text-xs whitespace-pre-wrap">
                        {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/gympass/checkin \\\n-H "Content-Type: application/json" \\\n-d '{\n  "userId": "gympass_user_123",\n  "userName": "Joana Doe"\n}'`}
                      </pre>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => copyToClipboard(`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/gympass/checkin -H "Content-Type: application/json" -d '{"userId": "gympass_user_123", "userName": "Joana Doe"}'`)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                   <div>
                    <p className="font-medium">Resposta de Sucesso (200 OK):</p>
                    <div className="bg-muted rounded-md p-3 mt-1">
                      <pre className="text-xs whitespace-pre-wrap">{`{\n  "status": "allowed",\n  "message": "Check-in registrado com sucesso."\n}`}</pre>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoadingCheckins ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>ID do Usuário</TableHead>
                    <TableHead className="text-right">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gympassCheckins.map(checkin => (
                    <TableRow key={checkin.id}>
                      <TableCell className="font-medium">{checkin.userName}</TableCell>
                      <TableCell className="font-mono text-xs">{checkin.userId}</TableCell>
                      <TableCell className="text-right">{format(checkin.timestamp, "dd/MM/yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                   {gympassCheckins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">Nenhum check-in do Gympass registrado.</TableCell>
                      </TableRow>
                   )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
