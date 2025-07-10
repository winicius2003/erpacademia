
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PrivacyPolicyPage() {
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
                    <CardTitle className="text-4xl font-extrabold font-headline">Política de Privacidade</CardTitle>
                    <CardDescription>
                        Última atualização: {format(lastUpdated, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
                        <p className="font-bold">AVISO LEGAL IMPORTANTE:</p>
                        <p className="text-sm">Este documento é um modelo e não constitui aconselhamento jurídico. Recomendamos fortemente que você consulte um advogado para revisar e adaptar esta política às necessidades específicas do seu negócio e garantir a conformidade com a Lei Geral de Proteção de Dados (LGPD) e outras leis aplicáveis.</p>
                    </div>

                    <Section title="1. Introdução">
                        <p>A sua privacidade é importante para nós. Esta Política de Privacidade explica como a StarCreation ("Empresa", "nós") coleta, usa, processa e divulga suas informações em conexão com seu acesso e uso da plataforma FitCore ("Plataforma"). Nosso compromisso é proteger seus dados e ser transparente sobre como eles são utilizados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) do Brasil.</p>
                    </Section>

                    <Separator />

                    <Section title="2. Definição de Papéis (LGPD)">
                        <p>Para fins de proteção de dados, é importante entender os papéis:</p>
                        <p><strong>Controlador de Dados:</strong> É o nosso Cliente (a Academia, Estúdio ou Centro de Fitness) que contrata a plataforma FitCore. Ele é responsável por determinar as finalidades e os meios de tratamento dos dados pessoais de seus alunos e funcionários.</p>
                        <p><strong>Operador de Dados:</strong> A StarCreation, como fornecedora da plataforma FitCore, atua como operadora. Processamos os dados pessoais em nome e sob as instruções do Controlador (a Academia) para a prestação dos serviços contratados.</p>
                    </Section>

                     <Separator />

                    <Section title="3. Informações que Coletamos">
                        <p>Coletamos diferentes tipos de informações para fornecer e melhorar nossa Plataforma:</p>
                         <p><strong>3.1. Dados Fornecidos pelo Cliente (Academia):</strong> Informações de cadastro da empresa, dados do administrador, informações de faturamento e pagamento da assinatura.</p>
                        <p><strong>3.2. Dados Inseridos na Plataforma pelo Cliente:</strong>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Dados dos Alunos:</strong> Nome completo, e-mail, telefone, CPF, data de nascimento, endereço, dados de saúde (anamnese, avaliações físicas), histórico de pagamentos, frequência, e planos de treino.</li>
                                <li><strong>Dados dos Funcionários:</strong> Nome, e-mail, telefone, CPF, cargo, permissões de acesso e outras informações trabalhistas.</li>
                            </ul>
                        </p>
                        <p><strong>3.3. Dados Coletados Automaticamente:</strong> Informações de uso da plataforma, como logs de acesso, endereços IP, tipo de navegador e dados de cookies para o funcionamento essencial do site.</p>
                    </Section>

                    <Separator />

                    <Section title="4. Como Utilizamos Suas Informações">
                        <p>Utilizamos as informações coletadas para as seguintes finalidades:</p>
                         <ul className="list-disc pl-6 space-y-2 mt-2">
                           <li>Fornecer, operar e manter a Plataforma FitCore.</li>
                           <li>Processar transações financeiras (pagamentos de mensalidades e produtos).</li>
                           <li>Gerenciar o controle de acesso (catracas, biometria).</li>
                           <li>Permitir a criação e o acompanhamento de fichas de treino e avaliações físicas.</li>
                           <li>Gerar relatórios para a gestão da academia.</li>
                           <li>Comunicar-se com os usuários sobre o serviço (notificações, suporte).</li>
                           <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
                        </ul>
                    </Section>

                     <Separator />

                    <Section title="5. Compartilhamento de Dados">
                        <p>Não vendemos suas informações pessoais. Podemos compartilhar dados com:</p>
                         <ul className="list-disc pl-6 space-y-2 mt-2">
                           <li><strong>Provedores de Serviços:</strong> Subcontratamos serviços essenciais como processadores de pagamento (Stripe) e provedores de infraestrutura em nuvem, que processam dados em nosso nome e sob nossas instruções.</li>
                           <li><strong>Por Obrigação Legal:</strong> Se formos obrigados por lei ou por uma ordem judicial a divulgar informações.</li>
                        </ul>
                    </Section>

                     <Separator />
                     
                    <Section title="6. Direitos dos Titulares de Dados">
                        <p>De acordo com a LGPD, você, como titular dos dados, tem o direito de:</p>
                         <ul className="list-disc pl-6 space-y-2 mt-2">
                           <li><strong>Confirmar</strong> a existência de tratamento de seus dados.</li>
                           <li><strong>Acessar</strong> seus dados.</li>
                           <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados.</li>
                           <li><strong>Anonimizar, bloquear ou eliminar</strong> dados desnecessários ou tratados em desconformidade com a LGPD.</li>
                           <li><strong>Solicitar a portabilidade</strong> dos dados a outro fornecedor de serviço.</li>
                           <li><strong>Eliminar</strong> os dados pessoais tratados com o seu consentimento.</li>
                           <li><strong>Obter informação</strong> sobre as entidades com as quais seus dados foram compartilhados.</li>
                        </ul>
                        <p>Para exercer esses direitos, o aluno ou funcionário deve, primeiramente, contatar a sua academia (Controlador). A StarCreation fornecerá todo o suporte necessário para que a academia possa atender às solicitações.</p>
                    </Section>
                    
                    <Separator />

                    <Section title="7. Segurança dos Dados">
                        <p>Empregamos medidas de segurança técnicas e administrativas para proteger seus dados pessoais contra acesso não autorizado, destruição, perda ou alteração. No entanto, nenhum sistema é 100% seguro, e não podemos garantir segurança absoluta.</p>
                    </Section>
                    
                     <Separator />

                    <Section title="8. Cookies">
                        <p>Utilizamos cookies estritamente necessários para o funcionamento da plataforma, como manter sua sessão de login ativa. Não utilizamos cookies para fins de marketing ou publicidade direcionada.</p>
                    </Section>

                    <Separator />

                    <Section title="9. Contato">
                        <p>Se você tiver alguma dúvida sobre esta Política de Privacidade ou sobre como seus dados são tratados, entre em contato conosco através do e-mail: <a href="mailto:contato@starcreation.com.br" className="text-primary underline">contato@starcreation.com.br</a>.</p>
                    </Section>

                </CardContent>
            </Card>
        </div>
    );
}
