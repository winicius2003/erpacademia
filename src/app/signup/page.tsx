"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, User, Building, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { createSignupCheckoutSession } from "@/services/stripe"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    gymName: "",
    adminName: "",
    adminEmail: "",
  })
  
  const selectedPlan = searchParams.get("plan") || "Iniciante"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { gymName, adminName, adminEmail } = formData
      const checkoutUrl = await createSignupCheckoutSession(selectedPlan, gymName, adminName, adminEmail);
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Stripe checkout error:", error)
      toast({
        title: "Erro ao iniciar pagamento",
        description: "Não foi possível redirecionar para o pagamento. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center bg-background px-4 py-8">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
           <div className="flex justify-center items-center mb-4">
             <Link href="/" aria-label="Voltar para a página inicial">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline text-center">Crie sua conta FitCore</CardTitle>
          <CardDescription className="text-center">
            Você está assinando o plano <span className="font-bold text-primary">{selectedPlan}</span>. Preencha seus dados para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gymName">Nome da Academia</Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="gymName" placeholder="Sua Academia" required className="pl-8" value={formData.gymName} onChange={handleInputChange} />
              </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="adminName">Seu Nome</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="adminName" placeholder="Nome Completo do Admin" required className="pl-8" value={formData.adminName} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminEmail">Seu E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="adminEmail" type="email" placeholder="seu@email.com" required className="pl-8" value={formData.adminEmail} onChange={handleInputChange} />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : "Ir para Pagamento"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
