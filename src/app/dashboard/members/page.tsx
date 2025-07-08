
"use client"

import * as React from "react"
import { format, addMonths, parseISO, parse, differenceInYears } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Loader2, Search, Fingerprint, Upload, Copy, KeyRound, RefreshCw, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getMembers, addMember, updateMember, deleteMember, type Member } from "@/services/members"
import { useSubscription } from "@/lib/subscription-context"
import { getPlans, type Plan } from "@/services/plans"
import { Separator } from "@/components/ui/separator"


const initialMemberFormState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  dob: undefined as Date | undefined,
  cpf: "",
  rg: "",
  plan: "Mensal",
  expires: new Date() as Date | undefined,
  guardian: {
    name: "",
    cpf: "",
    phone: "",
  },
  goal: "",
  notes: "",
  medicalNotes: "",
  accessPin: "",
  password: "",
}

type MemberFormData = typeof initialMemberFormState;

export default function MembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { status: subscriptionStatus } = useSubscription()

  const [members, setMembers] = React.useState<Member[]>([])
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true)
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [memberFormData, setMemberFormData] = React.useState<MemberFormData>(initialMemberFormState)
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importPreview, setImportPreview] = React.useState<(Partial<Member> & {email: string})[]>([]);
  const [importErrors, setImportErrors] = React.useState<string[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importStep, setImportStep] = React.useState(1); // 1: Upload, 2: Confirm
  
  const [newCredentials, setNewCredentials] = React.useState<{ email: string, password?: string } | null>(null);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = React.useState(false);

  const isAddingBlocked = subscriptionStatus === 'blocked';
  const isUnderage = memberFormData.dob ? differenceInYears(new Date(), memberFormData.dob) < 18 : false;

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [membersData, plansData] = await Promise.all([getMembers(), getPlans()]);
      setMembers(membersData);
      setPlans(plansData);
    } catch (error) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar os dados de alunos e planos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  React.useEffect(() => {
    const userData = sessionStorage.getItem("fitcore.user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
       router.replace("/login")
    }
  }, [router]);

  React.useEffect(() => {
    if (!user) return;

    let displayList = members;

    if (searchQuery) {
      displayList = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (user.role === 'Professor') {
      displayList = members.filter(m => m.professor === user.name);
    }
    
    setFilteredMembers(displayList);
  }, [members, user, searchQuery]);


  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setMemberFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (category: 'address' | 'guardian', field: string, value: string) => {
    setMemberFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleAddNewClick = () => {
    setIsEditing(false);
    setMemberFormData(initialMemberFormState);
    setIsFormDialogOpen(true);
  }

  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    const expiresDate = member.expires ? parseISO(member.expires) : undefined;
    const dobDate = member.dob ? parseISO(member.dob) : undefined;
    
    setMemberFormData({
      ...initialMemberFormState,
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      cpf: member.cpf,
      rg: member.rg,
      dob: dobDate,
      plan: member.plan,
      expires: expiresDate,
      goal: member.goal || "",
      notes: member.notes || "",
      medicalNotes: member.medicalNotes || "",
      accessPin: member.accessPin || "",
      password: member.password || "",
      guardian: member.guardian || initialMemberFormState.guardian
    });
    setIsFormDialogOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberFormData.name || !memberFormData.plan || !memberFormData.expires || !memberFormData.email || !memberFormData.dob || !memberFormData.cpf) {
        toast({ title: "Dados Incompletos", description: "Nome, e-mail, CPF, data de nascimento e dados do plano são obrigatórios.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
        const payload = {
            name: memberFormData.name,
            email: memberFormData.email,
            phone: memberFormData.phone,
            cpf: memberFormData.cpf,
            rg: memberFormData.rg,
            dob: format(memberFormData.dob, "yyyy-MM-dd"),
            plan: memberFormData.plan,
            expires: format(memberFormData.expires, "yyyy-MM-dd"),
            goal: memberFormData.goal,
            notes: memberFormData.notes,
            medicalNotes: memberFormData.medicalNotes,
            accessPin: memberFormData.accessPin,
            password: memberFormData.password,
            guardian: isUnderage ? memberFormData.guardian : undefined,
        };

        if (isEditing) {
            await updateMember(memberFormData.id, payload);
            toast({ title: "Aluno Atualizado", description: "Os dados do aluno foram atualizados com sucesso." });
        } else {
            const addPayload = {
                ...payload,
                status: "Ativo" as const,
                professor: "Não atribuído",
                attendanceStatus: "Presente" as const,
                workoutStatus: "Pendente" as const,
                fingerprintRegistered: false,
            };
            const newMember = await addMember(addPayload);
            toast({ title: "Aluno Adicionado", description: "Credenciais de acesso foram geradas." });
            if (newMember.password) {
                setNewCredentials({ email: newMember.email, password: newMember.password });
                setIsCredentialsDialogOpen(true);
            }
        }
        fetchData();
        setIsFormDialogOpen(false);
    } catch (error) {
        toast({ title: "Erro", description: `Não foi possível salvar o aluno.`, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsLoading(true);
    try {
        await deleteMember(memberToDelete.id);
        toast({ title: "Aluno Excluído", description: "O aluno foi removido do sistema." });
        fetchData();
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover o aluno.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setMemberToDelete(null);
        setIsDeleteAlertOpen(false);
    }
  };

  const handleViewProfile = (member: Member) => {
    router.push(`/dashboard/members/${member.id}`);
  };

  const handleViewPayments = (member: Member) => {
    router.push(`/dashboard/financial?studentId=${member.id}&studentName=${encodeURIComponent(member.name)}`);
  };

  const handleDownloadTemplate = () => {
    const headers = "Nome,Email,Telefone,Plano,Vence (YYYY-MM-DD),Situação";
    const sampleData = "\nJoão Exemplo,joao@exemplo.com,(11) 99999-8888,Mensal,2025-08-30,Ativo";
    const csvContent = "data:text/csv;charset=utf-8," + headers + sampleData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_alunos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetImportDialog = () => {
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      setImportStep(1);
      setIsImporting(false);
  }

  const handlePreviewImport = () => {
    if (!importFile) {
        toast({ title: "Nenhum arquivo selecionado", variant: "destructive" });
        return;
    }
    setIsImporting(true);
    setImportErrors([]);
    setImportPreview([]);

    const normalizeHeader = (header: string) => header.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');

    const processData = (data: any[]) => {
      let currentErrors: string[] = [];
      const mappedData = data.map((row, index) => {
          const normalizedRow: {[key: string]: any} = {};
          for (const key in row) {
              normalizedRow[normalizeHeader(key)] = row[key];
          }

          const member: Partial<Member> & {email?: string, name?: string} = {
              name: normalizedRow['nome'],
              email: normalizedRow['email'] || normalizedRow['e-mail'],
              plan: normalizedRow['plano'] || undefined,
              cpf: normalizedRow['documento'] || normalizedRow['cnpj'] || normalizedRow['cpf'],
              rg: normalizedRow['rg'],
              phone: normalizedRow['telefone'] || normalizedRow['celular'],
          };
          
          let expiresDateValue = normalizedRow['vence'] || normalizedRow['vencimento'] || normalizedRow['datatermino'];
          let dobDateValue = normalizedRow['nascimento'];

          const situacao = normalizedRow['situacao'];
          if (situacao) {
            const lowerSituacao = situacao.toString().toLowerCase();
            if (lowerSituacao === 'ativo') member.status = 'Ativo';
            else if (lowerSituacao === 'inativo') member.status = 'Inativo';
            else if (lowerSituacao === 'atrasado') member.status = 'Atrasado';
          }
          
          if (!member.name || !member.email) {
              currentErrors.push(`Linha ${index + 2}: Nome e Email são obrigatórios.`);
              return null;
          }

          const parseDateString = (dateStr: any, fieldName: string): string | null => {
            if (!dateStr) return null;
            
            let dateToParse = dateStr;
            if (typeof dateToParse !== 'string') {
                if (dateToParse instanceof Date && !isNaN(dateToParse.getTime())) {
                    return format(dateToParse, 'yyyy-MM-dd');
                } else {
                     currentErrors.push(`Linha ${index + 2}: Valor de data inválido para o campo ${fieldName}: "${dateStr}".`);
                     return null;
                }
            }
            
            const firstDateStr = dateToParse.split('|')[0].trim();
            let parsedDate: Date | null = null;
            
            const formatsToTry = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
            for (const fmt of formatsToTry) {
                const parsed = parse(firstDateStr, fmt, new Date());
                if (!isNaN(parsed.getTime())) {
                    parsedDate = parsed;
                    break;
                }
            }
            
            if (parsedDate) {
                return format(parsedDate, 'yyyy-MM-dd');
            } else {
                currentErrors.push(`Linha ${index + 2}: Formato de data inválido para ${fieldName}: "${dateStr}". Use YYYY-MM-DD ou DD/MM/YYYY.`);
                return null;
            }
          }
          
          member.dob = parseDateString(dobDateValue, 'Nascimento') ?? undefined;
          member.expires = parseDateString(expiresDateValue, 'Vencimento') ?? undefined;

          return member;
      }).filter((m): m is Partial<Member> & {email: string; name: string} => Boolean(m));

      setImportPreview(mappedData);
      setImportErrors(currentErrors);
      setImportStep(2);
      setIsImporting(false);
    };

    if (importFile.name.endsWith('.csv')) {
        Papa.parse(importFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => processData(results.data),
            error: () => {
                toast({ title: "Erro ao ler CSV", variant: "destructive" });
                setIsImporting(false);
            }
        });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                processData(json);
            } catch (error) {
                toast({ title: "Erro ao ler arquivo Excel", variant: "destructive" });
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(importFile);
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    const existingMembersByEmail = new Map(members.map(m => [m.email.toLowerCase(), m]));

    const importPromises = importPreview.map(async (memberData) => {
        try {
            if (!memberData.email) {
                errorCount++;
                return;
            }
            
            const existingMember = existingMembersByEmail.get(memberData.email.toLowerCase());

            if (existingMember) {
                const updatePayload: Partial<Member> = {};
                
                Object.keys(memberData).forEach(key => {
                    if (memberData[key] !== undefined && memberData[key] !== existingMember[key]) {
                        updatePayload[key] = memberData[key];
                    }
                });

                if (Object.keys(updatePayload).length > 0) {
                    await updateMember(existingMember.id, updatePayload);
                    updatedCount++;
                }
            } else {
                const newMemberData = {
                    name: memberData.name!,
                    email: memberData.email!,
                    phone: memberData.phone || '',
                    cpf: memberData.cpf || '',
                    rg: memberData.rg || '',
                    dob: memberData.dob || format(new Date(1990, 0, 1), 'yyyy-MM-dd'),
                    plan: memberData.plan || 'Mensal',
                    expires: memberData.expires || format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
                    status: "Ativo" as const,
                    professor: "Não atribuído",
                    attendanceStatus: "Presente" as const,
                    workoutStatus: "Pendente" as const,
                    goal: "Importado via Planilha",
                    notes: "",
                    accessPin: "",
                    fingerprintRegistered: false,
                };
                await addMember(newMemberData as Omit<Member, 'id'>);
                createdCount++;
            }
        } catch (e) {
            console.error("Error importing row:", memberData, e);
            errorCount++;
        }
    });
      
    await Promise.all(importPromises);

    toast({
        title: "Importação Concluída",
        description: `${createdCount} alunos criados, ${updatedCount} atualizados. ${errorCount > 0 ? `${errorCount} falharam.` : ''}`,
    });

    fetchData();
    setIsImportDialogOpen(false);
    resetImportDialog();
  };


  if (!user || isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
              <div className="flex-1">
                <CardTitle className="font-headline">Alunos</CardTitle>
                <CardDescription>
                  {user.role === 'Professor' ? 'Pesquise por alunos ou gerencie os seus.' : 'Gerencie os alunos da sua academia.'}
                </CardDescription>
              </div>
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar aluno..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {user.role !== 'Professor' && (
                  <>
                  <Button variant="outline" onClick={() => { setIsImportDialogOpen(true); resetImportDialog(); }}>
                      <Upload className="mr-2 h-4 w-4" /> Importar Alunos
                  </Button>
                  <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNewClick} disabled={isAddingBlocked} title={isAddingBlocked ? "Funcionalidade bloqueada por pendência de assinatura" : ""}>
                        <PlusCircle className="mr-2 h-4 w-4" />Adicionar Aluno
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</DialogTitle>
                        <DialogDescription>
                          {isEditing ? 'Atualize os dados do aluno.' : 'Preencha a ficha completa do aluno.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form id="add-member-form" onSubmit={handleSaveMember}>
                        <Tabs defaultValue="personal-data" className="max-h-[75vh] overflow-hidden flex flex-col">
                          <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="personal-data">Dados Pessoais</TabsTrigger>
                              <TabsTrigger value="guardian">Responsável</TabsTrigger>
                              <TabsTrigger value="health">Saúde</TabsTrigger>
                              <TabsTrigger value="access">Acesso</TabsTrigger>
                              <TabsTrigger value="emergency">Emergência</TabsTrigger>
                          </TabsList>
                          <div className="flex-1 overflow-y-auto pt-4 px-1">
                          <TabsContent value="personal-data" className="py-4 mt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="grid gap-2 lg:col-span-2">
                                      <Label htmlFor="name">Nome Completo</Label>
                                      <Input id="name" value={memberFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nome do aluno" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="dob">Nascimento</Label>
                                      <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !memberFormData.dob && "text-muted-foreground")}>
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {memberFormData.dob ? format(memberFormData.dob, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                          <Calendar
                                            mode="single"
                                            selected={memberFormData.dob}
                                            onSelect={(d) => handleInputChange('dob', d)}
                                            captionLayout="dropdown-buttons"
                                            fromYear={1940}
                                            toYear={new Date().getFullYear()}
                                            disabled={(date) =>
                                              date > new Date() || date < new Date("1940-01-01")
                                            }
                                            initialFocus
                                          />
                                      </PopoverContent>
                                      </Popover>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="email">E-mail</Label>
                                      <Input id="email" type="email" value={memberFormData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="phone">WhatsApp</Label>
                                      <Input id="phone" type="tel" value={memberFormData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(99) 99999-9999" />
                                  </div>
                                   <div className="grid gap-2">
                                      <Label htmlFor="cpf">CPF</Label>
                                      <Input id="cpf" value={memberFormData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="rg">RG</Label>
                                      <Input id="rg" value={memberFormData.rg} onChange={(e) => handleInputChange('rg', e.target.value)} placeholder="00.000.000-0" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="plan">Plano</Label>
                                      <Select value={memberFormData.plan} onValueChange={(v) => handleInputChange('plan', v)}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Selecione um plano" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {plans.map(plan => <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>)}
                                      </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="expires">Expira em</Label>
                                      <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !memberFormData.expires && "text-muted-foreground")}>
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {memberFormData.expires ? format(memberFormData.expires, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                          <Calendar mode="single" selected={memberFormData.expires} onSelect={(d) => handleInputChange('expires', d)} initialFocus />
                                      </PopoverContent>
                                      </Popover>
                                  </div>
                              </div>
                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="goal">Objetivo Principal</Label>
                                    <Input id="goal" value={memberFormData.goal} onChange={(e) => handleInputChange('goal', e.target.value)} placeholder="Ex: Hipertrofia, Perder 10kg" />
                                </div>
                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="notes">Observações / Anamnese</Label>
                                    <Textarea id="notes" value={memberFormData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Lesões pré-existentes, medicamentos, etc." />
                                </div>
                          </TabsContent>
                           <TabsContent value="guardian" className="py-4 mt-0">
                                {isUnderage ? (
                                    <div className="space-y-4 p-4 border border-amber-500/50 bg-amber-500/10 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-amber-600" />
                                            <h3 className="font-semibold text-amber-700">Dados do Responsável (Aluno menor de idade)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="guardian-name">Nome do Responsável</Label>
                                                <Input id="guardian-name" value={memberFormData.guardian.name} onChange={(e) => handleNestedChange('guardian', 'name', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="guardian-cpf">CPF do Responsável</Label>
                                                <Input id="guardian-cpf" value={memberFormData.guardian.cpf} onChange={(e) => handleNestedChange('guardian', 'cpf', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="guardian-phone">Telefone do Responsável</Label>
                                                <Input id="guardian-phone" value={memberFormData.guardian.phone} onChange={(e) => handleNestedChange('guardian', 'phone', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        <p>Esta seção é habilitada apenas para alunos menores de 18 anos.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="health" className="py-4 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="medicalNotes">Atestados e Laudos Médicos</Label>
                                    <Textarea id="medicalNotes" value={memberFormData.medicalNotes} onChange={(e) => handleInputChange('medicalNotes', e.target.value)} placeholder="Descreva aqui o conteúdo de atestados, laudos ou qualquer observação médica relevante." rows={8} />
                                </div>
                            </TabsContent>
                           <TabsContent value="access" className="py-4 mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Controle de Acesso Físico</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Configure a senha PIN e a biometria para acesso via catraca.
                                        </p>
                                        <div className="grid gap-2">
                                            <Label htmlFor="access-pin">Senha de Acesso (PIN)</Label>
                                            <Input id="access-pin" type="text" value={memberFormData.accessPin} onChange={(e) => handleInputChange('accessPin', e.target.value)} placeholder="4 a 6 dígitos numéricos" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Biometria</Label>
                                            <div className="flex items-center gap-4 h-10">
                                                <Button type="button" variant="outline">
                                                    <Fingerprint className="mr-2 h-4 w-4" /> Cadastrar Digital
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground"/> Credenciais do Portal</h3>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="password">Senha do Portal</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input id="password" type="text" value={memberFormData.password} readOnly className="font-mono bg-muted" />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            const newPass = Math.random().toString(36).slice(-8);
                                                            handleInputChange('password', newPass);
                                                            toast({ title: "Nova Senha Gerada", description: "Clique em salvar para confirmar a alteração."})
                                                        }}
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Gerar Nova Senha
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">A senha será gerada automaticamente ao salvar o novo aluno e exibida aqui ao editar.</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                          <TabsContent value="emergency" className="py-4 mt-0">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                      <Label htmlFor="emergency-name">Nome do Contato</Label>
                                      <Input id="emergency-name" value={memberFormData.guardian.name} onChange={(e) => handleNestedChange('guardian', 'name', e.target.value)} placeholder="Nome completo" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="emergency-phone">Telefone do Contato</Label>
                                      <Input id="emergency-phone" value={memberFormData.guardian.phone} onChange={(e) => handleNestedChange('guardian', 'phone', e.target.value)} placeholder="(99) 99999-9999" />
                                  </div>
                              </div>
                          </TabsContent>
                          </div>
                        </Tabs>
                      </form>
                      <DialogFooter className="mt-4 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsFormDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="add-member-form" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isEditing ? 'Salvar Alterações' : 'Salvar Aluno'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </>
                )}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              {user.role !== 'Professor' && (
                <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="all">
              <MemberTable 
                data={filteredMembers} 
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewProfile={handleViewProfile}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            <TabsContent value="active">
              <MemberTable 
                data={filteredMembers.filter(m => m.status === 'Ativo')}
                userRole={user.role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewProfile={handleViewProfile}
                onViewPayments={handleViewPayments}
              />
            </TabsContent>
            {user.role !== 'Professor' && (
              <TabsContent value="overdue">
                <MemberTable 
                  data={filteredMembers.filter(m => m.status === 'Atrasado')}
                  userRole={user.role}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onViewProfile={handleViewProfile}
                  onViewPayments={handleViewPayments}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      <AlertDialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <KeyRound className="text-primary"/> Credenciais de Acesso Geradas
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Uma senha provisória foi gerada para o aluno. Compartilhe essas informações com ele. O aluno poderá alterar a senha em seu primeiro acesso ao portal.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 my-4 text-sm">
                <div className="space-y-1">
                    <Label>E-mail (Login)</Label>
                    <p className="font-mono p-2 bg-muted rounded-md">{newCredentials?.email}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Senha Provisória</Label>
                    <div className="flex items-center gap-2">
                        <p className="w-full font-mono p-2 bg-muted rounded-md">{newCredentials?.password}</p>
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(newCredentials?.password || "")}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsCredentialsDialogOpen(false)}>Entendido</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno <span className="font-semibold">{memberToDelete?.name}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Importar Alunos</DialogTitle>
                <DialogDescription>
                  {importStep === 1 
                    ? "Faça o upload de um arquivo CSV ou Excel. O sistema irá criar novos alunos ou atualizar existentes com base no e-mail."
                    : "Confirme os dados para importação. Alunos com erros não serão importados."}
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
                    <h3 className="font-bold mb-2">Erros Encontrados:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                <h3 className="font-bold">Pré-visualização ({importPreview.length} alunos):</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreview.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell><Badge variant="outline">{member.plan}</Badge></TableCell>
                        <TableCell>{member.expires ? format(parseISO(member.expires), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                        <TableCell><Badge variant={member.status === 'Ativo' ? 'secondary' : 'destructive'}>{member.status}</Badge></TableCell>
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
                      <Button onClick={handleConfirmImport} disabled={isImporting || importPreview.length === 0}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Importar {importPreview.length} Alunos
                      </Button>
                   </div>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MemberTable({ 
  data,
  userRole,
  onEdit,
  onDelete,
  onViewProfile,
  onViewPayments
}: { 
  data: Member[],
  userRole: string,
  onEdit: (member: Member) => void,
  onDelete: (member: Member) => void,
  onViewProfile: (member: Member) => void,
  onViewPayments: (member: Member) => void
}) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="hidden md:table-cell">Expira em</TableHead>
                <TableHead>
                <span className="sr-only">Ações</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.length > 0 ? data.map((member) => (
                <TableRow key={member.id}>
                <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{member.email}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                <TableCell>{member.plan}</TableCell>
                <TableCell>
                    <Badge variant={member.status === 'Ativo' ? 'secondary' : 'destructive'}>
                    {member.status}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(parseISO(member.expires), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Alternar menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => onViewProfile(member)}>Ver Ficha</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(member)}>Editar Cadastro</DropdownMenuItem>
                        {userRole !== 'Professor' && (
                          <DropdownMenuItem onSelect={() => onViewPayments(member)}>Ver Pagamentos</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => onDelete(member)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
        </Table>
    )
}
