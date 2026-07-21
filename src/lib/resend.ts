import { Resend } from 'resend';
import React from 'react';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('[Resend Init] ATENÇÃO: RESEND_API_KEY não está definida nas variáveis de ambiente. O envio de e-mails estará desativado até a chave ser configurada.');
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Odisley Matemática <onboarding@resend.dev>';

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY não configurada no servidor.';
    console.warn(`[Resend Email Skip] Não foi possível enviar e-mail para ${to}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const sender = from || DEFAULT_FROM_EMAIL;

  try {
    console.log(`[Resend Email] Enviando e-mail "${subject}" para ${to} (remetente: ${sender})...`);
    
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      react,
    });

    if (error) {
      console.error(`[Resend Email Erro] Erro retornado pela API do Resend ao enviar para ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend Email] E-mail enviado com sucesso para ${to}. ID do envio: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    const errorMsg = err?.message || 'Erro desconhecido ao chamar Resend';
    console.error(`[Resend Email Erro] Exceção ao enviar e-mail para ${to}:`, err);
    return { success: false, error: errorMsg };
  }
}
