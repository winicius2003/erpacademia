
"use client"

import * as React from "react"
import { format, subDays, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Download, Loader2, Upload } from "lucide-react"
import type { DateRange } from "react-day-picker"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAccessLogsByPeriod, logAccess, type AccessLog } from "@/services/access-logs"
import { getMembers, type Member } from "@/services/members"
import { getEmployees, type Employee } from "@/services/employees"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


type ImportedLog = Partial<Omit<AccessLog, 'id' | 'timestamp'>> & {
  timestampStr: string;
  userIdentifier: string;
};


export default function FrequencyPage() {
    const { toast } = useToast();
    const [logs, setLogs] = React.useState<AccessLog[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [importFile, setImportFile] = React.useState<File | null>(null);
    const [importPreview, setImportPreview] = React.useState<ImportedLog[]>([]);
    const [importErrors, setImportErrors] = React.useState<string[]>([]);
    const [isImporting, setIsImporting] = React.useState(false);
    const [importStep, setImportStep] = React.useState(1);

    const [allMembers, setAllMembers] = React.useState<Member[]>([]);
    const [allEmployees, setAllEmployees] = React.useState<Employee[]>([]);


    React.useEffect(() => {
        async function fetchInitialData() {
            try {
                const [membersData, employeesData] = await Promise.all([
                    getMembers(),
                    getEmployees()
                ]);
                setAllMembers(membersData);
                setAllEmployees(employeesData);
            } catch (error) {
                toast({ title: "Erro ao buscar dados de usuários", variant: "destructive" });
            }
        }
        fetchInitialData();
    }, [toast]);

    const fetchLogs = React.useCallback(async () => {
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
    }, [date, toast]);

    React.useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    
    const resetImportDialog = () => {
        setImportFile(null);
        setImportPreview([]);
        setImportErrors([]);
        setImportStep(1);
        setIsImporting(false);
    };

    const handleDownloadTemplate = () => {
      const headers = `"Email do Usuário","Data e Hora (YYYY-MM-DD HH:mm)","Status (Permitido ou Bloqueado)","Motivo do Bloqueio (Opcional)"`;
      const sampleData = `\n"joao.silva@example.com","${format(new Date(), 'yyyy-MM-dd HH:mm')}","Permitido",""`;
      const csvContent = "data:text/csv;charset=utf-8," + headers + sampleData;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "modelo_importacao_frequencia.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };


    const handlePreviewImport = () => {
        if (!importFile) return;
        setIsImporting(true);

        const processData = (data: any[]) => {
            const usersByEmail = new Map([...allMembers, ...allEmployees].map(u => [u.email.toLowerCase(), u]));
            let errors: string[] = [];

            const parsedLogs = data.map((row, index) => {
                const normalizedRow: {[key: string]: any} = {};
                for (const key in row) {
                    const normalizedKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    normalizedRow[normalizedKey] = row[key];
                }

                const userIdentifier = normalizedRow['email do usuario'] || normalizedRow['email'];
                const timestampStr = normalizedRow['data e hora'] || normalizedRow['timestamp'];
                const status = normalizedRow['status'];

                if (!userIdentifier || !timestampStr || !status) {
                    errors.push(`Linha ${index + 2}: Faltam colunas obrigatórias (Email, Data e Hora, Status).`);
                    return null;
                }
                
                const user = usersByEmail.get(userIdentifier.toLowerCase());
                if (!user) {
                    errors.push(`Linha ${index + 2}: Usuário com e-mail "${userIdentifier}" não encontrado.`);
                }

                const parsedDate = parse(timestampStr, 'yyyy-MM-dd HH:mm', new Date());
                if (!isValid(parsedDate)) {
                     errors.push(`Linha ${index + 2}: Formato de data inválido para "${timestampStr}". Use YYYY-MM-DD HH:mm.`);
                }

                return {
                    userIdentifier,
                    timestampStr,
                    userName: user?.name,
                    userEmail: user?.email,
                    userType: user?.role === 'Admin' || user?.role === 'Gestor' || user?.role === 'Professor' || user?.role === 'Recepção' ? 'Funcionário' : 'Aluno',
                    status: status === 'Permitido' ? 'Permitido' : 'Bloqueado',
                    blockReason: normalizedRow['motivo do bloqueio'] || null,
                    identificationMethod: 'Importado',
                    collector: 'Planilha',
                    liberator: 'Sistema',
                } as ImportedLog;

            }).filter((p): p is ImportedLog => Boolean(p));

            setImportPreview(parsedLogs);
            setImportErrors(errors);
            setImportStep(2);
            setIsImporting(false);
        };
        
         if (importFile.name.endsWith('.csv')) {
            Papa.parse(importFile, { header: true, skipEmptyLines: true, complete: res => processData(res.data) });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd hh:mm' });
                processData(json);
            };
            reader.readAsArrayBuffer(importFile);
        }
    };

    const handleConfirmImport = async () => {
        setIsImporting(true);
        let successCount = 0;
        const validLogs = importPreview.filter(log => !importErrors.some(e => e.includes(`"${log.userIdentifier}"`)) && !importErrors.some(e => e.includes(`"${log.timestampStr}"`)));

        try {
            for (const logData of validLogs) {
                const { timestampStr, userIdentifier, ...rest } = logData;
                
                // We need to omit 'id' and 'timestamp' for the logAccess function
                const logPayload: Omit<AccessLog, 'id' | 'timestamp'> = {
                    userName: rest.userName!,
                    userEmail: rest.userEmail!,
                    userType: rest.userType!,
                    status: rest.status!,
                    blockReason: rest.blockReason!,
                    identificationMethod: rest.identificationMethod as any,
                    collector: rest.collector!,
                    liberator: rest.liberator!,
                };
                
                // The service function adds its own timestamp, so we don't pass it.
                await logAccess(logPayload);
                successCount++;
            }
            
            toast({
                title: "Importação Concluída",
                description: `${successCount} de ${importPreview.length} registros foram importados com sucesso.`,
            });
            fetchLogs(); // Refresh the log view
        } catch (error) {
             toast({ title: "Erro durante a importação", variant: "destructive" });
        } finally {
            setIsImporting(false);
            setIsImportDialogOpen(false);
            resetImportDialog();
        }
    }


    return (
        <>
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
                        <Button onClick={() => { setIsImportDialogOpen(true); resetImportDialog(); }}><Upload className="mr-2 h-4 w-4" /> Importar Frequência</Button>
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
        
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Importar Registros de Frequência</DialogTitle>
                    <DialogDescription>
                    {importStep === 1 
                        ? "Faça o upload de um arquivo CSV ou Excel. O sistema registrará os acessos para usuários existentes."
                        : "Confirme os dados para importação. Registros com erros não serão importados."}
                    </DialogDescription>
                </DialogHeader>

                {importStep === 1 && (
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="csv-file">Arquivo CSV ou Excel</Label>
                        <Input 
                            id="csv-file" 
                            type="file" 
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            disabled={isImporting}
                        />
                        <Button variant="link" size="sm" className="p-0 h-auto justify-start" onClick={handleDownloadTemplate}>
                            Baixar modelo de exemplo (.csv)
                        </Button>
                    </div>
                </div>
                )}
                
                {importStep === 2 && (
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {importErrors.length > 0 && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        <h3 className="font-bold mb-2">Avisos e Erros Encontrados:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                        {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                    )}
                    <h3 className="font-bold">Pré-visualização ({importPreview.length} registros):</h3>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {importPreview.map((log, index) => (
                        <TableRow key={index}>
                            <TableCell>{log.userName || <span className="text-destructive">{log.userIdentifier} (não encontrado)</span>}</TableCell>
                            <TableCell>{log.timestampStr}</TableCell>
                            <TableCell><Badge variant={log.status === 'Permitido' ? 'secondary' : 'destructive'}>{log.status}</Badge></TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsImportDialogOpen(false)}>Cancelar</Button>
                    {importStep === 1 && (
                    <Button onClick={handlePreviewImport} disabled={isImporting || !importFile}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Visualizar Importação
                    </Button>
                    )}
                    {importStep === 2 && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setImportStep(1)}>Voltar</Button>
                        <Button onClick={handleConfirmImport} disabled={isImporting || importPreview.length === 0 || importErrors.length === importPreview.length}>
                            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar e Importar {importPreview.length - importErrors.length} Registros
                        </Button>
                    </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        </>
    );
}

