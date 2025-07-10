
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Target, Gem, Lightbulb, Users, HeartHandshake } from "lucide-react";

export default function AboutPage() {

    const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="bg-primary/10 text-primary p-4 rounded-full">
                <Icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-semibold font-headline">{title}</h2>
                <div className="text-muted-foreground mt-2 text-justify">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-muted/40 min-h-screen py-12 px-4">
             <header className="max-w-4xl mx-auto mb-8">
                <Link href="/" className="flex items-center gap-2 text-foreground mb-4">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">FitCore</span>
                </Link>
            </header>
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center p-8">
                    <CardTitle className="text-4xl font-extrabold font-headline">Nossa História</CardTitle>
                    <CardDescription className="max-w-3xl mx-auto text-lg">
                        Nascemos da paixão por tecnologia e bem-estar, com o objetivo de revolucionar a gestão de negócios no universo fitness.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10 p-8">
                    <div>
                        <p className="text-lg text-muted-foreground text-center">
                            A StarCreation foi fundada por entusiastas do fitness que vivenciaram na prática as dores e a complexidade de administrar uma academia. Planilhas intermináveis, sistemas desconectados e a falta de uma visão clara do negócio nos motivaram a criar uma solução diferente. Assim nasceu o FitCore: uma plataforma pensada para ser o coração da sua operação, um sistema que centraliza, simplifica e potencializa a gestão do seu estúdio ou academia.
                        </p>
                    </div>
                    
                    <Separator />

                    <Section icon={Target} title="Nossa Missão">
                        <p>
                            Nossa missão é clara: **facilitar e desburocratizar a administração de academias e estúdios**. Acreditamos que, ao fornecer uma ferramenta poderosa, intuitiva e completa, permitimos que gestores e empreendedores foquem no que realmente importa: a saúde, o bem-estar e o sucesso de seus alunos. Queremos transformar a complexidade da gestão em simplicidade e eficiência.
                        </p>
                    </Section>

                    <Separator />

                    <Section icon={Gem} title="Nossa Visão">
                        <p>
                           Almejamos ser a plataforma de gestão líder e mais amada do mercado fitness na América Latina. Queremos ser reconhecidos não apenas pela excelência tecnológica, mas por sermos um verdadeiro parceiro estratégico no crescimento de cada cliente, inovando constantemente para antecipar as necessidades de um setor em constante evolução.
                        </p>
                    </Section>

                    <Separator />

                    <div>
                        <h2 className="text-2xl font-bold font-headline text-center mb-6">Nossos Valores</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <div className="bg-primary/10 text-primary p-3 rounded-full mb-3"><Lightbulb className="h-6 w-6"/></div>
                                <h3 className="font-semibold text-lg">Inovação que Simplifica</h3>
                                <p className="text-sm text-muted-foreground">Buscamos constantemente novas tecnologias, não pela complexidade, mas para tornar o dia a dia de nossos clientes mais simples e produtivo.</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <div className="bg-primary/10 text-primary p-3 rounded-full mb-3"><Users className="h-6 w-6"/></div>
                                <h3 className="font-semibold text-lg">Foco no Cliente</h3>
                                <p className="text-sm text-muted-foreground">O sucesso dos nossos clientes é o nosso sucesso. Ouvimos, aprendemos e co-criamos soluções que resolvem problemas reais.</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <div className="bg-primary/10 text-primary p-3 rounded-full mb-3"><HeartHandshake className="h-6 w-6"/></div>
                                <h3 className="font-semibold text-lg">Parceria e Transparência</h3>
                                <p className="text-sm text-muted-foreground">Construímos relações de confiança, com comunicação clara, preços justos e suporte dedicado. Somos mais que um fornecedor, somos um parceiro.</p>
                            </div>
                        </div>
                    </div>
                    
                </CardContent>
            </Card>
        </div>
    );
}
