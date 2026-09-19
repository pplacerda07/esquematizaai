'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Funcao } from '@/lib/supabase/admin-guard';
import styles from './botao-criar.module.css';

/**
 * O botão de criar, flutuante, no canto de baixo à direita.
 *
 * DUAS COISAS ACONTECERAM AQUI DE UMA VEZ.
 *
 * A primeira: neste exato canto vivia o botão do WhatsApp do site, que é o
 * suporte ao ALUNO. Ele vinha do layout raiz e ninguém tinha percebido que
 * aparecia também dentro do painel da equipe. Quem trabalha aqui não precisa
 * falar com o suporte, e o botão ocupava o lugar mais valioso da tela.
 *
 * A segunda: o botão de criar morava no cabeçalho de cada tela, colado embaixo
 * do subtítulo, e cada tela tinha o seu, com nome diferente ("Novo material",
 * "Nova disciplina", "Nova notícia"). Quem chegava no painel não sabia por onde
 * começar.
 *
 * Agora é um só, no mesmo canto em todas as telas, e ele oferece o que a pessoa
 * PODE criar: quem só cuida de produto não vê "novo post". A lista vem dos
 * papéis do banco, não de um palpite do navegador.
 */

type Opcao = { rotulo: string; descricao: string; href: string; funcao: Funcao };

const OPCOES: Opcao[] = [
  { rotulo: 'Material', descricao: 'um produto para a vitrine', href: '/admin/materiais?novo=1', funcao: 'produtos' },
  { rotulo: 'Sumário', descricao: 'disciplinas de um material', href: '/admin/sumarios?novo=1', funcao: 'produtos' },
  { rotulo: 'Curso', descricao: 'agrupa disciplinas por concurso', href: '/admin/cursos', funcao: 'produtos' },
  { rotulo: 'Post do blog', descricao: 'artigo do blog', href: '/admin/blog?novo=1', funcao: 'blog' },
  { rotulo: 'Notícia', descricao: 'notícia de concurso', href: '/admin/noticias?novo=1', funcao: 'blog' },
];

const CHAVE_DA_DICA = 'esquematiza:admin:ja-viu-o-botao-criar';

export default function BotaoCriar({ funcoes }: { funcoes: Funcao[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const opcoes = OPCOES.filter((o) => funcoes.includes(o.funcao));

  /**
   * A dica aparece uma vez por navegador, na primeira visita.
   *
   * Sem ela o botão é só um círculo laranja num canto, e quem entra pela
   * primeira vez não liga uma coisa à outra. Com ela, some no primeiro clique e
   * não volta: aviso que reaparece toda visita vira barulho, e a pessoa aprende
   * a ignorar justamente o canto onde mora a ação principal.
   *
   * localStorage pode estar bloqueado (aba anônima, cookies desligados). Nesse
   * caso a dica simplesmente não aparece, que é melhor que a tela quebrar.
   */
  useEffect(() => {
    if (opcoes.length === 0) return;
    try {
      if (!localStorage.getItem(CHAVE_DA_DICA)) setMostrarDica(true);
    } catch {
      /* sem localStorage: segue sem a dica */
    }
  }, [opcoes.length]);

  function esconderDica() {
    setMostrarDica(false);
    try {
      localStorage.setItem(CHAVE_DA_DICA, '1');
    } catch {
      /* sem localStorage: a dica volta na próxima visita, e tudo bem */
    }
  }

  // clicar fora e a tecla Esc fecham o menu, que é o que todo mundo já espera
  useEffect(() => {
    if (!aberto) return;
    const foraDaCaixa = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('mousedown', foraDaCaixa);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', foraDaCaixa);
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);

  // conta sem papel nenhum não tem o que criar, e um botão que não faz nada é
  // pior que botão nenhum
  if (opcoes.length === 0) return null;

  const rotulosCurtos = opcoes.map((o) => o.rotulo.toLowerCase().replace(' do blog', ''));
  const textoDaDica =
    rotulosCurtos.length > 1
      ? `Adicione ${rotulosCurtos.slice(0, -1).join(', ')} ou ${rotulosCurtos.at(-1)}`
      : `Adicione ${rotulosCurtos[0]}`;

  return (
    <div className={styles.canto} ref={caixa}>
      {mostrarDica && !aberto && (
        <div className={styles.dica} role="status">
          <span>{textoDaDica}</span>
          <button
            type="button"
            className={styles.fecharDica}
            onClick={esconderDica}
            aria-label="Entendi, fechar a dica"
          >
            ×
          </button>
        </div>
      )}

      {aberto && (
        <div className={styles.menu} role="menu">
          {opcoes.map((o) => (
            <button
              key={o.href}
              type="button"
              role="menuitem"
              className={styles.opcao}
              onClick={() => {
                setAberto(false);
                esconderDica();
                router.push(o.href);
              }}
            >
              <span className={styles.opcaoRotulo}>{o.rotulo}</span>
              <span className={styles.opcaoDescricao}>{o.descricao}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`${styles.botao} ${mostrarDica && !aberto ? styles.chamandoAtencao : ''}`}
        onClick={() => {
          setAberto((v) => !v);
          esconderDica();
        }}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label={aberto ? 'Fechar o menu de criar' : 'Criar'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
