
"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Clock, Loader2, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addLead } from "@/services/crm"
import { Card, CardContent } from "@/components/ui/card"

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2024-09-15") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: any[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter">
          {String(timeLeft[interval]).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase text-muted-foreground">{interval}</span>
      </div>
    );
  });

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {timerComponents.length ? timerComponents : <span className="text-2xl font-bold">A oferta terminou!</span>}
    </div>
  );
};


export default function PreLaunchPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        
        try {
            await addLead({
                name,
                contact: email,
                source: "Pré-lançamento",
                status: "Novo Lead"
            });

            toast({
                title: "Inscrição Confirmada!",
                description: "Você garantiu sua oferta. Entraremos em contato no lançamento!",
            });
            setIsSubmitted(true);
        } catch (error) {
             toast({
                title: "Erro na Inscrição",
                description: "Não foi possível registrar seu interesse. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold font-headline">FitCore</span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" disabled>Entrar</Button>
            <Button disabled>Criar Conta</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container grid lg:grid-cols-2 gap-12 items-center pt-16 md:pt-24 pb-20">
          <div className="max-w-xl">
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl font-headline">
                    O Futuro da Gestão de Academias Chegou.
                </h1>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <p className="mt-6 text-muted-foreground md:text-xl">
                    O FitCore está chegando para revolucionar a forma como você gerencia seu negócio. Seja um dos primeiros a ter acesso e garanta uma oferta exclusiva de lançamento.
                </p>
                 <ul className="mt-6 space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>14 Dias de Teste Grátis</strong> para explorar tudo.</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>3 Meses por R$ 59,99/mês</strong> (depois R$ 450/mês).</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>Acesso a todas as funcionalidades</strong>, sem limites.</li>
                </ul>
            </motion.div>
          </div>
          <div>
            <Card className="shadow-2xl">
                <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-2 mb-6">
                        <h3 className="text-2xl font-bold font-headline">A oferta termina em...</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-primary">
                            <Clock className="h-4 w-4" />
                            <span>Garanta seu desconto de fundador!</span>
                        </div>
                        <div className="pt-2">
                            <CountdownTimer />
                        </div>
                    </div>
                    {isSubmitted ? (
                        <div className="text-center py-10 px-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                            <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold font-headline">Inscrição Recebida!</h3>
                            <p className="text-muted-foreground mt-2">
                                Ótima decisão! Você está na lista VIP e será um dos primeiros a ser notificado no dia do lançamento.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="name" name="name" placeholder="Nome e Sobrenome" className="pl-9" required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Seu Melhor E-mail</Label>
                                 <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" className="pl-9" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Quero Minha Oferta Exclusiva
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container py-6">
           <p className="text-center text-sm text-muted-foreground">StarCreation © 2025. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
