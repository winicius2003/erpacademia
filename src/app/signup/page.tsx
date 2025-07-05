"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Building } from "lucide-react"

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

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Você será redirecionado para o login.",
    })
    setTimeout(() => router.push("/login"), 2000)
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
            Comece a gerenciar sua academia de forma inteligente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gym-name">Nome da Academia</Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="gym-name" placeholder="Sua Academia" required className="pl-8" />
              </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="full-name">Seu Nome</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="full-name" placeholder="Nome Completo" required className="pl-8" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" required className="pl-8" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required className="pl-8" />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold">
              Criar Conta
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
