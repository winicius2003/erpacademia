
"use client"

import * as React from "react"
import { format, addMonths, parseISO } from "date-fns"
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Loader2, Search, Fingerprint, Upload } from "lucide-react"
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
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
  },
  emergencyContact: {
    name: "",
    phone: "",
  },
  goal: "",
  notes: "",
  accessPin: "",
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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [memberFormData, setMemberFormData] = React.useState<MemberFormData>(initialMemberFormState)
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importPreview, setImportPreview] = React.useState<Partial<Member>[]>([]);
  const [importErrors, setImportErrors] = React.useState<string[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importStep, setImportStep] = React.useState(1); // 1: Upload, 2: Confirm

  const isAddingBlocked = subscriptionStatus === 'blocked';

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

  const handleNestedChange = (category: 'address' | 'emergencyContact', field: string, value: string) => {
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
    setIsDialogOpen(true);
  }

  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    const expiresDate = member.expires ? new Date(member.expires.replace(/-/g, '/')) : undefined;
    const dobDate = member.dob ? new Date(member.dob.replace(/-/g, '/')) : undefined;
    
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
      accessPin: member.accessPin || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberFormData.name || !memberFormData.plan || !memberFormData.expires || !memberFormData.email || !memberFormData.dob) return

    const memberDataToSave = {
        name: memberFormData.name,
        email: memberFormData.email,
        phone: memberFormData.phone,
        cpf: memberFormData.cpf,
        rg: memberFormData.rg,
        dob: format(memberFormData.dob!, "yyyy-MM-dd"),
        plan: memberFormData.plan,
        expires: format(memberFormData.expires!, "yyyy-MM-dd"),
        status: "Ativo" as const,
        professor: "Não atribuído",
        attendanceStatus: "Presente" as const,
        workoutStatus: "Pendente" as const,
        goal: memberFormData.goal,
        notes: memberFormData.notes,
        accessPin: memberFormData.accessPin,
        fingerprintRegistered: false,
    };

    setIsLoading(true);
    try {
        if (isEditing) {
            await updateMember(memberFormData.id, memberDataToSave);
            toast({ title: "Aluno Atualizado", description: "Os dados do aluno foram atualizados com sucesso." });
            fetchData();
            setIsDialogOpen(false);
            setIsLoading(false);
        } else {
            const newMember = await addMember(memberDataToSave);
            const selectedPlanData = plans.find(p => p.name === newMember.plan);
            
            toast({ title: "Aluno Adicionado", description: "Redirecionando para o primeiro pagamento." });

            const query = new URLSearchParams({
                action: 'new_payment',
                studentId: newMember.id,
                studentName: newMember.name,
                planName: newMember.plan,
                planPrice: selectedPlanData ? String(selectedPlanData.price) : "0",
            });
            
            router.push(`/dashboard/financial?${query.toString()}`);
        }
    } catch (error) {
        toast({ title: "Erro", description: `Não foi possível salvar o aluno.`, variant: "destructive" });
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

    const normalizeHeader = (header: string) => header.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const processData = (data: any[]) => {
      let currentErrors: string[] = [];
      const mappedData = data.map((row, index) => {
          const normalizedRow: {[key: string]: any} = {};
          for (const key in row) {
              normalizedRow[normalizeHeader(key)] = row[key];
          }

          const member: Partial<Member> = {
              name: normalizedRow['nome'],
              email: normalizedRow['email'],
              plan: normalizedRow['plano'] || 'Mensal',
              status: normalizedRow['situacao'] === 'Ativo' ? 'Ativo' : 'Inativo',
              expires: normalizedRow['vence'] || normalizedRow['vencimento'],
              phone: normalizedRow['telefone'] || normalizedRow['celular'] || ''
          };

          if (!member.name || !member.email) {
              currentErrors.push(`Linha ${index + 2}: Nome e Email são obrigatórios.`);
              return null;
          }

          if (member.expires && typeof member.expires !== 'string') {
              member.expires = format(new Date(member.expires), 'yyyy-MM-dd');
          } else if (member.expires) {
            try {
                //Handles YYYY-MM-DD, YYYY/MM/DD
                member.expires = format(parseISO(member.expires.replace(/\//g, '-')), 'yyyy-MM-dd');
            } catch {
                currentErrors.push(`Linha ${index + 2}: Formato de data inválido para "${member.expires}". Use YYYY-MM-DD.`);
                return null;
            }
          } else {
              member.expires = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
          }

          return member;
      }).filter(Boolean) as Partial<Member>[];

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
      let successCount = 0;
      let errorCount = 0;

      const importPromises = importPreview.map(async (member) => {
          try {
              const memberData = {
                  ...member,
                  cpf: "",
                  rg: "",
                  dob: new Date().toISOString().split('T')[0],
                  professor: "Não atribuído",
                  attendanceStatus: "Presente" as const,
                  workoutStatus: "Pendente" as const,
                  goal: "Importado via Planilha",
                  notes: "",
                  accessPin: "",
                  fingerprintRegistered: false,
              };
              await addMember(memberData as Omit<Member, 'id'>);
              successCount++;
          } catch (e) {
              errorCount++;
          }
      });
      
      await Promise.all(importPromises);

      toast({
          title: "Importação Concluída",
          description: `${successCount} alunos importados com sucesso. ${errorCount > 0 ? `${errorCount} falharam.` : ''}`,
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
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNewClick} disabled={isAddingBlocked} title={isAddingBlocked ? "Funcionalidade bloqueada por pendência de assinatura" : ""}>
                        <PlusCircle className="mr-2 h-4 w-4" />Adicionar Aluno
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</DialogTitle>
                        <DialogDescription>
                          {isEditing ? 'Atualize os dados do aluno.' : 'Preencha a ficha completa do aluno.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form id="add-member-form" onSubmit={handleSaveMember}>
                        <Tabs defaultValue="personal-data">
                          <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="personal-data">Dados Pessoais</TabsTrigger>
                              <TabsTrigger value="access">Acesso</TabsTrigger>
                              <TabsTrigger value="address">Endereço</TabsTrigger>
                              <TabsTrigger value="emergency">Emergência</TabsTrigger>
                          </TabsList>
                          <TabsContent value="personal-data" className="py-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                      <Label htmlFor="name">Nome Completo</Label>
                                      <Input id="name" value={memberFormData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nome do aluno" />
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
                           <TabsContent value="access" className="py-4">
                                <div className="space-y-2 mb-4">
                                    <h3 className="font-medium">Controle de Acesso Físico</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure a senha PIN e a biometria para acesso via catraca.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                            </TabsContent>
                          <TabsContent value="address" className="py-4">
                              <div className="grid grid-cols-4 gap-4">
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="zip">CEP</Label>
                                      <Input id="zip" value={memberFormData.address.zip} onChange={(e) => handleNestedChange('address', 'zip', e.target.value)} placeholder="00000-000" />
                                  </div>
                                  <div className="grid gap-2 col-span-3">
                                      <Label htmlFor="street">Rua</Label>
                                      <Input id="street" value={memberFormData.address.street} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} placeholder="Nome da rua" />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="number">Número</Label>
                                      <Input id="number" value={memberFormData.address.number} onChange={(e) => handleNestedChange('address', 'number', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-3">
                                      <Label htmlFor="complement">Complemento</Label>
                                      <Input id="complement" value={memberFormData.address.complement} onChange={(e) => handleNestedChange('address', 'complement', e.target.value)} placeholder="Apto, bloco, etc." />
                                  </div>
                                  <div className="grid gap-2 col-span-2">
                                      <Label htmlFor="neighborhood">Bairro</Label>
                                      <Input id="neighborhood" value={memberFormData.address.neighborhood} onChange={(e) => handleNestedChange('address', 'neighborhood', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="city">Cidade</Label>
                                      <Input id="city" value={memberFormData.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2 col-span-1">
                                      <Label htmlFor="state">Estado</Label>
                                      <Input id="state" value={memberFormData.address.state} onChange={(e) => handleNestedChange('address', 'state', e.target.value)} />
                                  </div>
                              </div>
                          </TabsContent>
                          <TabsContent value="emergency" className="py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                      <Label htmlFor="emergency-name">Nome do Contato</Label>
                                      <Input id="emergency-name" value={memberFormData.emergencyContact.name} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} placeholder="Nome completo" />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="emergency-phone">Telefone do Contato</Label>
                                      <Input id="emergency-phone" value={memberFormData.emergencyContact.phone} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} placeholder="(99) 99999-9999" />
                                  </div>
                              </div>
                          </TabsContent>
                        </Tabs>
                      </form>
                      <DialogFooter>
                        <Button type="submit" form="add-member-form" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isEditing ? 'Salvar Alterações' : 'Salvar e Ir para Pagamento'}
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
                    ? "Faça o upload de um arquivo CSV ou Excel para cadastrar múltiplos alunos. O sistema importará as colunas: Nome, Email, Plano, Vence e Situação."
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
                        <TableCell>{member.expires}</TableCell>
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
                <TableCell className="hidden md:table-cell">{format(new Date(member.expires.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
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
