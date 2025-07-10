
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Wallet,
  HeartPulse,
  Fingerprint,
  Network,
  Check,
  Globe,
  Dumbbell,
  HeartHandshake,
  Calendar,
  BarChart,
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
          title: "Gestão de Alunos 360°",
          description: "Ficha completa com histórico de pagamentos, treinos, avaliações físicas, metas e observações.",
        },
        {
          icon: Wallet,
          title: "Financeiro e PDV Completo",
          description: "Controle fluxo de caixa, planos, produtos e pagamentos com integração Stripe e fechamento de caixa por funcionário.",
        },
        {
          icon: Fingerprint,
          title: "Controle de Acesso e Biometria",
          description: "Integre com catracas por PIN e biometria, com bloqueio automático de inadimplentes.",
        },
        {
          icon: Dumbbell,
          title: "Criação de Planos de Treino",
          description: "Crie modelos de treino para diferentes níveis e objetivos e atribua aos seus alunos com facilidade.",
        },
        {
          icon: HeartHandshake,
          title: "CRM e Funil de Vendas",
          description: "Capture e gerencie leads, transformando interessados em novos alunos matriculados.",
        },
        {
          icon: Network,
          title: "Gestão Multi-Unidades",
          description: "Gerencie múltiplas filiais a partir de uma única plataforma, com um plano de assinatura unificado.",
        },
        {
            icon: Calendar,
            title: "Agenda de Aulas Coletivas",
            description: "Crie e gerencie um calendário de aulas em grupo, como Fit Dance, Muay Thai e Yoga."
        },
        {
            icon: BarChart,
            title: "Relatórios e Dashboards",
            description: "Tenha uma visão clara do seu negócio com dashboards analíticos de alunos, finanças e retenção."
        }
      ],
    },
    pricing: {
      title: "Escolha o plano ideal para você",
      subtitle: "Preços transparentes que crescem com o seu negócio. O limite de alunos é a soma de todas as suas unidades. Sem surpresas.",
      plans: [
        {
          name: "Iniciante",
          price: "R$ 97",
          period: "/mês",
          students: "Até 50 alunos",
          features: ["Gestão de Alunos 360°", "Planos e Produtos", "Avaliações Físicas", "Até 3 funcionários"],
          cta: "Escolher Plano",
        },
        {
          name: "Profissional",
          price: "R$ 197",
          period: "/mês",
          students: "51–200 alunos",
          features: [
            "Tudo do Iniciante",
            "Cobrança Recorrente (Stripe)",
            "Controle de Acesso (Catraca)",
            "CRM e Funil de Vendas",
            "Até 3 funcionários",
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
            "Gestão Multi-Unidades",
            "Relatórios Avançados",
            "Até 5 funcionários",
          ],
          cta: "Escolher Plano",
        },
        {
          name: "Enterprise",
          price: "R$ 697",
          period: "/mês",
          students: "501-1000 alunos",
          features: [
            "Tudo do Business",
            "Gestão de Funcionários",
            "Suporte na Implantação",
            "Até 10 funcionários",
          ],
          cta: "Escolher Plano",
        },
        {
            name: "Enterprise+",
            price: "R$ 1399",
            period: "/mês",
            students: "Acima de 1000 alunos",
            description: "+ R$ 1,39 por aluno extra",
            features: [
              "Tudo do Enterprise",
              "Suporte Prioritário",
              "Onboarding Assistido",
              "Até 20 funcionários",
            ],
            cta: "Escolher Plano",
            isCustom: false,
        },
      ],
    },
    footer: {
      product: "Produto",
      company: "Empresa",
      contact: "Contato",
      legal: "Legal",
      rights: "Todos os direitos reservados.",
      phone: "+55 (16) 99797-2936",
      email: "contato@starcreation.com.br",
      about: "Sobre Nós",
      terms: "Termos de Serviço",
      privacy: "Política de Privacidade",
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
            title: "360° Member Management",
            description: "Complete profile with payment history, workouts, physical assessments, goals, and notes.",
        },
        {
            icon: Wallet,
            title: "Complete Financials & POS",
            description: "Control cash flow, plans, products, and payments with Stripe integration and cashier closing reports.",
        },
        {
            icon: Fingerprint,
            title: "Access Control & Biometrics",
            description: "Integrate with turnstiles via PIN and biometrics, with automatic blocking for overdue members.",
        },
        {
            icon: Dumbbell,
            title: "Workout Plan Creation",
            description: "Create workout templates for different levels and goals and easily assign them to your members.",
        },
        {
            icon: HeartHandshake,
            title: "CRM & Sales Funnel",
            description: "Capture and manage leads, turning interested prospects into new enrolled members.",
        },
        {
            icon: Network,
            title: "Multi-Branch Management",
            description: "Manage multiple branches from a single platform with a unified subscription plan.",
        },
        {
            icon: Calendar,
            title: "Group Class Schedule",
            description: "Create and manage a calendar for group classes like Fit Dance, Muay Thai, and Yoga."
        },
        {
            icon: BarChart,
            title: "Reports & Dashboards",
            description: "Get a clear view of your business with analytical dashboards for members, finances, and retention."
        }
      ],
    },
    pricing: {
      title: "Choose the perfect plan for you",
      subtitle: "Transparent pricing that grows with your business. The member limit is the total across all your units. No surprises.",
      plans: [
        {
          name: "Starter",
          price: "$20",
          period: "/month",
          students: "Up to 50 members",
          features: ["360° Member Management", "Plans & Products", "Physical Assessments", "Up to 3 staff accounts"],
          cta: "Choose Plan",
        },
        {
          name: "Professional",
          price: "$40",
          period: "/month",
          students: "51–200 members",
          features: [
            "Everything in Starter",
            "Recurring Billing (Stripe)",
            "Access Control (Turnstile)",
            "CRM & Sales Funnel",
            "Up to 3 staff accounts"
          ],
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
            "Multi-Branch Management",
            "Advanced Reports",
            "Up to 5 staff accounts"
          ],
          cta: "Choose Plan",
        },
        {
          name: "Enterprise",
          price: "$140",
          period: "/month",
          students: "501-1000 members",
          features: [
            "Everything in Business",
            "Employee Management",
            "Onboarding Support",
            "Up to 10 staff accounts"
          ],
          cta: "Choose Plan",
        },
        {
            name: "Enterprise+",
            price: "$279",
            period: "/month",
            students: "1000+ members",
            description: "+ $0.28 per extra member",
            features: [
              "Everything in Enterprise",
              "Priority Support",
              "Assisted Onboarding",
              "Up to 20 staff accounts"
            ],
            cta: "Choose Plan",
            isCustom: false,
        },
      ],
    },
    footer: {
      product: "Product",
      company: "Company",
      contact: "Contact",
      legal: "Legal",
      rights: "All rights reserved.",
      phone: "+55 (16) 99797-2936",
      email: "contact@starcreation.com.br",
      about: "About Us",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
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
              <Link href="/demo"><Button size="lg" variant="outline">{t.hero.ctaSecondary}</Button></Link>
            </motion.div>
          </div>
        </section>

        {/* Image Section */}
        <section className="container">
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
             <div className="rounded-lg border bg-background shadow-lg overflow-hidden">
                <div className="h-11 flex items-center px-4 border-b">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                </div>
                <Image
                    src="https://i.imgur.com/k91Bv4U.png"
                    alt="Dashboard do FitCore"
                    width={1200}
                    height={675}
                    className="w-full h-auto"
                    data-ai-hint="dashboard app"
                    priority
                />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-24 bg-muted/50 dark:bg-card mt-20">
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
          <div className="mx-auto mt-12 grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
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
                   {plan.description && <CardDescription className="text-primary font-medium">{plan.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                    {plan.isCustom ? (
                        <Button className="w-full" variant="outline">{plan.cta}</Button>
                    ) : (
                        <Link href={`/signup?plan=${plan.name}`} className="w-full">
                            <Button className="w-full">{plan.cta}</Button>
                        </Link>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container grid items-start gap-8 pb-8 pt-12 md:grid-cols-4">
          <div className="flex flex-col gap-2 col-span-1">
            <Link href="#" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="font-bold font-headline">FitCore</span>
            </Link>
            <p className="text-sm text-muted-foreground">© 2025 StarCreation. <br/>{t.footer.rights}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 col-span-3">
            <div>
              <h4 className="font-medium">{t.footer.product}</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">{t.nav.features}</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">{t.nav.pricing}</Link></li>
                 <li><Link href="/demo" className="hover:text-foreground">{t.hero.ctaSecondary}</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-medium">{t.footer.company}</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">{t.footer.about}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">{t.footer.contact}</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><a href={`mailto:${t.footer.email}`} className="hover:text-foreground">{t.footer.email}</a></li>
                <li><a href={`tel:${t.footer.phone.replace(/\D/g, '')}`} className="hover:text-foreground">{t.footer.phone}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">{t.footer.legal}</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/terms" className="hover:text-foreground">{t.footer.terms}</Link></li>
                 <li><Link href="#" className="hover:text-foreground">{t.footer.privacy}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
