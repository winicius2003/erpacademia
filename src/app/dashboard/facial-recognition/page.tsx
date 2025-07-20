
"use client"

import * as React from "react"
import { ScanFace, Loader2, Video, VideoOff, Check, X, ChevronsUpDown, UserCircle, AlertTriangle, BadgeCheck } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { getMembers, type Member } from "@/services/members"
import { performFacialRecognition, type FacialRecognitionInput } from "@/ai/flows/facial-recognition-flow"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

type RecognitionStatus = 'idle' | 'recognizing' | 'success' | 'failed' | 'error';

export default function FacialRecognitionPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(true)
    const [allMembers, setAllMembers] = React.useState<Member[]>([])
    const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
    const [recognitionStatus, setRecognitionStatus] = React.useState<RecognitionStatus>('idle')
    const [recognitionMessage, setRecognitionMessage] = React.useState('')
    
    const [isComboboxOpen, setIsComboboxOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        const getCameraPermission = async () => {
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
            } catch (error) {
                console.error("Error accessing camera:", error)
                setHasCameraPermission(false)
                toast({
                    variant: "destructive",
                    title: "Câmera Access Denied",
                    description: "Please enable camera permissions in your browser settings to use this feature.",
                })
            }
        }
        getCameraPermission()

        return () => { // Cleanup function to stop camera when component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [toast])

    React.useEffect(() => {
        async function fetchMembers() {
            setIsLoading(true);
            try {
                const membersData = await getMembers();
                setAllMembers(membersData);
            } catch (error) {
                toast({ title: 'Erro ao buscar alunos', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchMembers();
    }, [toast]);

    const handleRecognize = async () => {
        if (!videoRef.current || !selectedMember) {
            toast({ title: "Selecione um aluno primeiro.", variant: 'destructive' });
            return;
        }

        if (!selectedMember.faceScanUrl) {
            toast({ title: 'Cadastro Facial Pendente', description: `O aluno ${selectedMember.name} não possui um rosto cadastrado.`, variant: 'destructive' });
            return;
        }
        
        setRecognitionStatus('recognizing');

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const livePhotoDataUri = canvas.toDataURL('image/jpeg');

        try {
            const input: FacialRecognitionInput = {
                registeredPhotoDataUri: selectedMember.faceScanUrl,
                livePhotoDataUri: livePhotoDataUri,
                studentName: selectedMember.name,
            };

            const result = await performFacialRecognition(input);
            
            if (result.isMatch) {
                setRecognitionStatus('success');
                setRecognitionMessage(result.reasoning);
            } else {
                setRecognitionStatus('failed');
                setRecognitionMessage(result.reasoning);
            }
        } catch (error) {
            console.error("Facial recognition error:", error);
            setRecognitionStatus('error');
            setRecognitionMessage("Ocorreu um erro no servidor ao tentar o reconhecimento.");
        }
    }
    
    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setRecognitionStatus('idle');
        setRecognitionMessage('');
        setIsComboboxOpen(false);
        setSearchQuery('');
    }

    const filteredMembers = allMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) && member.faceScanUrl
    );

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ScanFace /> Reconhecimento Facial
                </CardTitle>
                <CardDescription>Valide a entrada de alunos de forma rápida e segura usando a câmera.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
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
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Aluno a ser verificado</label>
                        <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isComboboxOpen}
                                    className="w-full justify-between h-11"
                                >
                                    {selectedMember
                                        ? (<div className="flex items-center gap-2"><Avatar className="w-6 h-6"><AvatarImage src={selectedMember.faceScanUrl} /><AvatarFallback><UserCircle/></AvatarFallback></Avatar>{selectedMember.name}</div>)
                                        : "Selecione um aluno..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                                <Command>
                                    <CommandInput placeholder="Buscar aluno com cadastro facial..." value={searchQuery} onValueChange={setSearchQuery}/>
                                    <CommandList>
                                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {filteredMembers.map((member) => (
                                                <CommandItem key={member.id} value={member.name} onSelect={() => handleSelectMember(member)}>
                                                    <Check className={cn("mr-2 h-4 w-4", selectedMember?.id === member.id ? "opacity-100" : "opacity-0")} />
                                                    {member.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleRecognize} className="w-full" size="lg" disabled={!selectedMember || recognitionStatus === 'recognizing' || !hasCameraPermission}>
                        {recognitionStatus === 'recognizing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanFace className="mr-2 h-4 w-4" />}
                        {recognitionStatus === 'recognizing' ? 'Reconhecendo...' : 'Reconhecer Rosto'}
                    </Button>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-muted/50 rounded-lg">
                    {recognitionStatus === 'idle' && (
                        <div className="text-center text-muted-foreground">
                            <p>Aguardando verificação...</p>
                        </div>
                    )}
                     {recognitionStatus === 'recognizing' && (
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-2 font-medium">Analisando...</p>
                        </div>
                    )}
                     {recognitionStatus === 'success' && (
                        <Alert className="bg-green-50 dark:bg-green-900/30 border-green-500/50">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-xl text-green-800 dark:text-green-300">Acesso Permitido</AlertTitle>
                            <AlertDescription>{recognitionMessage}</AlertDescription>
                        </Alert>
                    )}
                    {recognitionStatus === 'failed' && (
                        <Alert variant="destructive">
                            <X className="h-5 w-5" />
                            <AlertTitle className="text-xl">Acesso Negado</AlertTitle>
                            <AlertDescription>{recognitionMessage}</AlertDescription>
                        </Alert>
                    )}
                    {recognitionStatus === 'error' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <AlertTitle className="text-xl">Erro no Sistema</AlertTitle>
                            <AlertDescription>{recognitionMessage}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
