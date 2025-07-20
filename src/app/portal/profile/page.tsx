
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Loader2, User, FileSignature, CalendarDays, CheckCircle, AlertCircle, XCircle, ScanFace, Camera, Video, VideoOff, ArrowRight } from "lucide-react"

import { getMemberById, updateMember, type Member } from "@/services/members"
import { getAssessments, type Assessment } from "@/services/assessments"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const statusConfig = {
    Ativo: { icon: CheckCircle, color: "text-green-500", label: "Ativo" },
    Atrasado: { icon: AlertCircle, color: "text-yellow-500", label: "Pendente" },
    Inativo: { icon: XCircle, color: "text-red-500", label: "Inativo" },
}

const faceRegistrationSteps = [
    { title: "Foto Frontal", instruction: "Olhe diretamente para a câmera, com o rosto bem iluminado e sem acessórios (óculos, boné)." },
    { title: "Perfil Esquerdo", instruction: "Vire lentamente o rosto para a sua direita, mostrando o lado esquerdo do seu rosto para a câmera." },
    { title: "Perfil Direito", instruction: "Agora, vire lentamente o rosto para a sua esquerda, mostrando o lado direito." },
];

export default function StudentProfilePage() {
    const [user, setUser] = React.useState<Member | null>(null)
    const [assessments, setAssessments] = React.useState<Assessment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
    const [isRegisteringFace, setIsRegisteringFace] = React.useState(false);
    const [isSavingFace, setIsSavingFace] = React.useState(false);
    const [faceRegistrationStep, setFaceRegistrationStep] = React.useState(0);
    const [capturedPhotos, setCapturedPhotos] = React.useState<string[]>([]);
    
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    const fetchUserData = React.useCallback(async () => {
        setIsLoading(true)
        const sessionUser = sessionStorage.getItem("fitcore.user")
        if (!sessionUser) {
            setIsLoading(false)
            return;
        }

        const parsedUser = JSON.parse(sessionUser)

        try {
            const [memberData, assessmentsData] = await Promise.all([
                getMemberById(parsedUser.id),
                getAssessments(),
            ]);
            
            setUser(memberData);
            if (memberData) {
                setAssessments(assessmentsData.filter(a => a.studentId === memberData.id));
            }

        } catch (error) {
            console.error("Failed to fetch student profile data:", error)
        } finally {
            setIsLoading(false)
        }
    }, []);

    React.useEffect(() => {
        fetchUserData();
    }, [fetchUserData])

    const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast({ variant: 'destructive', title: 'Recurso não suportado', description: 'Seu navegador não suporta acesso à câmera.' });
            setHasCameraPermission(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Acesso à Câmera Negado',
                description: 'Por favor, habilite o acesso à câmera nas configurações do seu navegador.',
            });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    const handleStartRegistration = () => {
        setIsRegisteringFace(true);
        setFaceRegistrationStep(0);
        setCapturedPhotos([]);
        getCameraPermission();
    }
    
    const handleCancelRegistration = () => {
        stopCamera();
        setIsRegisteringFace(false);
    }
    
    const handleCaptureFace = () => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        setCapturedPhotos(prev => [...prev, dataUrl]);

        if (faceRegistrationStep < faceRegistrationSteps.length - 1) {
            setFaceRegistrationStep(prev => prev + 1);
        } else {
            // Last photo captured, now save all
            handleSaveFaces([...capturedPhotos, dataUrl]);
        }
    }
    
    const handleSaveFaces = async (photos: string[]) => {
        if (!user || photos.length !== 3) return;
        setIsSavingFace(true);

        try {
            await updateMember(user.id, { faceScanUrl: photos });
            await fetchUserData(); // Refresh user data to show new status
            toast({ title: 'Rosto Cadastrado!', description: 'Seu cadastro facial foi concluído com sucesso.' });
        } catch (error) {
            toast({ title: 'Erro ao Cadastrar', variant: 'destructive', description: 'Não foi possível salvar sua foto.' });
        } finally {
            stopCamera();
            setIsSavingFace(false);
            setIsRegisteringFace(false);
        }
    }

    if (isLoading) {
        return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    if (!user) {
        return <div className="text-center">Não foi possível carregar seus dados. Tente fazer login novamente.</div>
    }

    const CurrentStatusIcon = statusConfig[user.status].icon
    const currentStatusColor = statusConfig[user.status].color

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User /> Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Nome:</span>
                                <span className="font-semibold">{user.name}</span>
                            </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-semibold">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Telefone:</span>
                                <span className="font-semibold">{user.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nascimento:</span>
                                <span className="font-semibold">{format(parseISO(user.dob), "dd/MM/yyyy")}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">CPF:</span>
                                <span className="font-semibold">{user.cpf}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileSignature /> Dados do Plano</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Plano Atual:</span>
                                <span className="font-semibold">{user.plan}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Vencimento:</span>
                                <span className="font-semibold">{format(parseISO(user.expires), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={user.status === 'Ativo' ? 'secondary' : 'destructive'} className="gap-1">
                                    <CurrentStatusIcon className={`h-3 w-3 ${currentStatusColor}`} />
                                    <span className={currentStatusColor}>{statusConfig[user.status].label}</span>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarDays /> Histórico de Avaliações</CardTitle>
                            <CardDescription>Acompanhe sua evolução física ao longo do tempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Peso</TableHead>
                                        <TableHead>% Gordura</TableHead>
                                        <TableHead>M. Muscular</TableHead>
                                        <TableHead>Tipo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assessments.length > 0 ? assessments.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{format(parseISO(item.date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{item.measures.weight.toFixed(1)} kg</TableCell>
                                            <TableCell>{item.measures.bodyFat?.toFixed(1) || '-'} %</TableCell>
                                            <TableCell>{item.measures.muscleMass?.toFixed(1) || '-'} kg</TableCell>
                                            <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Nenhuma avaliação encontrada.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><ScanFace /> Reconhecimento Facial</CardTitle>
                            <CardDescription>Cadastre seu rosto para ter um acesso mais rápido e seguro na catraca.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isRegisteringFace ? (
                                <div className="space-y-4">
                                     <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                        {hasCameraPermission === false && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background/80">
                                                <VideoOff className="h-12 w-12 text-destructive" />
                                                <p className="mt-2 font-semibold">Câmera não encontrada</p>
                                                <p className="text-sm text-muted-foreground">Verifique as permissões no seu navegador.</p>
                                            </div>
                                        )}
                                     </div>
                                     <div className="space-y-2 text-center">
                                        <p className="font-semibold">{faceRegistrationSteps[faceRegistrationStep].title}</p>
                                        <p className="text-sm text-muted-foreground">{faceRegistrationSteps[faceRegistrationStep].instruction}</p>
                                        <Progress value={((faceRegistrationStep + 1) / faceRegistrationSteps.length) * 100} className="w-1/2 mx-auto" />
                                     </div>
                                </div>
                            ) : (user.faceScanUrl && user.faceScanUrl.length >= 3) ? (
                                <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-500/50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800 dark:text-green-300">Cadastro Facial Ativo</AlertTitle>
                                    <AlertDescription>Seu rosto já está cadastrado! Se precisar, você pode registrar novamente.</AlertDescription>
                                </Alert>
                            ) : (
                                 <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Cadastro Facial Pendente</AlertTitle>
                                    <AlertDescription>Você ainda não cadastrou seu rosto. Faça o cadastro para agilizar sua entrada.</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            {isRegisteringFace ? (
                                <>
                                    <Button onClick={handleCaptureFace} disabled={!hasCameraPermission || isSavingFace}>
                                        {isSavingFace ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Camera className="mr-2 h-4 w-4" />}
                                        {isSavingFace 
                                            ? 'Salvando...' 
                                            : `Capturar ${faceRegistrationStep === faceRegistrationSteps.length - 1 ? 'e Finalizar' : ''}`
                                        }
                                    </Button>
                                    <Button variant="ghost" onClick={handleCancelRegistration}>Cancelar</Button>
                                </>
                            ) : (
                                <Button onClick={handleStartRegistration}>
                                    <Video className="mr-2 h-4 w-4" />
                                    {(user.faceScanUrl && user.faceScanUrl.length > 0) ? 'Registrar Novamente' : 'Iniciar Cadastro Facial'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
