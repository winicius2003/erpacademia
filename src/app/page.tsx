import Link from "next/link"
import { Dumbbell, Mail, Lock } from "lucide-react"

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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
              <Logo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Bem-vindo ao GymFlow</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail abaixo para fazer login em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/dashboard" className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  required
                  className="pl-8"
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
                <Input id="password" type="password" required className="pl-8" />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold">
              Entrar
            </Button>
            <Button variant="outline" className="w-full">
              Entrar com Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="#" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
