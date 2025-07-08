
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Member } from "@/services/members"

export default function StudentDashboardPage() {
    const [user, setUser] = React.useState<Member | null>(null)

    React.useEffect(() => {
        const userData = sessionStorage.getItem("fitcore.user")
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    if (!user) {
        return <div>Carregando...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Bem-vindo(a), {user.name.split(' ')[0]}!</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Seu Plano</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Status: <span className="font-semibold">{user.status}</span></p>
                    <p>Plano Atual: <span className="font-semibold">{user.plan}</span></p>
                    <p>Vencimento: <span className="font-semibold">{user.expires}</span></p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Avisos</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">O Portal do Aluno está em desenvolvimento. Em breve você poderá ver seus treinos, pagamentos e avaliações aqui.</p>
                </CardContent>
            </Card>
        </div>
    )
}
