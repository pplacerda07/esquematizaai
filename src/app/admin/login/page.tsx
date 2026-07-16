'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { entrar, type EstadoLogin } from './actions';
import styles from './page.module.css';

export default function LoginPage() {
  const [estado, formAction, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});

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

          {estado.erro && <p className={styles.erro}>{estado.erro}</p>}

          <button type="submit" className={styles.btn} disabled={pendente}>
            {pendente ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
