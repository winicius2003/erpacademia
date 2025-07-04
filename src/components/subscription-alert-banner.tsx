"use client"

import Link from "next/link"
import { AlertCircle, ShieldCheck } from "lucide-react"

import { useSubscription } from "@/lib/subscription-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "./ui/button"

export function SubscriptionAlertBanner() {
  const { status, daysRemaining } = useSubscription()

  if (status === 'active' || status === 'loading') {
    return null
  }

  const messages = {
    warning: {
      title: "Atenção: Sua assinatura está prestes a vencer!",
      description: `Sua assinatura expira em ${daysRemaining} dia(s). Renove agora para evitar a interrupção dos serviços.`,
    },
    overdue: {
      title: "Assinatura Vencida: Acesso limitado",
      description: "Seu pagamento está atrasado. Algumas funcionalidades, como a emissão de faturas, foram desativadas. Regularize para reativar o acesso completo.",
    },
    blocked: {
      title: "Acesso Bloqueado: Assinatura muito vencida",
      description: "O acesso à maioria das funcionalidades foi bloqueado devido à falta de pagamento. Por favor, regularize sua assinatura.",
    },
  }

  const selectedMessage = messages[status]

  return (
    <Alert variant="destructive" className="m-4 mb-0 flex items-start justify-between gap-4">
      <AlertCircle className="h-5 w-5 mt-0.5" />
      <div className="flex-1">
        <AlertTitle>{selectedMessage.title}</AlertTitle>
        <AlertDescription>
          {selectedMessage.description}
        </AlertDescription>
      </div>
      <Button asChild>
        <Link href="/dashboard/subscription">
            <ShieldCheck className="mr-2 h-4 w-4" /> Regularizar Agora
        </Link>
      </Button>
    </Alert>
  )
}
