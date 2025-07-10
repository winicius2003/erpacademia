
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Target, Gem, Lightbulb, Users, HeartHandshake } from "lucide-react";

export default function AboutPage() {

    const ValueCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
        <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center">
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-3">
                    <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{children}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-sm">
                <div className="container flex h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 text-foreground font-bold font-headline">
                        <Logo className="h-8 w-8 text-primary" />
                        <span>FitCore</span>
                    </Link>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-32 text-center bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="container">
                        <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter">
                            Movidos por Tecnologia e Bem-Estar
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Nascemos para revolucionar a gestão de negócios no universo fitness, combinando paixão e inovação para criar o futuro das academias.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="container py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold font-headline">Nossa História</h2>
                        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                            A StarCreation foi fundada por entusiastas do fitness que vivenciaram na prática as dores e a complexidade de administrar uma academia. Planilhas intermináveis, sistemas desconectados e a falta de uma visão clara do negócio nos motivaram a criar uma solução diferente. Assim nasceu o FitCore: uma plataforma pensada para ser o coração da sua operação, um sistema que centraliza, simplifica e potencializa a gestão do seu estúdio ou academia.
                        </p>
                    </div>
                </section>
                
                {/* Mission Section */}
                <section className="py-16 bg-muted/40">
                    <div className="container grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                <Target className="h-4 w-4" />
                                Nossa Missão
                            </div>
                            <h3 className="text-3xl font-bold font-headline mb-4">Simplificar para Potencializar</h3>
                            <p className="text-lg text-muted-foreground">
                                Nossa missão é clara: **facilitar e desburocratizar a administração de academias e estúdios**. Acreditamos que, ao fornecer uma ferramenta poderosa, intuitiva e completa, permitimos que gestores e empreendedores foquem no que realmente importa: a saúde, o bem-estar e o sucesso de seus alunos. Queremos transformar a complexidade da gestão em simplicidade e eficiência.
                            </p>
                        </div>
                        <div className="order-1 md:order-2">
                             <Image 
                                src="https://placehold.co/600x400.png"
                                alt="Equipe trabalhando em um projeto"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-2xl"
                                data-ai-hint="team business"
                             />
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                 <section className="py-16">
                    <div className="container grid md:grid-cols-2 gap-12 items-center">
                         <div>
                             <Image 
                                src="https://placehold.co/600x400.png"
                                alt="Gráfico de crescimento"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-2xl"
                                data-ai-hint="growth chart"
                             />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                <Gem className="h-4 w-4" />
                                Nossa Visão
                            </div>
                            <h3 className="text-3xl font-bold font-headline mb-4">Ser o Parceiro Estratégico do seu Sucesso</h3>
                            <p className="text-lg text-muted-foreground">
                               Almejamos ser a plataforma de gestão líder e mais amada do mercado fitness na América Latina. Queremos ser reconhecidos não apenas pela excelência tecnológica, mas por sermos um verdadeiro parceiro estratégico no crescimento de cada cliente, inovando constantemente para antecipar as necessidades de um setor em constante evolução.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16 bg-muted/40">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold font-headline">Nossos Valores</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Os princípios que guiam cada linha de código e cada interação que temos.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ValueCard icon={Lightbulb} title="Inovação que Simplifica">
                                Buscamos constantemente novas tecnologias, não pela complexidade, mas para tornar o dia a dia de nossos clientes mais simples e produtivo.
                            </ValueCard>
                             <ValueCard icon={Users} title="Foco no Cliente">
                                O sucesso dos nossos clientes é o nosso sucesso. Ouvimos, aprendemos e co-criamos soluções que resolvem problemas reais.
                            </ValueCard>
                             <ValueCard icon={HeartHandshake} title="Parceria e Transparência">
                                Construímos relações de confiança, com comunicação clara, preços justos e suporte dedicado. Somos mais que um fornecedor, somos um parceiro.
                            </ValueCard>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
