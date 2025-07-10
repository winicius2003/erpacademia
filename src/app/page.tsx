
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Wallet,
  HeartPulse,
  Fingerprint,
  Dumbbell,
  Check,
  ArrowRight,
  UsersRound,
  ArrowRightLeft,
  Archive,
  ReceiptText,
  Printer,
  Network,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

const features = [
    { icon: Users, text: "Gestão Completa de Alunos" },
    { icon: Wallet, text: "Financeiro com Ponto de Venda" },
    { icon: ArrowRightLeft, text: "Controle de Fluxo de Caixa" },
    { icon: Fingerprint, text: "Controle de Acesso por Biometria" },
    { icon: Dumbbell, text: "Criação de Planos de Treino" },
    { icon: HeartPulse, text: "Avaliações Físicas Detalhadas" },
    { icon: UsersRound, text: "Gestão de Funcionários e Permissões" },
    { icon: Archive, text: "Controle de Estoque de Produtos" },
    { icon: ReceiptText, text: "Emissão de Recibos" },
    { icon: Printer, text: "Impressão de Treinos" },
    { icon: Network, text: "Configuração de Catraca" },
];

export default function LandingPage() {

  return (
    <div className="flex flex-col flex-1 bg-muted/30 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <Button>Iniciar Teste Gratuito</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container relative pt-16 md:pt-24 pb-20 md:pb-28 text-center">
            <div className="mx-auto max-w-3xl">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                        O sistema definitivo para sua academia decolar.
                    </h1>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <p className="mt-6 text-muted-foreground md:text-xl">
                        Centralize a gestão de alunos, finanças, treinos e acesso em um único lugar. Menos burocracia, mais resultados.
                    </p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
                    <Link href="/signup"><Button size="lg">Quero meus 14 dias grátis <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
                </motion.div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container pb-20 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <Card className="shadow-2xl border-primary ring-2 ring-primary/50">
                 <CardHeader className="text-center p-8 bg-primary/5">
                  <CardTitle className="text-3xl font-headline">Plano Completo FitCore</CardTitle>
                  <CardDescription>Acesso total a todas as funcionalidades, sem surpresas.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-sm uppercase text-primary font-bold">Oferta de Lançamento</p>
                        <p className="text-5xl font-extrabold">R$ 59<span className="text-2xl font-semibold text-muted-foreground">,99</span><span className="text-xl font-normal text-muted-foreground">/mês</span></p>
                        <p className="text-muted-foreground text-sm">Durante os 3 primeiros meses.</p>
                        <p className="mt-4 font-semibold">Após o período, o valor é de R$ 450,00/mês.</p>
                    </div>

                    <p className="text-center mb-6 font-semibold">Todas as funcionalidades inclusas:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {features.map((feature) => (
                          <div key={feature.text} className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
                            </div>
                            <span className="text-muted-foreground">{feature.text}</span>
                          </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                    <Link href="/signup" className="w-full">
                        <Button className="w-full" size="lg">Iniciar meu teste de 14 dias</Button>
                    </Link>
                </CardFooter>
            </Card>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container grid items-start gap-8 pb-8 pt-12 md:grid-cols-4">
          <div className="flex flex-col gap-2 col-span-1">
            <Link href="#" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="font-bold font-headline">FitCore</span>
            </Link>
            <p className="text-sm text-muted-foreground">StarCreation © 2025. <br/>Todos os direitos reservados.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 col-span-3">
            <div>
              <h4 className="font-medium">Produto</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link href="#pricing" className="hover:text-foreground">Preços</Link></li>
                 <li><Link href="/demo" className="hover:text-foreground">Demonstração</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-medium">Empresa</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">Sobre Nós</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Contato</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><a href="mailto:jwinicius.souza@gmail.com" className="hover:text-foreground">jwinicius.souza@gmail.com</a></li>
                <li><a href="tel:+5516997972936" className="hover:text-foreground">+55 (16) 99797-2936</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Legal</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/terms" className="hover:text-foreground">Termos de Serviço</Link></li>
                 <li><Link href="/privacy" className="hover:text-foreground">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
