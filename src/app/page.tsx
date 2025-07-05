"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Smartphone,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  AreaChart,
  Check,
  ChevronRight,
  Globe,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

const translations = {
  pt: {
    lang: "PT",
    langName: "Português",
    nav: {
      features: "Funcionalidades",
      pricing: "Preços",
      login: "Entrar",
      signup: "Cadastre-se",
    },
    hero: {
      title: "O sistema completo para gerenciar sua academia.",
      subtitle: "Do controle de alunos e treinos à gestão financeira e CRM. FitCore é o núcleo do seu negócio.",
      cta: "Começar Agora",
      ctaSecondary: "Ver Demonstração",
    },
    features: {
      title: "Tudo que você precisa em um só lugar",
      subtitle: "Simplifique sua operação com ferramentas poderosas e fáceis de usar.",
      items: [
        {
          icon: Users,
          title: "Gestão de Alunos",
          description: "Cadastro completo, histórico de planos, pagamentos e avaliações físicas.",
        },
        {
          icon: Smartphone,
          title: "App de Treino",
          description: "Crie treinos personalizados e acompanhe a evolução dos alunos com um app exclusivo.",
        },
        {
          icon: CreditCard,
          title: "Cobrança Automática",
          description: "Configure recorrência e envie cobranças automáticas por PIX, boleto e cartão.",
        },
        {
          icon: HeartHandshake,
          title: "CRM e Vendas",
          description: "Acompanhe leads, gerencie o funil de vendas e automatize a comunicação.",
        },
        {
          icon: ShieldCheck,
          title: "Controle de Acesso",
          description: "Check-in por QR code ou biometria com bloqueio automático de inadimplentes.",
        },
        {
          icon: AreaChart,
          title: "Relatórios Inteligentes",
          description: "Painéis com indicadores de retenção, faturamento, evasão e muito mais.",
        },
      ],
    },
    pricing: {
      title: "Escolha o plano ideal para você",
      subtitle: "Preços transparentes que crescem com o seu negócio. Sem surpresas.",
      plans: [
        {
          name: "Iniciante",
          price: "R$ 97",
          period: "/mês",
          students: "0–50 alunos",
          features: ["Gestão de Alunos", "App de Treino", "Cobrança Automática"],
          cta: "Escolher Plano",
        },
        {
          name: "Profissional",
          price: "R$ 197",
          period: "/mês",
          students: "51–200 alunos",
          features: [
            "Tudo do Iniciante",
            "Controle de Acesso",
            "CRM para Recepção",
          ],
          cta: "Escolher Plano",
          popular: true,
        },
        {
          name: "Business",
          price: "R$ 397",
          period: "/mês",
          students: "201–500 alunos",
          features: [
            "Tudo do Profissional",
            "Relatórios Avançados",
            "Treinamento da Equipe",
          ],
          cta: "Escolher Plano",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          students: "501+ alunos",
          features: [
            "Tudo do Business",
            "Setup Personalizado",
            "Suporte Prioritário",
          ],
          cta: "Fale Conosco",
        },
      ],
    },
    footer: {
      product: "Produto",
      company: "Empresa",
      legal: "Legal",
      rights: "Todos os direitos reservados.",
    },
  },
  en: {
    lang: "EN",
    langName: "English",
    nav: {
      features: "Features",
      pricing: "Pricing",
      login: "Log In",
      signup: "Sign Up",
    },
    hero: {
      title: "The complete system to manage your gym.",
      subtitle: "From student and workout tracking to financial management and CRM. FitCore is the core of your business.",
      cta: "Get Started Now",
      ctaSecondary: "View Demo",
    },
    features: {
      title: "Everything you need in one place",
      subtitle: "Simplify your operation with powerful and easy-to-use tools.",
      items: [
        {
          icon: Users,
          title: "Member Management",
          description: "Complete registration, history of plans, payments, and physical assessments.",
        },
        {
          icon: Smartphone,
          title: "Training App",
          description: "Create personalized workouts and track student progress with an exclusive app.",
        },
        {
          icon: CreditCard,
          title: "Automated Billing",
          description: "Set up recurring payments and send automatic invoices via PIX, bank slip, and credit card.",
        },
        {
          icon: HeartHandshake,
          title: "CRM & Sales",
          description: "Track leads, manage the sales funnel, and automate communication.",
        },
        {
          icon: ShieldCheck,
          title: "Access Control",
          description: "QR code or biometric check-in with automatic blocking for overdue payments.",
        },
        {
          icon: AreaChart,
          title: "Intelligent Reports",
          description: "Dashboards with indicators for retention, revenue, churn, and more.",
        },
      ],
    },
    pricing: {
      title: "Choose the perfect plan for you",
      subtitle: "Transparent pricing that grows with your business. No surprises.",
      plans: [
        {
          name: "Starter",
          price: "$20",
          period: "/month",
          students: "0–50 members",
          features: ["Member Management", "Training App", "Automated Billing"],
          cta: "Choose Plan",
        },
        {
          name: "Professional",
          price: "$40",
          period: "/month",
          students: "51–200 members",
          features: ["Everything in Starter", "Access Control", "Reception CRM"],
          cta: "Choose Plan",
          popular: true,
        },
        {
          name: "Business",
          price: "$80",
          period: "/month",
          students: "201–500 members",
          features: [
            "Everything in Professional",
            "Advanced Reports",
            "Team Training",
          ],
          cta: "Choose Plan",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          students: "501+ members",
          features: [
            "Everything in Business",
            "Custom Setup",
            "Priority Support",
          ],
cta: "Contact Us",
        },
      ],
    },
    footer: {
      product: "Product",
      company: "Company",
      legal: "Legal",
      rights: "All rights reserved.",
    },
  },
}

type Lang = "pt" | "en"

export default function LandingPage() {
  const [lang, setLang] = React.useState<Lang>("pt")
  const t = translations[lang]

  const toggleLang = () => {
    setLang(current => (current === "pt" ? "en" : "pt"))
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold font-headline">FitCore</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              {t.nav.features}
            </Link>
            <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              {t.nav.pricing}
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLang} aria-label="Toggle language">
              <Globe className="h-4 w-4" />
              <span className="sr-only">Toggle Language</span>
            </Button>
            <Link href="/login">
              <Button variant="ghost">{t.nav.login}</Button>
            </Link>
            <Link href="/signup">
              <Button>{t.nav.signup}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="grid place-items-center gap-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                {t.hero.title}
              </h1>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <p className="max-w-3xl text-muted-foreground md:text-xl">
                {t.hero.subtitle}
              </p>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex gap-4">
              <Link href="/signup"><Button size="lg">{t.hero.cta}</Button></Link>
              <Button size="lg" variant="outline">{t.hero.ctaSecondary}</Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-24 bg-muted/50 dark:bg-card">
          <div className="mx-auto grid max-w-5xl place-items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">{t.features.title}</h2>
            <p className="text-muted-foreground md:text-lg">{t.features.subtitle}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((feature, index) => (
              <motion.div key={feature.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}>
                <div className="flex flex-col items-start p-6 bg-background rounded-lg shadow-sm h-full">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-20 md:py-24">
          <div className="mx-auto grid max-w-5xl place-items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">{t.pricing.title}</h2>
            <p className="text-muted-foreground md:text-lg">{t.pricing.subtitle}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.pricing.plans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col ${plan.popular ? "border-primary ring-2 ring-primary" : ""}`}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider text-center py-1 rounded-t-lg">Popular</div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline">{plan.name}</CardTitle>
                  <CardDescription>{plan.students}</CardDescription>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">{plan.cta}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container grid items-center gap-8 pb-8 pt-6 md:py-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="#" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="font-bold font-headline">FitCore</span>
            </Link>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FitCore. {t.footer.rights}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 col-span-2">
            <div>
              <h4 className="font-medium">{t.footer.product}</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">{t.nav.features}</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">{t.nav.pricing}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
