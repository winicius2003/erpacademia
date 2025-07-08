
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSubscription } from '@/services/subscription';
import { logGympassCheckin } from '@/services/gympass';

const checkinSchema = z.object({
  userId: z.string().min(1, "O ID do usuário é obrigatório."),
  userName: z.string().min(1, "O nome do usuário é obrigatório."),
});

export async function POST(req: Request) {
  try {
    // 1. Check Academy Subscription Status first
    const subscription = await getSubscription();
    if (subscription?.status === 'blocked') {
        return NextResponse.json({ status: 'denied', reason: 'Acesso ao sistema bloqueado. Contate a administração da plataforma.' }, { status: 403 });
    }

    // 2. Validate the incoming request
    const body = await req.json();
    const validation = checkinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ status: 'denied', reason: 'Payload da requisição inválido.', errors: validation.error.flatten() }, { status: 400 });
    }

    const { userId, userName } = validation.data;
    
    // 3. Log the check-in
    await logGympassCheckin({ userId, userName });

    // 4. If all checks pass, allow access
    return NextResponse.json({ status: 'allowed', message: 'Check-in registrado com sucesso.' });

  } catch (error) {
    console.error('[GYMPASS_CHECKIN_API]', error);
    return NextResponse.json({ status: 'denied', reason: 'Erro interno no servidor.' }, { status: 500 });
  }
}
