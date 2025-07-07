import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAfter } from 'date-fns';

import { getMemberByPin } from '@/services/members';
import { getEmployeeByPin } from '@/services/employees';
import { getSubscription } from '@/services/subscription';

const accessSchema = z.object({
  pin: z.string().min(4, "PIN inválido").max(6, "PIN inválido"),
  // In the future, you could add:
  // biometricId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Check Academy Subscription Status first
    const subscription = await getSubscription();
    if (!subscription || subscription.status === 'blocked') {
        return NextResponse.json({ status: 'denied', reason: 'Acesso ao sistema bloqueado. Contate a administração da plataforma.' }, { status: 403 });
    }

    // 2. Validate the incoming request from the turnstile
    const body = await req.json();
    const validation = accessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ status: 'denied', reason: 'Payload da requisição inválido.' }, { status: 400 });
    }

    const { pin } = validation.data;

    // 3. Check if the PIN belongs to an employee first
    const employee = await getEmployeeByPin(pin);
    if (employee) {
      if (employee.status === 'Ativo') {
        return NextResponse.json({ status: 'allowed', name: employee.name, type: 'employee' });
      } else {
        return NextResponse.json({ status: 'denied', reason: 'Acesso de funcionário inativo.' }, { status: 403 });
      }
    }

    // 4. If not an employee, check if it belongs to a member
    const member = await getMemberByPin(pin);
    if (member) {
      // Check if member is active
      if (member.status !== 'Ativo') {
        return NextResponse.json({ status: 'denied', reason: 'Aluno inativo ou com pendências.' }, { status: 403 });
      }

      // Check if plan has expired
      const today = new Date();
      const expirationDate = new Date(member.expires.replace(/-/g, '/'));
      
      if (isAfter(today, expirationDate)) {
         return NextResponse.json({ status: 'denied', reason: `Plano vencido em ${expirationDate.toLocaleDateString('pt-BR')}.` }, { status: 403 });
      }
      
      // If all checks pass, allow access
      return NextResponse.json({ status: 'allowed', name: member.name, type: 'member' });
    }

    // 5. If no employee or member is found with the PIN
    return NextResponse.json({ status: 'denied', reason: 'PIN não encontrado.' }, { status: 404 });

  } catch (error) {
    console.error('[ACCESS_VALIDATE_API]', error);
    return NextResponse.json({ status: 'denied', reason: 'Erro interno no servidor.' }, { status: 500 });
  }
}
