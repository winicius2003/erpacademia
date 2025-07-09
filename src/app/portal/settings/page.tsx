"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Loader2, Palette } from "lucide-react"

import { getMemberById, updateMember, type Member } from "@/services/members"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

type ProfileFormData = {
  name: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function StudentSettingsPage() {
    const [user, setUser] = React.useState<Member | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [formData, setFormData] = React.useState<ProfileFormData>({ name: "", phone: "" })
    const { toast } = useToast()
    const { theme, setTheme } = useTheme()

    const fetchUserData = React.useCallback(async () => {
        setIsLoading(true);
        const sessionUser = sessionStorage.getItem("fitcore.user")
        if (sessionUser) {
            const parsedUser = JSON.parse(sessionUser)
            try {
                const memberData = await getMemberById(parsedUser.id)
                setUser(memberData)
                if (memberData) {
                    setFormData({
                        name: memberData.name,
                        phone: memberData.phone,
                    })
                    // Apply saved theme
                    if (memberData.theme) {
                      setTheme(memberData.theme);
                    }
                }
            } catch (error) {
                toast({ title: "Erro ao buscar dados do perfil", variant: "destructive" })
            }
        }
        setIsLoading(false)
    }, [toast, setTheme])

    React.useEffect(() => {
        fetchUserData()
    }, [fetchUserData])
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleThemeChange = async (checked: boolean) => {
        if (!user) return;
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await updateMember(user.id, { theme: newTheme });
            toast({ title: "Tema atualizado!" });
        } catch {
            toast({ title: "Erro ao salvar o tema.", variant: "destructive" });
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        
        try {
            const updatePayload: Partial<Member> = {
                name: formData.name,
                phone: formData.phone,
            };

            // Password change logic
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    toast({ title: "As novas senhas não coincidem.", variant: "destructive" });
                    setIsSaving(false);
                    return;
                }
                if (user.password !== formData.currentPassword) {
                    toast({ title: "A senha atual está incorreta.", variant: "destructive" });
                    setIsSaving(false);
                    return;
                }
                updatePayload.password = formData.newPassword;
            }

            await updateMember(user.id, updatePayload);
            toast({ title: "Perfil Atualizado!", description: "Suas informações foram salvas com sucesso." });
            
            // Clear password fields after successful save
            setFormData(prev => ({...prev, currentPassword: '', newPassword: '', confirmPassword: ''}));

        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    if (!user) {
        return <div className="text-center">Não foi possível carregar seus dados. Tente fazer login novamente.</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Configurações da Conta</CardTitle>
                    <CardDescription>Gerencie suas informações pessoais e de acesso ao portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Dados Pessoais</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Login)</Label>
                                <Input id="email" value={user.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Alterar Senha</h3>
                         <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Senha Atual</Label>
                                <Input id="currentPassword" type="password" value={formData.currentPassword || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input id="newPassword" type="password" value={formData.newPassword || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                <Input id="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <Separator />

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
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>
        </div>
    )
}
