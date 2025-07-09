
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, User, Loader2 } from "lucide-react"

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
import { getEmployeeByLogin } from "@/services/employees"
import { getMemberByEmail } from "@/services/members"
import { initializeSubscription } from "@/services/subscription"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (searchParams.get("signup") === "success") {
      toast({
        title: "Pagamento Concluído com Sucesso!",
        description: "Sua academia foi criada. Em breve você receberá um e-mail com sua senha de acesso.",
      });
      // Optional: remove query param from URL
      router.replace('/login', { scroll: false }); 
    }
  }, [searchParams, toast, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Superadmin check
    if (login.toLowerCase() === "superadmin@fitcore.com" && password === "superadminpass") {
      sessionStorage.setItem("fitcore.user", JSON.stringify({ id: "superadmin", name: "Super Admin", role: "Superadmin", email: login }));
      router.push("/superadmin/dashboard");
      setIsLoading(false);
      return;
    }

    // Master Admin check
    const isMasterAdminLogin =
      (login.toLowerCase() === "jwinicius.souza@gmail.com" || login.toLowerCase() === "admin@admin") &&
      password === "uUmope5Z";

    if (isMasterAdminLogin) {
      const userFound = { id: "admin-master", name: "Administrador Master", role: "Admin", email: login };
      sessionStorage.setItem("fitcore.user", JSON.stringify(userFound));
      await initializeSubscription();
      router.push("/dashboard");
      setIsLoading(false);
      return;
    }

    // Employee check
    const employee = await getEmployeeByLogin(login);
    if (employee && employee.password === password) {
        const userFound = { id: employee.id, name: employee.name, role: employee.role, email: employee.email };
        sessionStorage.setItem("fitcore.user", JSON.stringify(userFound));
        
        if (employee.role === 'Impressão') {
            router.push("/print");
        } else {
            await initializeSubscription();
            router.push("/dashboard");
        }
        
        setIsLoading(false);
        return;
    }

    // Student check
    const member = await getMemberByEmail(login);
    if (member && member.password === password) {
        const userFound = { id: member.id, name: member.name, role: "Aluno", email: member.email };
        sessionStorage.setItem("fitcore.user", JSON.stringify(userFound));
        router.push("/portal/dashboard");
        setIsLoading(false);
        return;
    }

    // If no user found
    toast({
        title: "Credenciais inválidas",
        description: "Por favor, verifique seu login e senha e tente novamente.",
        variant: "destructive",
    })
    setIsLoading(false)
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
             <Link href="/" aria-label="Voltar para a página inicial">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline text-center">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center">
            Digite seu login para acessar seu painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login">Login</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login"
                  type="text"
                  placeholder="seu@email.com"
                  required
                  className="pl-8"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            <Button variant="outline" className="w-full" type="button" disabled={isLoading}>
              Entrar com Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
