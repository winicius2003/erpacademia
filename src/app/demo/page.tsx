
import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Dumbbell,
  Wallet,
  HeartPulse,
  Fingerprint,
  Network,
  ArrowLeft,
  Sparkles,
  BarChart,
  HeartHandshake,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"


const features = [
    {
      icon: Users,
      title: "Gestão Completa de Alunos",
      description: "Ficha detalhada, acompanhamento de progresso, pagamentos e histórico em um só lugar.",
    },
    {
      icon: Sparkles,
      title: "Criação de Treinos com IA",
      description: "Gere treinos personalizados e eficazes com base nas metas e histórico de cada aluno.",
    },
    {
      icon: Wallet,
      title: "Financeiro Integrado",
      description: "Controle fluxo de caixa, matrículas, mensalidades e venda de produtos sem complicação.",
    },
    {
      icon: HeartPulse,
      title: "Avaliações Físicas",
      description: "Registre medidas, calcule o IMC e monitore a evolução corporal de forma visual.",
    },
    {
      icon: Fingerprint,
      title: "Controle de Acesso",
      description: "Integração com catracas e biometria para automatizar a entrada e bloquear inadimplentes.",
    },
    {
      icon: HeartHandshake,
      title: "CRM e Funil de Vendas",
      description: "Capture e gerencie leads, transformando interessados em novos alunos.",
    },
     {
      icon: BarChart,
      title: "Relatórios Inteligentes",
      description: "Visualize o crescimento da sua academia com relatórios de alunos, finanças e retenção.",
    },
    {
      icon: Network,
      title: "Gestão Multi-Unidades",
      description: "Gerencie todas as suas filiais a partir de uma única plataforma centralizada.",
    },
]


export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold font-headline">FitCore</span>
          </Link>
          <Link href="/signup">
            <Button>Começar Agora</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-8 md:py-12">
        <Card className="max-w-6xl mx-auto shadow-2xl">
            <CardHeader className="text-center p-8">
                <Badge variant="secondary" className="mx-auto mb-4 w-fit">Demonstração Interativa</Badge>
                <CardTitle className="text-4xl font-extrabold tracking-tighter sm:text-5xl font-headline">
                    Explore o FitCore em Ação
                </CardTitle>
                <CardDescription className="max-w-2xl mx-auto text-lg">
                    Veja como nossa plataforma pode transformar a gestão da sua academia. Navegue pelas funcionalidades e descubra o poder da simplicidade.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
                <div className="rounded-lg border bg-background shadow-inner overflow-hidden">
                    <div className="h-11 flex items-center px-4 border-b">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                    <Image
                        src="https://placehold.co/1200x800.png"
                        alt="Dashboard do FitCore"
                        width={1200}
                        height={800}
                        className="w-full h-auto"
                        data-ai-hint="dashboard interface"
                    />
                </div>

                <Separator className="my-12" />
                
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold font-headline">Funcionalidades em Destaque</h3>
                    <p className="text-muted-foreground mt-2">Ferramentas projetadas para otimizar cada aspecto do seu negócio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                    ))}
                </div>

                <Separator className="my-12" />

                <div className="text-center bg-primary/10 p-8 rounded-lg">
                    <h3 className="text-3xl font-bold font-headline">Pronto para dar o próximo passo?</h3>
                    <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                        Inicie seu teste gratuito e veja na prática como o FitCore pode impulsionar o crescimento da sua academia.
                    </p>
                    <div className="mt-6 flex gap-4 justify-center">
                        <Link href="/signup"><Button size="lg">Criar Minha Conta</Button></Link>
                        <Link href="/"><Button size="lg" variant="outline">Voltar para a Home</Button></Link>
                    </div>
                </div>

            </CardContent>
        </Card>
      </main>
    </div>
  )
}
