"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { format } from "date-fns/format"
import { ptBR } from "date-fns/locale"
import { useSearchParams, useRouter } from "next/navigation"
import { BadgeCheck, Calendar, ChevronsRight, Loader2, Play, ShieldAlert, ShieldX } from "lucide-react"

import { useSubscription } from "@/lib/subscription-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { updateSubscription } from "@/services/subscription"
import { createCheckoutSession } from "@/services/stripe"
import { cn } from "@/lib/utils"


const statusInfo = {
  active: {
    label: "Ativa",
    icon: BadgeCheck,
    color: "text-green-500",
    description: "Todos os recursos estão disponíveis."
  },
  warning: {
    label: "Aviso de Vencimento",
    icon: ShieldAlert,
    color: "text-yellow-500",
    description: "Sua assinatura está prestes a vencer. Renove para evitar interrupções."
  },
  overdue: {
    label: "Vencida",
    icon: ShieldAlert,
    color: "text-orange-500",
    description: "Acesso limitado. Emissão de notas e novas vendas estão bloqueadas."
  },
  blocked: {
    label: "Bloqueada",
    icon: ShieldX,
    color: "text-red-500",
    description: "Acesso totalmente bloqueado. Regularize seu pagamento para reativar."
  },
  loading: {
    label: "Carregando...",
    icon: Loader2,
    color: "text-muted-foreground",
    description: "Verificando status da assinatura."
  }
}

const plans = [
    { name: "Iniciante", price: "R$ 97/mês", students: "Até 50 alunos", id: "Iniciante" },
    { name: "Profissional", price: "R$ 197/mês", students: "Até 200 alunos", id: "Profissional" },
    { name: "Business", price: "R$ 397/mês", students: "Até 500 alunos", id: "Business" },
    { name: "Enterprise", price: "R$ 697/mês", students: "Até 1000 alunos", id: "Enterprise" },
];

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status, expiresAt, plan, refreshSubscription } = useSubscription()
  const { toast } = useToast()
  
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const userData = sessionStorage.getItem("fitcore.user");
    if (userData) {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
    }
  }, []);

  React.useEffect(() => {
    if (searchParams.get("success")) {
      toast({
        title: "Pagamento Concluído!",
        description: "Sua assinatura foi ativada. Obrigado!",
      });
      refreshSubscription();
      router.replace('/dashboard/subscription', { scroll: false });
    }

    if (searchParams.get("canceled")) {
      toast({
        title: "Pagamento Cancelado",
        description: "Você pode tentar novamente a qualquer momento.",
        variant: "destructive",
      });
      router.replace('/dashboard/subscription', { scroll: false });
    }
  }, [searchParams, toast, refreshSubscription, router]);

  const currentStatusInfo = statusInfo[status]

  const handleSimulation = async (daysOffset: number, status: "active" | "overdue" | "blocked") => {
    setIsSimulating(true)
    try {
      const newExpiryDate = addDays(new Date(), daysOffset)
      await updateSubscription({ expiresAt: newExpiryDate, status: status })
      await refreshSubscription()
      toast({
        title: "Simulação Ativada",
        description: `O status da assinatura foi atualizado. Vencimento agora em ${format(newExpiryDate, 'dd/MM/yyyy')}.`,
      })
    } catch (error) {
      toast({
        title: "Erro na Simulação",
        description: "Não foi possível alterar o status da assinatura.",
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const handlePayment = async (planToPay: string) => {
    setIsRedirecting(true);
    try {
        const url = await createCheckoutSession(planToPay, userEmail);
        window.location.href = url;
    } catch (error) {
        console.error("Failed to create checkout session:", error);
        toast({
            title: "Erro ao iniciar pagamento",
            description: "Verifique se as chaves de API do Stripe e os IDs de preço estão configurados corretamente.",
            variant: "destructive",
        });
        setIsRedirecting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gerenciamento de Assinatura</CardTitle>
          <CardDescription>
            Visualize o status da sua assinatura e gerencie seu plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-2xl font-bold">{plan}</p>
            </div>
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Trocar de Plano</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Trocar de Plano</DialogTitle>
                        <DialogDescription>
                            Escolha o plano que melhor se adapta às suas necessidades. O limite de alunos é o total somando todas as suas unidades.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {plans.map(p => (
                            <Card key={p.id} className={cn(p.id === plan && "border-primary")}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{p.name}</CardTitle>
                                    <CardDescription>{p.students}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-bold">{p.price}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full" 
                                        onClick={() => handlePayment(p.id)} 
                                        disabled={isRedirecting || p.id === plan}
                                    >
                                        { p.id === plan ? "Plano Atual" : (isRedirecting ? 'Aguarde...' : `Assinar plano ${p.name}`) }
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <currentStatusInfo.icon className={cn("h-6 w-6", currentStatusInfo.color)} />
                <h3 className="text-lg font-semibold">Status: <span className={currentStatusInfo.color}>{currentStatusInfo.label}</span></h3>
             </div>
             <p className="text-muted-foreground">{currentStatusInfo.description}</p>
          </div>

          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Data de Vencimento</h3>
             </div>
             <p className="text-xl font-mono">{expiresAt ? format(expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'N/A'}</p>
          </div>
        </CardContent>
        <CardFooter>
            <Button size="lg" className="w-full" onClick={() => handlePayment(plan)} disabled={isRedirecting || isSimulating}>
                {isRedirecting ? <Loader2 className="mr-2 animate-spin" /> : <BadgeCheck className="mr-2" />}
                {isRedirecting ? 'Redirecionando...' : 'Renovar Assinatura Atual'}
            </Button>
        </CardFooter>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Simulação de Cenários</CardTitle>
          <CardDescription>
            Use estes botões para testar como o sistema se comporta em diferentes status de assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button 
                variant="outline" 
                className="w-full justify-start gap-4" 
                onClick={() => handleSimulation(30, 'active')}
                disabled={isSimulating}
            >
                <Play className="h-5 w-5 text-green-500" />
                <div>
                    <p className="font-semibold">Simular Assinatura Ativa</p>
                    <p className="text-xs text-muted-foreground text-left">Define o vencimento para daqui a 30 dias.</p>
                </div>
                {isSimulating && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>
             <Button 
                variant="outline" 
                className="w-full justify-start gap-4" 
                onClick={() => handleSimulation(3, 'active')}
                disabled={isSimulating}
            >
                <Play className="h-5 w-5 text-yellow-500" />
                <div>
                    <p className="font-semibold">Simular Aviso de Vencimento</p>
                    <p className="text-xs text-muted-foreground text-left">Define o vencimento para daqui a 3 dias.</p>
                </div>
                 {isSimulating && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>
             <Button 
                variant="outline" 
                className="w-full justify-start gap-4" 
                onClick={() => handleSimulation(-3, 'overdue')}
                disabled={isSimulating}
            >
                <Play className="h-5 w-5 text-orange-500" />
                <div>
                    <p className="font-semibold">Simular Assinatura Vencida</p>
                    <p className="text-xs text-muted-foreground text-left">Define o vencimento para 3 dias atrás (bloqueio parcial).</p>
                </div>
                 {isSimulating && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>
             <Button 
                variant="outline" 
                className="w-full justify-start gap-4"
                onClick={() => handleSimulation(-6, 'blocked')}
                disabled={isSimulating}
            >
                <Play className="h-5 w-5 text-red-500" />
                <div>
                    <p className="font-semibold">Simular Assinatura Bloqueada</p>
                    <p className="text-xs text-muted-foreground text-left">Define o vencimento para 6 dias atrás (bloqueio total).</p>
                </div>
                 {isSimulating && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground">
            <p>As simulações alteram os dados no banco de dados para que você possa navegar pelo sistema e ver os alertas e bloqueios em ação.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
