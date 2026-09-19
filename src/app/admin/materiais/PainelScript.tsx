'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { conferirScript, gravarScript, type ConferenciaDoScript } from './actions';
import CapaUpload from './CapaUpload';
import styles from './script.module.css';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Trabalhar por script: exportar o modelo, colar o preenchido, conferir, gravar.
 *
 * O Sérgio usa Claude para tudo e não gosta de preencher formulário. O caminho
 * é: ele pega o modelo aqui, manda para o Claude dele, cola o preenchido de
 * volta, VÊ o que vai virar, e só então grava.
 *
 * O formulário manual continua existindo ao lado, intacto. Isto é adição.
 *
 * DOIS CAMINHOS DIFERENTES DE PROPÓSITO: o modelo de um produto tem 2 KB e vai
 * COPIADO, porque veio de um chat e volta para um chat. A loja inteira tem 148
 * materiais e BAIXA como arquivo, porque ninguém cola isso numa conversa.
 */
export default function PainelScript({
  modelo,
  exportacao,
  hoje,
  quantosMateriais,
}: {
  modelo: string;
  exportacao: string;
  /** data de hoje, ja formatada no servidor, para o nome do arquivo */
  hoje: string;
  quantosMateriais: number;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [conferencia, setConferencia] = useState<ConferenciaDoScript | null>(null);
  const [copiado, setCopiado] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [trabalhando, iniciar] = useTransition();

  async function copiar(oQue: string, rotulo: string) {
    try {
      await navigator.clipboard.writeText(oQue);
      setCopiado(rotulo);
      setTimeout(() => setCopiado(''), 2500);
    } catch {
      // navegador sem permissão de área de transferência: mostra numa caixa
      // para a pessoa copiar à mão, em vez de não acontecer nada
      window.prompt('Copie o texto abaixo:', oQue);
    }
  }

  /**
   * A loja inteira baixa como arquivo, não vai para a área de transferência.
   *
   * São 148 materiais, uns 18 KB. Ninguém cola isso num chat: anexa. O modelo
   * de UM produto continua indo copiado, porque tem 2 KB e vai direto na
   * conversa.
   */
  function baixar(conteudo: string, nomeDoArquivo: string) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeDoArquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // solta a memória do Blob; sem isso o arquivo fica pendurado até recarregar
    URL.revokeObjectURL(url);
  }

  return (
    <section className={styles.caixa}>
      <div className={styles.topo}>
        <div>
          <h2 className={styles.titulo}>Trabalhar por script</h2>
          <p className={styles.subtitulo}>
            Pegue o modelo, peça ao seu Claude para preencher e cole aqui. Você confere antes de
            gravar.
          </p>
        </div>
        <button
          type="button"
          className={styles.btnAbrir}
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
        >
          {aberto ? 'Fechar' : 'Abrir'}
        </button>
      </div>

      {aberto && (
        <div className={styles.corpo}>
          <div className={styles.botoes}>
            <button type="button" className={styles.btnSec} onClick={() => copiar(modelo, 'modelo')}>
              {copiado === 'modelo' ? 'Modelo copiado' : 'Copiar modelo de um produto'}
            </button>
            <button
              type="button"
              className={styles.btnSec}
              onClick={() => baixar(exportacao, `esquematiza-loja-${hoje}.txt`)}
            >
              Baixar a loja inteira ({quantosMateriais} materiais)
            </button>
          </div>

          <p className={styles.aviso}>
            O modelo vai copiado, para você colar direto na conversa. A loja inteira{' '}
            <strong>baixa como arquivo</strong>, porque são {quantosMateriais} materiais e ninguém
            cola isso num chat: anexe o arquivo. Ele serve para consultar e não volta para cá.
          </p>

          <label className={styles.campo}>
            <span className={styles.rotulo}>Cole aqui o script preenchido</span>
            <textarea
              className={styles.area}
              rows={10}
              value={texto}
              placeholder={'modelo: 1\nnome: Resumo Direito Ambiental\ntipo: isolado\npreco: 197\ncheckout: ...'}
              onChange={(e) => {
                setTexto(e.target.value);
                setConferencia(null);
                setSucesso('');
              }}
            />
          </label>

          <div className={styles.acoes}>
            <button
              type="button"
              className={styles.btnSec}
              disabled={!texto.trim() || trabalhando}
              onClick={() => {
                setSucesso('');
                iniciar(async () => setConferencia(await conferirScript(texto)));
              }}
            >
              {trabalhando && !conferencia ? 'Conferindo...' : 'Conferir'}
            </button>

          </div>

          {sucesso && <p className={styles.sucesso}>{sucesso}</p>}

          {conferencia && !conferencia.ok && (
            <div className={styles.erros}>
              <p className={styles.errosTitulo}>
                {conferencia.erros.length === 1
                  ? 'Uma coisa precisa mudar:'
                  : `${conferencia.erros.length} coisas precisam mudar:`}
              </p>
              <ul className={styles.listaErros}>
                {conferencia.erros.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
              {/* Copiar os erros existe porque o conserto acontece noutro lugar:
                  ele leva isto de volta ao chat e pede para refazer. */}
              <button
                type="button"
                className={styles.btnSec}
                onClick={() =>
                  copiar(
                    'Corrija o script de produto. Problemas:\n' +
                      conferencia.erros.map((e) => '- ' + e).join('\n'),
                    'erros',
                  )
                }
              >
                {copiado === 'erros' ? 'Erros copiados' : 'Copiar os erros para o chat'}
              </button>
            </div>
          )}

          {conferencia?.ok && conferencia.campos && (
            /* A conferência é um formulário, e não uma caixa com um botão, para
               a capa entrar NA MESMA GRAVAÇÃO. Antes ela vinha num segundo
               passo, na lista, e o Sérgio precisaria cadastrar, procurar o
               material e só então pôr a imagem: três viagens para uma tarefa.

               O texto do script vai num campo escondido junto, e o servidor o
               relê do zero. Nada do que a tela mostra é usado para gravar. */
            <form
              className={styles.conferencia}
              action={(fd) => {
                iniciar(async () => {
                  const r = await gravarScript(fd);
                  if (!r.ok) {
                    setConferencia({ ok: false, erros: [r.erro ?? 'Falhou.'], avisos: [] });
                    return;
                  }
                  setSucesso(
                    `"${conferencia.campos?.nome}" foi cadastrado. Aparece na vitrine em até 1 minuto.`,
                  );
                  setTexto('');
                  setConferencia(null);
                  router.refresh();
                });
              }}
            >
              <input type="hidden" name="script" value={texto} />
              <p className={styles.conferenciaTitulo}>O produto vai ficar assim:</p>
              <dl className={styles.tabela}>
                <Linha rotulo="Nome" valor={conferencia.campos.nome} />
                <Linha rotulo="Tipo" valor={conferencia.campos.tipo} />
                <Linha
                  rotulo="Preço"
                  valor={
                    brl.format(conferencia.campos.preco) +
                    (conferencia.campos.precoDe
                      ? `, riscando ${brl.format(conferencia.campos.precoDe)}`
                      : '')
                  }
                />
                <Linha rotulo="Área" valor={conferencia.campos.area ?? 'sem área'} />
                <Linha rotulo="Ferramenta" valor={conferencia.campos.ferramenta ?? 'não informada'} />
                <Linha rotulo="Formato" valor={conferencia.campos.formato ?? 'não informado'} />
                <Linha
                  rotulo="Botão de comprar leva para"
                  valor={conferencia.campos.checkout ?? conferencia.campos.paginaDeVendas ?? ''}
                />
                <Linha
                  rotulo="Endereço da página"
                  valor={`/vitrine/produto/${conferencia.campos.endereco}`}
                  nota={
                    conferencia.campos.enderecoVeioDoNome
                      ? 'saiu do nome, e não muda depois de gravar'
                      : 'veio escrito no script, e não muda depois de gravar'
                  }
                />
                <Linha
                  rotulo="Descrição"
                  valor={conferencia.campos.descricao ?? 'sem descrição'}
                />
              </dl>

              {conferencia.avisos.length > 0 && (
                <ul className={styles.listaAvisos}>
                  {conferencia.avisos.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}

              {/* A capa aqui e não depois: é a última coisa que falta antes de
                  o material existir, e o Sérgio escolhe a imagem olhando para o
                  nome e o preço que acabou de conferir. */}
              <div className={styles.capaNaConferencia}>
                <CapaUpload />
              </div>

              <div className={styles.acoes}>
                <button type="submit" className={styles.btnPrim} disabled={trabalhando}>
                  {trabalhando ? 'Gravando...' : 'Gravar este material'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

function Linha({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <>
      <dt className={styles.chave}>{rotulo}</dt>
      <dd className={styles.valor}>
        {valor}
        {nota && <span className={styles.nota}>{nota}</span>}
      </dd>
    </>
  );
}
