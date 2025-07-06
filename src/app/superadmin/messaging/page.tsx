"use client"

import * as React from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAcademies, type Academy } from "@/services/academies"

export default function MessagingPage() {
    const { toast } = useToast()
    const [academies, setAcademies] = React.useState<Academy[]>([]);
    
    React.useEffect(() => {
        async function fetchAcademies() {
            const data = await getAcademies();
            setAcademies(data);
        }
        fetchAcademies();
    }, []);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Mensagem Enviada!",
            description: "Sua mensagem foi enviada para os destinatários selecionados.",
        });
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">Enviar Mensagem Interna</CardTitle>
                <CardDescription>Envie comunicados, novidades ou alertas para as academias da plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="target">Destinatário</Label>
                        <Select defaultValue="all">
                            <SelectTrigger id="target">
                                <SelectValue placeholder="Selecione um destinatário" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Academias (Broadcast)</SelectItem>
                                {academies.map(academy => (
                                    <SelectItem key={academy.id} value={academy.id}>{academy.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input id="subject" placeholder="Ex: Manutenção Programada" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea id="message" placeholder="Digite sua mensagem aqui..." rows={8} />
                    </div>
                    <Button type="submit" className="w-full">
                        <Send className="mr-2" /> Enviar Mensagem
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
