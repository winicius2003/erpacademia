
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Loader2, Trash2, PlusCircle, Fingerprint, Network, Palette, CheckCircle, TestTube2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { getEmployeeByLogin, updateEmployee, type Employee } from "@/services/employees"


type Unit = {
  name: string;
  address: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = React.useState<Employee | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const [units, setUnits] = React.useState<Unit[]>([
    { name: "Unidade Principal", address: "Rua Fictícia, 123 - Bairro Imaginário, Cidade/UF, CEP 12345-678" },
    { name: "Unidade Centro", address: "Av. Central, 456 - Centro, Cidade/UF, CEP 12345-000" },
  ])

  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    setTimeout(() => {
        // Simulate a 50/50 chance of success or failure
        if (Math.random() > 0.5) {
            setConnectionStatus('success');
            toast({
                title: "Conexão Bem-Sucedida!",
                description: "A comunicação com a catraca foi estabelecida.",
            });
        } else {
            setConnectionStatus('failed');
             toast({
                title: "Falha na Conexão",
                description: "Não foi possível comunicar com a catraca. Verifique o IP e a porta.",
                variant: 'destructive'
            });
        }
    }, 2000);
  }

  const handleUnitChange = (index: number, field: keyof Unit, value: string) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  }

  const addUnit = () => {
    setUnits([...units, { name: "", address: "" }]);
  }

  const removeUnit = (index: number) => {
    if (units.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "Você deve manter pelo menos uma unidade.",
        variant: "destructive"
      });
      return;
    }
    const newUnits = units.filter((_, i) => i !== index);
    setUnits(newUnits);
  }
  
  React.useEffect(() => {
    const userData = sessionStorage.getItem("fitcore.user")
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // In a real app, you'd fetch the full user object from the server
      // For this demo, we'll use the login to get the employee details
      getEmployeeByLogin(parsedUser.login).then(employee => {
        if(employee) {
          setUser(employee);
          if (employee.theme) {
            setTheme(employee.theme);
          }
        } else {
           router.push("/login")
        }
        setIsLoading(false);
      });
    } else {
      router.push("/login")
    }
  }, [router, setTheme]);
  
  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      try {
        await updateEmployee(user.id, { theme: newTheme });
        toast({ title: "Tema atualizado!" });
      } catch {
        toast({ title: "Erro ao salvar o tema.", variant: "destructive" });
      }
    }
  };


  if (isLoading || !user) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Configurações</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e os dados da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* User Profile Section */}
        <div className="space-y-4">
            <Label className="text-base font-semibold">Seu Perfil</Label>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="person face" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Button variant="outline" size="sm" className="mt-2">Enviar Foto</Button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue={user.name} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone Pessoal</Label>
                    <Input id="phone" type="tel" defaultValue={user.phone} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Select value={user.role.toLowerCase()} disabled>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="recepção">Recepção</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <Separator />
        
        {/* Preferences Section */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Preferências</h3>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Palette/> Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                        Ative o tema escuro para uma visualização mais confortável à noite.
                    </p>
                </div>
                <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                  />
            </div>
        </div>


        <Separator />

        {/* Company Details Section */}
        <div className="space-y-4">
            <Label className="text-base font-semibold">Dados da Empresa</Label>
            <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20 rounded-md">
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="logo building" />
                    <AvatarFallback>Logo</AvatarFallback>
                </Avatar>
                 <div className="grid gap-1">
                    <h3 className="text-lg font-bold">Logo da Empresa</h3>
                    <p className="text-sm text-muted-foreground">Esta logo aparecerá nas faturas.</p>
                    <Button variant="outline" size="sm" className="mt-2">Enviar Nova Logo</Button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="company-name">Nome da Academia</Label>
                    <Input id="company-name" placeholder="Sua Academia" defaultValue="Academia Exemplo" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="company-id">CNPJ / CPF</Label>
                    <Input id="company-id" placeholder="00.000.000/0001-00" defaultValue="00.000.000/0001-00"/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="company-phone">Telefone Comercial</Label>
                    <Input id="company-phone" type="tel" placeholder="(11) 5555-5555" defaultValue="(11) 5555-5555"/>
                </div>
            </div>
        </div>

        <Separator />

        {/* Units Management Section */}
        <div className="space-y-4">
            <Label className="text-base font-semibold">Gerenciamento de Unidades</Label>
             <CardDescription>
                Adicione e gerencie os endereços de suas filiais. Estas unidades aparecerão no seletor de unidades.
                O plano de assinatura é baseado no número total de alunos somando todas as unidades.
            </CardDescription>
            <div className="space-y-4">
                {units.map((unit, index) => (
                    <Card key={index} className="p-4 bg-muted/50">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="grid gap-2">
                                    <Label htmlFor={`unit-name-${index}`}>Nome da Unidade</Label>
                                    <Input id={`unit-name-${index}`} value={unit.name} onChange={(e) => handleUnitChange(index, 'name', e.target.value)} placeholder="Ex: Unidade Centro"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`unit-address-${index}`}>Endereço</Label>
                                    <Input id={`unit-address-${index}`} value={unit.address} onChange={(e) => handleUnitChange(index, 'address', e.target.value)} placeholder="Rua, Número, Bairro, etc."/>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => removeUnit(index)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Remover Unidade
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <Button variant="outline" onClick={addUnit}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Unidade
            </Button>
        </div>

        <Separator />

        {/* Hardware Integration Section */}
        <div className="space-y-4">
            <h3 className="text-base font-semibold">Configurações da Catraca</h3>
            <CardDescription>
                Catraca Recepção Fit, Topdata (SDK EasyInner Versão 4 - Cartão e Biométrica)
            </CardDescription>
            <Card className="p-4 bg-muted/50">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium text-foreground mb-2">Comunicação</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="turnstile-port">Porta</Label>
                                <Input id="turnstile-port" type="number" defaultValue="3570" min="0" max="9999" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="turnstile-inner">Número do Inner</Label>
                                <Input id="turnstile-inner" type="number" defaultValue="1" min="1" max="9999" />
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h4 className="font-medium text-foreground mb-2">Acionamento</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="reader-type">Tipo de Leitor</Label>
                                <Select defaultValue="card-and-bio">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="card-and-bio">Cartão e Biométrica</SelectItem>
                                        <SelectItem value="card-only">Apenas Cartão</SelectItem>
                                        <SelectItem value="bio-only">Apenas Biométrica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="card-digits">Dígitos do Cartão</Label>
                                <Input id="card-digits" type="number" defaultValue="14" min="4" max="14"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="release-time">Tempo Liberação (s)</Label>
                                <Input id="release-time" type="number" defaultValue="5" min="1" max="200" />
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                         <h4 className="font-medium text-foreground mb-2">Configuração Biométrica</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="use-keyboard" />
                                <Label htmlFor="use-keyboard">Utilizar Teclado</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="bio-module" defaultChecked />
                                <Label htmlFor="bio-module">Módulo Biométrico Ativado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="separate-reader" />
                                <Label htmlFor="separate-reader">Liberar pelo Leitor de Digitais Avulso</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="access-digital" defaultChecked/>
                                <Label htmlFor="access-digital">Acesso Utilizando a Digital</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="access-card" defaultChecked />
                                <Label htmlFor="access-card">Acesso Utilizando Teclado ou Cartão</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="two-readers" />
                                <Label htmlFor="two-readers">Dois Leitores (Entrada e Saída)</Label>
                            </div>
                         </div>
                    </div>
                </div>

                <Separator className="my-6" />
                <CardFooter className="p-0 pt-2 flex items-center justify-between">
                    <Button variant="outline" onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                        {connectionStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <TestTube2 className="mr-2 h-4 w-4"/>}
                        {connectionStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                    </Button>
                    {connectionStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Conectado</span>}
                    {connectionStatus === 'failed' && <span className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Falha na conexão</span>}
                </CardFooter>
            </Card>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  )
}

    