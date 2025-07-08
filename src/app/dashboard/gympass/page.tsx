"use client"

import * as React from "react"
import { format } from "date-fns"
import { Loader2, Handshake, Copy, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getGympassCheckins, type GympassCheckin } from "@/services/gympass"

export default function GympassPage() {
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
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado!", description: "O código foi copiado para a área de transferência." });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Handshake /> Integração Gympass
                        </CardTitle>
                        <CardDescription>Histórico de check-ins de alunos parceiros e detalhes da integração.</CardDescription>
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
                                {gympassCheckins.length > 0 ? gympassCheckins.map(checkin => (
                                    <TableRow key={checkin.id}>
                                        <TableCell className="font-medium">{checkin.userName}</TableCell>
                                        <TableCell className="font-mono text-xs">{checkin.userId}</TableCell>
                                        <TableCell className="text-right">{format(checkin.timestamp, "dd/MM/yyyy HH:mm")}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">Nenhum check-in do Gympass registrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Como funciona o fluxo do Gympass?</AlertTitle>
                <AlertDescription>
                    Alunos de parceiros como Gympass **não precisam ser cadastrados** na tela de "Alunos". O plano e a validação são feitos pelo sistema do parceiro. 
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                        <li>O aluno gera um token de check-in diário no app do Gympass.</li>
                        <li>A recepção da sua academia valida este token no sistema do parceiro.</li>
                        <li>Após a validação, a recepção ou o sistema integrado do parceiro chama a API do FitCore para **apenas registrar a entrada**, que aparecerá na tabela acima para seu controle financeiro.</li>
                    </ol>
                </AlertDescription>
            </Alert>
        </div>
    )
}
