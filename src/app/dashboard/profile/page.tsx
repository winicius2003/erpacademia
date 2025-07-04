"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meu Perfil</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e configurações da conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="person face" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <h3 className="text-lg font-bold">Administrador Master</h3>
            <p className="text-sm text-muted-foreground">admin@admin</p>
            <Button variant="outline" size="sm" className="mt-2">Enviar Foto</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" defaultValue="Administrador Master" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="id">ID do Funcionário</Label>
            <Input id="id" defaultValue="S-0001" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue="admin@admin" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" defaultValue="+55 (11) 99999-9999" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dob">Data de Nascimento</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Cargo</Label>
             <Select defaultValue="admin">
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="recepcao">Recepção</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  )
}
