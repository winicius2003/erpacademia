
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TermsOfServicePage() {
    const lastUpdated = new Date(2024, 7, 26); // Note: Month is 0-indexed

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">{title}</h2>
            <div className="text-muted-foreground space-y-4 text-justify">
                {children}
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
                <CardHeader>
                    <CardTitle className="text-4xl font-extrabold font-headline">Termos de Serviço</CardTitle>
                    <CardDescription>
                        Última atualização: {format(lastUpdated, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
                        <p className="font-bold">AVISO LEGAL IMPORTANTE:</p>
                        <p className="text-sm">Este documento é um modelo e não constitui aconselhamento jurídico. Recomendamos fortemente que você consulte um advogado para revisar e adaptar estes termos às necessidades específicas do seu negócio e garantir a conformidade com todas as leis aplicáveis.</p>
                    </div>

                    <Section title="1. Aceitação dos Termos">
                        <p>Ao acessar e utilizar o software FitCore ("Plataforma"), fornecido pela StarCreation ("Empresa"), você, seja como administrador de uma academia ("Cliente") ou como usuário final (aluno, funcionário, "Usuário"), concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com estes termos, não deverá utilizar a Plataforma.</p>
                    </Section>

                    <Separator />

                    <Section title="2. Descrição do Serviço">
                        <p>O FitCore é um sistema de software como serviço (SaaS) projetado para a gestão de academias, estúdios e centros de fitness. As funcionalidades incluem, mas não se limitam a: gestão de alunos, controle financeiro, agendamento de aulas, criação de treinos, controle de acesso e relatórios gerenciais.</p>
                    </Section>

                    <Separator />

                    <Section title="3. Contas e Responsabilidades">
                        <p><strong>3.1. Clientes (Academias):</strong> Você é responsável por manter a confidencialidade das credenciais de acesso de seus administradores e funcionários. Você é totalmente responsável por todas as atividades que ocorrem em sua conta, incluindo a exatidão dos dados inseridos (informações de alunos, financeiro, etc.).</p>
                        <p><strong>3.2. Usuários (Alunos e Funcionários):</strong> Você concorda em fornecer informações verdadeiras, precisas e completas ao se registrar e utilizar a Plataforma. Você é responsável por manter a segurança de sua senha e por qualquer atividade que ocorra sob sua conta.</p>
                    </Section>

                    <Separator />

                    <Section title="4. Privacidade e Proteção de Dados (LGPD)">
                        <p>A StarCreation leva a sério a privacidade dos seus dados. Nosso tratamento de dados pessoais está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                        <p><strong>4.1. Coleta e Uso de Dados:</strong> Coletamos dados necessários para a prestação do serviço, como informações cadastrais, de pagamento e de uso da plataforma. O Cliente (Academia) é o controlador dos dados de seus alunos e funcionários, e a StarCreation atua como operadora, processando os dados de acordo com as instruções do Cliente e para a finalidade do serviço contratado.</p>
                        <p><strong>4.2. Direitos dos Titulares:</strong> Os titulares dos dados (você) podem exercer seus direitos de acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, a qualquer momento, contatando o Cliente (sua academia) ou, subsidiariamente, a StarCreation através do e-mail de contato.</p>
                        <p>Para mais detalhes, consulte nossa Política de Privacidade.</p>
                    </Section>
                    
                    <Separator />

                    <Section title="5. Pagamentos, Assinaturas e Cancelamento">
                        <p><strong>5.1. Assinatura:</strong> O acesso à Plataforma é baseado em um modelo de assinatura mensal ou anual. Os planos e preços estão detalhados em nossa página de Preços.</p>
                        <p><strong>5.2. Pagamentos:</strong> Os pagamentos são processados através de nosso parceiro de pagamentos (Stripe). Ao fornecer informações de pagamento, você autoriza a cobrança dos valores correspondentes ao plano selecionado.</p>
                        <p><strong>5.3. Cancelamento:</strong> O Cliente pode cancelar sua assinatura a qualquer momento. O cancelamento entrará em vigor ao final do ciclo de faturamento atual. Não haverá reembolso por períodos parciais.</p>
                    </Section>
                    
                    <Separator />

                    <Section title="6. Propriedade Intelectual">
                        <p>Todo o conteúdo, software, design, logotipos e marcas registradas associadas à Plataforma FitCore são propriedade exclusiva da StarCreation. É proibida a cópia, modificação, distribuição ou qualquer outra forma de uso não autorizado do nosso material sem consentimento prévio por escrito.</p>
                    </Section>
                    
                    <Separator />

                    <Section title="7. Limitação de Responsabilidade">
                        <p>A StarCreation não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou da incapacidade de usar a Plataforma, incluindo, mas não se limitando a, perda de dados, interrupção de negócios ou perda de lucros.</p>
                    </Section>
                    
                    <Separator />
                    
                    <Section title="8. Modificações nos Termos">
                        <p>Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. Notificaremos os Clientes sobre alterações significativas. O uso continuado da Plataforma após tais alterações constitui sua concordância com os novos termos.</p>
                    </Section>

                    <Separator />
                    
                    <Section title="9. Legislação Aplicável">
                        <p>Estes Termos de Serviço serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da comarca de [Sua Cidade/Estado], Brasil, para dirimir quaisquer controvérsias oriundas destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
                    </Section>
                    
                    <Separator />
                    
                    <Section title="10. Contato">
                        <p>Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco pelo e-mail: <a href="mailto:contato@starcreation.com.br" className="text-primary underline">contato@starcreation.com.br</a>.</p>
                    </Section>
                </CardContent>
            </Card>
        </div>
    );
}
