
"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Clock, Loader2, Mail, User, Phone, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addLead } from "@/services/crm"
import { Card, CardContent } from "@/components/ui/card"

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    // Set a fixed end date for the countdown, e.g., 30 days from a reference point
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const difference = +endDate - +new Date();
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
        const gymName = formData.get("gymName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        
        try {
            await addLead({
                name: `${name} (${gymName})`,
                contact: phone || email, // Prioritize phone, fallback to email
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
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-background -z-10" />

      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <Link href="#" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold font-headline">FitCore</span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center text-center pt-16 md:pt-24 pb-20">
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl font-headline bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                O Futuro da Gestão de Academias Chegou.
            </h1>
            <p className="mt-6 text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Seja um dos primeiros a ter acesso ao FitCore e garanta uma oferta de fundador exclusiva e por tempo limitado.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto mt-12"
          >
             <Card className="shadow-2xl bg-card/60 backdrop-blur-xl border-border/30">
                <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-2 mb-6">
                        <h3 className="text-2xl font-bold font-headline">A oferta de fundador termina em...</h3>
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
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-left">Seu Nome</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="name" name="name" placeholder="Nome e Sobrenome" className="pl-9" required />
                                    </div>
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="gymName" className="text-left">Nome da Academia</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="gymName" name="gymName" placeholder="Sua Academia" className="pl-9" required />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-left">Seu Melhor E-mail</Label>
                                 <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" className="pl-9" required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-left">Seu WhatsApp</Label>
                                 <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="phone" name="phone" type="tel" placeholder="(99) 99999-9999" className="pl-9" required />
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
            <div className="mt-8 text-center">
                 <p className="font-bold text-lg">Sua oferta exclusiva de fundador inclui:</p>
                 <ul className="mt-4 space-y-2 text-muted-foreground inline-flex flex-col items-start">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>14 Dias de Teste Grátis</strong> para explorar tudo.</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>3 Meses por R$ 59,99/mês</strong> (depois R$ 450/mês).</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> <strong>Acesso a todas as funcionalidades</strong>, sem limites.</li>
                </ul>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/20 bg-transparent">
        <div className="container py-6">
           <p className="text-center text-sm text-muted-foreground">StarCreation © 2025. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
