"use client"

import * as React from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAcademies, type Academy } from "@/services/academies"
import { addNotification } from "@/services/notifications"

export default function MessagingPage() {
    const { toast } = useToast()
    const [academies, setAcademies] = React.useState<Academy[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    
    const [target, setTarget] = React.useState("all");
    const [subject, setSubject] = React.useState("");
    const [message, setMessage] = React.useState("");
    
    React.useEffect(() => {
        async function fetchAcademies() {
            const data = await getAcademies();
            setAcademies(data);
        }
        fetchAcademies();
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await addNotification({
                academyId: target, // 'all' or a specific academy ID
                title: subject,
                description: message,
            });
            
            toast({
                title: "Mensagem Enviada!",
                description: "Sua mensagem foi enviada para os destinatários selecionados.",
            });
            // Reset form
            setTarget("all");
            setSubject("");
            setMessage("");

        } catch (error) {
            toast({
                title: "Erro ao Enviar",
                description: "Não foi possível enviar a mensagem.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
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
                        <Select value={target} onValueChange={setTarget}>
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
                        <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Manutenção Programada" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Digite sua mensagem aqui..." rows={8} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                        {isLoading ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
