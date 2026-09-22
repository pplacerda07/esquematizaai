'use client';

import { useState, useTransition } from 'react';
import type { Funcao } from '@/lib/supabase/admin-guard';
import { criarAcesso, mudarFuncoes, tirarAcesso, trocarSenha, type Resultado } from './actions';
import styles from './page.module.css';

export type Acesso = {
  userId: string;
  email: string;
  funcoes: Funcao[];
  criadoEm: string;
  ultimoAcesso: string | null;
};

/**
 * O que cada papel abre, escrito do jeito que a pessoa vê no menu.
 *
 * "produtos" e "blog" não dizem nada para quem não montou o banco. Quem está
 * dando acesso pensa em "ela vai mexer nos materiais" e "ela escreve no blog",
 * e é assim que a tela pergunta.
 */
const PAPEIS: { id: Funcao; titulo: string; descricao: string }[] = [
  { id: 'produtos', titulo: 'Materiais e cursos', descricao: 'Cadastrar e ajustar material, sumário e curso' },
  { id: 'blog', titulo: 'Blog e notícias', descricao: 'Escrever e publicar post e notícia' },
  { id: 'dono', titulo: 'Quem entra no painel', descricao: 'Criar e tirar acesso das outras pessoas. Dê só a sócio' },
];

const ROTULO_CURTO: Record<Funcao, string> = {
  produtos: 'Materiais',
  blog: 'Blog',
  dono: 'Dono',
};

const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  // fuso fixo para o servidor e o navegador escreverem a mesma data: sem isso
  // o React reclama de conteúdo diferente entre os dois na hora de montar
  timeZone: 'America/Sao_Paulo',
});

function data(iso: string | null): string {
  if (!iso) return 'nunca entrou';
  return FORMATO_DATA.format(new Date(iso));
}

/**
 * Senha sorteada no navegador, sem passar por nós.
 *
 * O alfabeto não tem O, 0, I, l nem 1: essa senha vai ser lida em voz alta ou
 * copiada de uma mensagem, e confundir zero com ó é o jeito mais comum de
 * alguém achar que a senha está errada quando não está.
 */
function sortearSenha(): string {
  const alfabeto = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const sorteio = new Uint32Array(14);
  crypto.getRandomValues(sorteio);
  return Array.from(sorteio, (n) => alfabeto[n % alfabeto.length]).join('');
}

export default function Gerenciador({
  acessos,
  meuUserId,
  abrirNovo,
}: {
  acessos: Acesso[];
  meuUserId: string;
  abrirNovo: boolean;
}) {
  const [criando, setCriando] = useState(abrirNovo);
  const [aberto, setAberto] = useState<string | null>(null);
  const [recado, setRecado] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [salvando, comecar] = useTransition();

  function responder(r: Resultado, sucesso: string) {
    if (r.ok) {
      setRecado({ tipo: 'ok', texto: r.aviso ?? sucesso });
    } else {
      setRecado({ tipo: 'erro', texto: r.erro });
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Quem entra no painel</h1>
          <p className={styles.subtitulo}>
            {acessos.length} {acessos.length === 1 ? 'pessoa' : 'pessoas'} com acesso hoje
          </p>
        </div>
        <button type="button" className={styles.novo} onClick={() => setCriando((v) => !v)}>
          {criando ? 'Fechar' : 'Dar acesso a alguém'}
        </button>
      </header>

      <p className={styles.explicacao}>
        O site ainda não envia e-mail, então a senha é escolhida aqui e passada para a pessoa por
        fora, no WhatsApp ou pessoalmente. Peça para ela trocar depois de entrar. Tirar o acesso não
        apaga a conta: ela deixa de abrir o painel, e o histórico do que ela fez continua.
      </p>

      {recado && (
        <p className={recado.tipo === 'ok' ? styles.sucesso : styles.erro} role="status">
          {recado.texto}
        </p>
      )}

      {criando && (
        <FormularioNovo
          salvando={salvando}
          aoEnviar={(formData) =>
            comecar(async () => {
              const r = await criarAcesso(formData);
              responder(r, 'Acesso criado. Passe a senha para a pessoa.');
              if (r.ok) setCriando(false);
            })
          }
        />
      )}

      <ul className={styles.lista}>
        {acessos.map((a) => {
          const souEu = a.userId === meuUserId;
          const expandido = aberto === a.userId;

          return (
            <li key={a.userId} className={styles.item}>
              <button
                type="button"
                className={styles.abrir}
                onClick={() => setAberto(expandido ? null : a.userId)}
                aria-expanded={expandido}
              >
                <span className={styles.email}>
                  {a.email}
                  {souEu && <span className={styles.voce}>você</span>}
                </span>
                <span className={styles.marcas}>
                  {a.funcoes.map((f) => (
                    <span key={f} className={`${styles.marca} ${f === 'dono' ? styles.marcaDono : ''}`}>
                      {ROTULO_CURTO[f]}
                    </span>
                  ))}
                </span>
                <span className={styles.medida}>último acesso: {data(a.ultimoAcesso)}</span>
                <span className={styles.seta} aria-hidden="true">
                  {expandido ? '▲' : '▼'}
                </span>
              </button>

              {expandido && (
                <LinhaAberta
                  acesso={a}
                  souEu={souEu}
                  salvando={salvando}
                  aoMudarFuncoes={(formData) =>
                    comecar(async () => {
                      responder(await mudarFuncoes(formData), `Pronto. ${a.email} teve o acesso alterado.`);
                    })
                  }
                  aoTrocarSenha={(formData) =>
                    comecar(async () => {
                      responder(await trocarSenha(formData), `Senha de ${a.email} trocada. Passe a nova para ela.`);
                    })
                  }
                  aoTirar={(formData) =>
                    comecar(async () => {
                      const r = await tirarAcesso(formData);
                      responder(r, `${a.email} não entra mais no painel.`);
                      if (r.ok) setAberto(null);
                    })
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- criar */

function FormularioNovo({
  salvando,
  aoEnviar,
}: {
  salvando: boolean;
  aoEnviar: (formData: FormData) => void;
}) {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form className={styles.editor} action={aoEnviar}>
      <label className={styles.rotulo} htmlFor="novo-email">
        E-mail da pessoa
      </label>
      <input
        id="novo-email"
        name="email"
        type="email"
        required
        autoComplete="off"
        className={styles.input}
        placeholder="nome@esquematizaai.com"
      />

      <span className={styles.rotulo}>O que ela pode fazer</span>
      <div className={styles.papeis}>
        {PAPEIS.map((p) => (
          <label key={p.id} className={styles.papel}>
            <input type="checkbox" name="funcoes" value={p.id} defaultChecked={p.id === 'produtos'} />
            <span>
              <strong>{p.titulo}</strong>
              <em>{p.descricao}</em>
            </span>
          </label>
        ))}
      </div>

      <label className={styles.rotulo} htmlFor="nova-senha">
        Senha para ela entrar
      </label>
      <div className={styles.linhaSenha}>
        <input
          id="nova-senha"
          name="senha"
          type={mostrarSenha ? 'text' : 'password'}
          required
          minLength={10}
          autoComplete="new-password"
          className={styles.input}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="button" className={styles.secundario} onClick={() => setMostrarSenha((v) => !v)}>
          {mostrarSenha ? 'Esconder' : 'Ver'}
        </button>
        <button
          type="button"
          className={styles.secundario}
          onClick={() => {
            setSenha(sortearSenha());
            setMostrarSenha(true);
          }}
        >
          Sortear
        </button>
      </div>
      <p className={styles.ajuda}>
        Pelo menos 10 caracteres. Copie antes de salvar: esta tela não mostra a senha de novo depois.
      </p>

      <div className={styles.acoes}>
        <button type="submit" className={styles.salvar} disabled={salvando}>
          {salvando ? 'Criando...' : 'Criar acesso'}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- linha */

function LinhaAberta({
  acesso,
  souEu,
  salvando,
  aoMudarFuncoes,
  aoTrocarSenha,
  aoTirar,
}: {
  acesso: Acesso;
  souEu: boolean;
  salvando: boolean;
  aoMudarFuncoes: (formData: FormData) => void;
  aoTrocarSenha: (formData: FormData) => void;
  aoTirar: (formData: FormData) => void;
}) {
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [senha, setSenha] = useState('');

  return (
    <div className={styles.editor}>
      <form action={aoMudarFuncoes}>
        <input type="hidden" name="user_id" value={acesso.userId} />
        <span className={styles.rotulo}>O que essa pessoa pode fazer</span>
        <div className={styles.papeis}>
          {PAPEIS.map((p) => (
            <label key={p.id} className={styles.papel}>
              <input
                type="checkbox"
                name="funcoes"
                value={p.id}
                defaultChecked={acesso.funcoes.includes(p.id)}
              />
              <span>
                <strong>{p.titulo}</strong>
                <em>{p.descricao}</em>
              </span>
            </label>
          ))}
        </div>
        <div className={styles.acoes}>
          <button type="submit" className={styles.salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <span className={styles.medida}>no painel desde {data(acesso.criadoEm)}</span>
        </div>
      </form>

      <div className={styles.rodape}>
        {trocandoSenha ? (
          <form action={aoTrocarSenha} className={styles.linhaSenha}>
            <input type="hidden" name="user_id" value={acesso.userId} />
            <input
              name="senha"
              type="text"
              required
              minLength={10}
              autoComplete="new-password"
              className={styles.input}
              placeholder="senha nova"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button type="button" className={styles.secundario} onClick={() => setSenha(sortearSenha())}>
              Sortear
            </button>
            <button type="submit" className={styles.salvar} disabled={salvando}>
              Trocar
            </button>
            <button type="button" className={styles.secundario} onClick={() => setTrocandoSenha(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className={styles.secundario} onClick={() => setTrocandoSenha(true)}>
            Trocar senha
          </button>
        )}

        {/* O próprio acesso não tem botão de sair: o banco recusa de todo jeito,
            e um botão que sempre dá erro só ensina a desconfiar da tela. */}
        {souEu ? (
          <span className={styles.medida}>
            Você não tira o próprio acesso. Peça ao outro dono se precisar.
          </span>
        ) : confirmandoSaida ? (
          <form action={aoTirar} className={styles.linhaSenha}>
            <input type="hidden" name="user_id" value={acesso.userId} />
            <span className={styles.medida}>Tirar {acesso.email} do painel?</span>
            <button type="submit" className={styles.perigo} disabled={salvando}>
              Confirmar
            </button>
            <button type="button" className={styles.secundario} onClick={() => setConfirmandoSaida(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className={styles.secundario} onClick={() => setConfirmandoSaida(true)}>
            Tirar acesso
          </button>
        )}
      </div>
    </div>
  );
}
