'use server';

import { redirect } from 'next/navigation';
import { criarSupabaseServer } from '@/lib/supabase/server';

export type EstadoLogin = { erro?: string };

export async function entrar(_prev: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get('email') ?? '').trim();
  const senha = String(formData.get('senha') ?? '');

  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' };

  const supabase = await criarSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) return { erro: 'E-mail ou senha incorretos.' };

  redirect('/admin');
}

export async function sair() {
  const supabase = await criarSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
