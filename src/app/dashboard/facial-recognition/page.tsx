
"use client"

import * as React from "react"
import { ScanFace, Loader2, Video, VideoOff, Check, X, UserCircle, AlertTriangle, BadgeCheck, Camera, RotateCcw } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { getMembersWithFaceScan, type Member } from "@/services/members"
import { searchFaceInDatabase, type FacialSearchInput } from "@/ai/flows/facial-search-flow"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"


type RecognitionStatus = 'searching' | 'success' | 'failed' | 'error' | 'idle';

export default function FacialRecognitionPage() {
    const { toast } = useToast()
    const [status, setStatus] = React.useState<RecognitionStatus>('idle')
    const [statusMessage, setStatusMessage] = React.useState('Aguardando início da busca...')
    const [membersWithFace, setMembersWithFace] = React.useState<Member[]>([])
    const [foundMember, setFoundMember] = React.useState<Member | null>(null);

    const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    // Function to start the recognition loop
    const startRecognitionLoop = React.useCallback(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setStatus('searching');
        setStatusMessage('Buscando...');
        setFoundMember(null);

        // Start a new interval
        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || !membersWithFace.length) {
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) return;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const livePhotoDataUri = canvas.toDataURL('image/jpeg');

            try {
                const registeredFaces = membersWithFace.map(m => ({ studentId: m.id, photoDataUri: m.faceScanUrl! }));
                const input: FacialSearchInput = { registeredFaces, livePhotoDataUri };
                
                const result = await searchFaceInDatabase(input);

                if (result.matchFound && result.studentId) {
                    const member = membersWithFace.find(m => m.id === result.studentId);
                    if (member) {
                        setFoundMember(member);
                        setStatus('success');
                        setStatusMessage(`Acesso liberado para ${member.name}`);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                    }
                }
            } catch (error) {
                console.error("Facial recognition error:", error);
                setStatus('error');
                setStatusMessage("Erro no sistema de reconhecimento.");
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

        }, 5000); // Check every 5 seconds
    }, [membersWithFace]);


    const getCameraPermission = React.useCallback(async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           toast({ variant: 'destructive', title: 'Recurso não suportado', description: 'Seu navegador não suporta acesso à câmera.' });
           setHasCameraPermission(false);
           return;
       }
       try {
           const stream = await navigator.mediaDevices.getUserMedia({ video: true })
           setHasCameraPermission(true)
           if (videoRef.current) {
               videoRef.current.srcObject = stream
           }
           // Automatically start recognition when camera is ready
           startRecognitionLoop();

       } catch (error) {
           console.error("Error accessing camera:", error)
           setHasCameraPermission(false)
           toast({
               variant: "destructive",
               title: "Acesso à Câmera Negado",
               description: "Habilite as permissões de câmera no seu navegador para usar este recurso.",
           })
       }
    }, [toast, startRecognitionLoop]);

    const stopRecognition = React.useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setStatus('idle');
        setStatusMessage('Busca pausada.');
    }, []);

    // Initial data fetch and camera setup
    React.useEffect(() => {
        async function fetchMembers() {
            try {
                const membersData = await getMembersWithFaceScan();
                setMembersWithFace(membersData);
            } catch (error) {
                toast({ title: 'Erro ao buscar alunos com cadastro facial', variant: 'destructive' });
            }
        }
        
        fetchMembers();
        getCameraPermission();

        // Cleanup function
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [toast, getCameraPermission]);


    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ScanFace /> Totem de Reconhecimento Facial
                </CardTitle>
                <CardDescription>A câmera está ativa. O acesso será liberado automaticamente ao reconhecer um aluno.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                 <div className="space-y-4">
                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background/80">
                                <VideoOff className="h-12 w-12 text-destructive" />
                                <p className="mt-2 font-semibold">Câmera não encontrada</p>
                                <p className="text-sm text-muted-foreground">Verifique as permissões no seu navegador.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-muted/50 rounded-lg min-h-[250px]">
                    {status === 'searching' && (
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-2 font-medium">Buscando...</p>
                        </div>
                    )}
                     {status === 'success' && foundMember && (
                        <>
                            <Alert className="bg-green-50 dark:bg-green-900/30 border-green-500/50 text-center">
                                <BadgeCheck className="h-5 w-5 text-green-600" />
                                <AlertTitle className="text-2xl text-green-800 dark:text-green-300">Acesso Liberado!</AlertTitle>
                            </Alert>
                             <Avatar className="w-24 h-24 border-4 border-green-500/50">
                                <AvatarImage src={foundMember.faceScanUrl} />
                                <AvatarFallback><UserCircle className="w-full h-full text-muted-foreground"/></AvatarFallback>
                            </Avatar>
                            <p className="text-xl font-bold">{foundMember.name}</p>
                            <Button onClick={startRecognitionLoop}>
                                <RotateCcw className="mr-2 h-4 w-4"/> Limpar e Buscar Novamente
                            </Button>
                        </>
                    )}
                    {(status === 'failed' || status === 'error' ) && (
                        <Alert variant="destructive">
                            <X className="h-5 w-5" />
                            <AlertTitle className="text-xl">{status === 'failed' ? 'Não Reconhecido' : 'Erro no Sistema'}</AlertTitle>
                            <AlertDescription>{statusMessage}</AlertDescription>
                        </Alert>
                    )}
                    {status === 'idle' && (
                        <div className="text-center text-muted-foreground">
                            <Camera className="h-12 w-12 mx-auto"/>
                            <p className="mt-2">{statusMessage}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
