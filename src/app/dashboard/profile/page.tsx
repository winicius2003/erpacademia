"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Loader2, Trash2, PlusCircle, Fingerprint, Network, Palette } from "lucide-react"
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
        setUser(employee);
        setIsLoading(false);
      });
    } else {
      router.push("/login")
    }
  }, [router]);
  
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
            <h3 className="text-base font-semibold">Integração de Hardware</h3>
            <CardDescription>
                Configure a comunicação com sua catraca e leitor biométrico. As senhas e digitais são cadastradas na ficha de cada aluno/funcionário.
            </CardDescription>
            <Card className="p-4 bg-muted/50">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="turnstile-ip" className="flex items-center gap-2"><Network className="h-4 w-4" /> IP da Catraca</Label>
                        <Input id="turnstile-ip" placeholder="192.168.1.100" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="turnstile-port">Porta</Label>
                        <Input id="turnstile-port" placeholder="8000" type="number" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="turnstile-password">Senha de Comunicação</Label>
                        <Input id="turnstile-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="turnstile-model">Modelo da Catraca</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um modelo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="controlid-idaccess">Control iD iDAccess</SelectItem>
                                <SelectItem value="topdata-inner">TopData Inner</SelectItem>
                                <SelectItem value="henry-orion">Henry Orion</SelectItem>
                                <SelectItem value="outros">Outro (config. manual)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                         <Switch id="biometrics-enabled" defaultChecked />
                         <Label htmlFor="biometrics-enabled" className="flex items-center gap-2">
                            <Fingerprint className="h-4 w-4" />
                            Leitor Biométrico Ativado
                         </Label>
                    </div>
                    <CardFooter className="p-0 pt-2">
                        <Button variant="outline">Testar Conexão</Button>
                    </CardFooter>
                </div>
            </Card>
        </div>


      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  )
}
