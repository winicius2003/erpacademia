"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAccessLogsByPeriod, type AccessLog } from "@/services/access-logs"

export default function FrequencyPage() {
    const { toast } = useToast();
    const [logs, setLogs] = React.useState<AccessLog[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    React.useEffect(() => {
        async function fetchData() {
            if (!date?.from || !date?.to) return;
            setIsLoading(true);
            try {
                const data = await getAccessLogsByPeriod(date.from, date.to);
                setLogs(data);
            } catch (error) {
                toast({ title: "Erro ao buscar registros", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [date, toast]);
    
    const handleImportClick = () => {
        toast({
            title: "Importação de Presenças",
            description: "Esta funcionalidade está em desenvolvimento.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Frequência e Acessos</CardTitle>
                        <CardDescription>
                            Visualize e filtre todos os registros de entrada e saída pela catraca.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: ptBR })}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y", { locale: ptBR })
                                )
                                ) : (
                                <span>Escolha um período</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                locale={ptBR}
                            />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleImportClick}><Download className="mr-2 h-4 w-4" /> Importar Excel</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Meio Identificação</TableHead>
                                <TableHead>Coletor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Observação</TableHead>
                                <TableHead>Categoria</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.userName}</TableCell>
                                    <TableCell>{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                                    <TableCell><Badge variant="outline">{log.identificationMethod}</Badge></TableCell>
                                    <TableCell>{log.collector}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'Permitido' ? 'secondary' : 'destructive'}>{log.status}</Badge>
                                    </TableCell>
                                    <TableCell>{log.blockReason}</TableCell>
                                    <TableCell>{log.userType}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Nenhum registro encontrado para o período selecionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
