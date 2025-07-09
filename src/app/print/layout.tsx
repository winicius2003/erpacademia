import { Logo } from "@/components/logo"
import Link from "next/link"

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4 relative">
        <div className="absolute top-4 left-4">
            <Link href="/login" className="flex items-center gap-2 font-semibold text-foreground">
                <Logo className="h-6 w-6 text-primary" />
                <span>FitCore</span>
            </Link>
        </div>
        {children}
    </div>
  )
}
