'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { entrar, type EstadoLogin } from './actions';
import styles from './page.module.css';

// useSearchParams obriga uma fronteira de Suspense: sem ela o Next não
// consegue pré-renderizar a página e o build falha.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.wrap} />}>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const [estado, formAction, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  // o proxy manda para cá com ?erro=sem-permissao quando a conta existe mas não
  // está na lista de administradores; sem este aviso a pessoa só via a tela
  // recarregar sem explicação
  const semPermissao = useSearchParams().get('erro') === 'sem-permissao';

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Image
            src="/logos/logo-horizontal-azul.png"
            alt="Esquematiza Aí"
            width={190}
            height={50}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h1 className={styles.title}>Painel de conteúdo</h1>
        <p className={styles.subtitle}>Entre para gerenciar o blog do Esquematiza Aí.</p>

        <form action={formAction} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>E-mail</span>
            <input
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="voce@email.com"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Senha</span>
            <input
              className={styles.input}
              type="password"
              name="senha"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
            />
          </label>

          {semPermissao && !estado.erro && (
            <p className={styles.erro}>
              Esta conta não tem acesso ao painel. Fale com o Pedro para liberar.
            </p>
          )}
          {estado.erro && <p className={styles.erro}>{estado.erro}</p>}

          <button type="submit" className={styles.btn} disabled={pendente}>
            {pendente ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
