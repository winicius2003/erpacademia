"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, User } from "lucide-react"

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
import { initialEmployees } from "@/app/dashboard/access-control/page"

const masterAdmin = {
  name: "Administrador Master",
  login: "admin@admin",
  password: "uUmope5Z",
  role: "Admin",
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let userFound = null

    // Check for master admin
    if (login === masterAdmin.login && password === masterAdmin.password) {
      userFound = { name: masterAdmin.name, role: masterAdmin.role }
    } else {
      // Check for employees
      const employee = initialEmployees.find(
        (emp) => emp.login === login && emp.password === password
      )
      if (employee) {
        userFound = { name: employee.name, role: employee.role }
      }
    }

    if (userFound) {
      sessionStorage.setItem("fitcore.user", JSON.stringify(userFound))
      router.push("/dashboard")
    } else {
      toast({
        title: "Credenciais inválidas",
        description: "Por favor, verifique seu login e senha e tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
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
                  placeholder="seu.login"
                  required
                  className="pl-8"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
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
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold">
              Entrar
            </Button>
            <Button variant="outline" className="w-full" type="button">
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
