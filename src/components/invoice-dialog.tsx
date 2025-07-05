"use client"

import * as React from "react"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import Image from "next/image"

export function InvoiceDialog({ isOpen, onOpenChange, invoiceData }) {
  const printableRef = React.useRef(null)

  const handlePrint = () => {
    window.print()
  }

  if (!invoiceData) {
    return null
  }

  const totalAmount = Number(invoiceData.amount).toFixed(2)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div ref={printableRef} className="printable-invoice">
          <DialogHeader className="mb-4">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Image src="https://placehold.co/80x80.png" alt="Logo da Empresa" className="w-16 h-16 rounded-md object-cover" width={80} height={80} data-ai-hint="logo building" />
                    <div>
                        <h1 className="text-xl font-bold font-headline">Academia Exemplo</h1>
                        <p className="text-xs text-muted-foreground">Rua Fictícia, 123 - Bairro Imaginário</p>
                        <p className="text-xs text-muted-foreground">Cidade/UF - CEP 12345-678</p>
                        <p className="text-xs text-muted-foreground">CNPJ: 00.000.000/0001-00</p>
                    </div>
                </div>
                <div className="text-right">
                    <DialogTitle className="text-2xl font-bold mb-1">FATURA</DialogTitle>
                    <p className="text-sm text-muted-foreground">#{invoiceData.id}</p>
                    <p className="text-sm text-muted-foreground">Data: {format(new Date(invoiceData.date.replace(/-/g, '/')), "dd/MM/yyyy")}</p>
                </div>
            </div>
          </DialogHeader>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-semibold mb-2 text-muted-foreground">Cobrança para:</h3>
            <p className="font-medium">{invoiceData.student}</p>
          </div>
          
          <Separator className="my-4" />
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">R$ {Number(item.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(item.quantity * item.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Separator className="my-4" />
          
          <div className="flex justify-end">
            <div className="w-full max-w-xs text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>R$ {totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxas:</span>
                <span>R$ 0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>TOTAL:</span>
                <span>R$ {totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handlePrint}>Imprimir / Salvar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
