'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { salvarAjuste, limparAjuste } from './actions';
import styles from './page.module.css';

export type ItemAdmin = {
  id: string;
  nome: string;
  categoria: string;
  area: string | null;
  ferramenta: string | null;
  precoPlanilha: number | null;
  precoAjustado: number | null;
  temCheckout: boolean;
  vendavel: boolean;
  descricaoAjustada: string | null;
  observacao: string | null;
  oculto: boolean;
  destaque: boolean;
  ajustadoEm: string | null;
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const SEGMENTOS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'combo', rotulo: 'Combos' },
  { valor: 'isolado', rotulo: 'Isolados' },
  { valor: 'assinatura', rotulo: 'Assinaturas' },
];

function normalizar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Gerenciador({ itens }: { itens: ItemAdmin[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [segmento, setSegmento] = useState('todos');
  const [soAjustados, setSoAjustados] = useState(false);
  const [editando, setEditando] = useState<ItemAdmin | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, iniciar] = useTransition();

  const foiAjustado = (i: ItemAdmin) =>
    i.precoAjustado !== null || i.descricaoAjustada !== null || i.oculto || i.destaque;

  const lista = useMemo(() => {
    const termo = normalizar(busca.trim());
    return itens.filter((i) => {
      if (segmento !== 'todos' && i.categoria !== segmento) return false;
      if (soAjustados && !foiAjustado(i)) return false;
      if (termo && !normalizar(i.nome).includes(termo)) return false;
      return true;
    });
  }, [itens, busca, segmento, soAjustados]);

  const totalAjustados = itens.filter(foiAjustado).length;
  const totalOcultos = itens.filter((i) => i.oculto).length;

  const salvar = (formData: FormData) => {
    setErro('');
    iniciar(async () => {
      const r = await salvarAjuste(formData);
      if (!r.ok) { setErro(r.erro ?? 'Não foi possível salvar.'); return; }
      setEditando(null);
      router.refresh();
    });
  };

  const restaurar = (i: ItemAdmin) => {
    if (!confirm(`Desfazer os ajustes de "${i.nome}" e voltar ao que a planilha diz?`)) return;
    iniciar(async () => {
      await limparAjuste(i.id);
      setEditando(null);
      router.refresh();
    });
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Materiais</h1>
          <p className={styles.subtitulo}>
            {itens.length} produtos do catálogo. {totalAjustados} com ajuste, {totalOcultos} ocultos.
          </p>
        </div>
      </header>

      {/* Recado que evita o mal-entendido mais caro desta tela: achar que
          editar aqui muda a planilha, ou que a planilha vai apagar o ajuste. */}
      <p className={styles.dica}>
        O catálogo vem da planilha do Sérgio. O que você mudar aqui vira um ajuste que fica
        <strong> por cima</strong> dela: reimportar a planilha não apaga o que foi editado, e
        &quot;Voltar ao valor da planilha&quot; desfaz o ajuste a qualquer momento.
      </p>

      <div className={styles.filtros}>
        <input
          className={styles.busca}
          type="search"
          placeholder="Buscar pelo nome do material..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className={styles.chips}>
          {SEGMENTOS.map((s) => (
            <button
              key={s.valor}
              type="button"
              className={`${styles.chip} ${segmento === s.valor ? styles.chipAtivo : ''}`}
              onClick={() => setSegmento(s.valor)}
            >
              {s.rotulo}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.chip} ${soAjustados ? styles.chipAtivo : ''}`}
            onClick={() => setSoAjustados((v) => !v)}
          >
            Só os ajustados
          </button>
        </div>
      </div>

      {editando && (
        <form action={salvar} className={styles.formulario}>
          <input type="hidden" name="produto_id" value={editando.id} />
          <h2 className={styles.formTitulo}>{editando.nome}</h2>
          <p className={styles.formId}>{editando.id}</p>

          <div className={styles.linha}>
            <label className={styles.campo}>
              <span className={styles.rotulo}>
                Preço{' '}
                <em className={styles.ajuda}>
                  planilha: {editando.precoPlanilha !== null ? brl.format(editando.precoPlanilha) : 'sem preço'}
                </em>
              </span>
              <input
                className={styles.input}
                name="preco"
                defaultValue={editando.precoAjustado ?? ''}
                placeholder="deixe vazio para usar o da planilha"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.rotulo}>Exibição</span>
              <label className={styles.check}>
                <input type="checkbox" name="destaque" defaultChecked={editando.destaque} />
                Destacar na vitrine
              </label>
              <label className={styles.check}>
                <input type="checkbox" name="oculto" defaultChecked={editando.oculto} />
                Ocultar do site
              </label>
            </div>
          </div>

          <label className={styles.campo}>
            <span className={styles.rotulo}>
              Descrição <em className={styles.ajuda}>vazio = usa a da página de vendas</em>
            </span>
            <textarea
              className={styles.textarea}
              name="descricao"
              rows={4}
              defaultValue={editando.descricaoAjustada ?? ''}
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.rotulo}>
              Observação interna <em className={styles.ajuda}>não aparece no site</em>
            </span>
            <input
              className={styles.input}
              name="observacao"
              defaultValue={editando.observacao ?? ''}
              placeholder="ex.: preço combinado com o Sérgio em 30/07"
            />
          </label>

          {erro && <p className={styles.erro}>{erro}</p>}

          <div className={styles.acoesForm}>
            <button type="submit" className={styles.btnPrimario} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar ajuste'}
            </button>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={() => { setEditando(null); setErro(''); }}
              disabled={salvando}
            >
              Cancelar
            </button>
            {foiAjustado(editando) && (
              <button
                type="button"
                className={styles.btnRestaurar}
                onClick={() => restaurar(editando)}
                disabled={salvando}
              >
                Voltar ao valor da planilha
              </button>
            )}
          </div>
        </form>
      )}

      <p className={styles.contador}>{lista.length} de {itens.length}</p>

      <div className={styles.lista}>
        {lista.map((i) => (
          <article key={i.id} className={`${styles.item} ${i.oculto ? styles.itemOculto : ''}`}>
            <div className={styles.itemTexto}>
              <div className={styles.itemTopo}>
                <span className={styles.selo}>{i.categoria}</span>
                {i.area && <span className={styles.seloArea}>{i.area}</span>}
                {i.destaque && <span className={styles.seloDestaque}>Destaque</span>}
                {i.oculto && <span className={styles.seloOculto}>Oculto</span>}
                {!i.vendavel && <span className={styles.seloAlerta}>Sem destino de compra</span>}
                {!i.temCheckout && i.vendavel && (
                  <span className={styles.seloNeutro}>Vende pela loja</span>
                )}
              </div>

              <h2 className={styles.itemTitulo}>{i.nome}</h2>

              <p className={styles.itemPreco}>
                {i.precoAjustado !== null ? (
                  <>
                    <span className={styles.precoNovo}>{brl.format(i.precoAjustado)}</span>
                    <span className={styles.precoAntigo}>
                      planilha: {i.precoPlanilha !== null ? brl.format(i.precoPlanilha) : '—'}
                    </span>
                  </>
                ) : (
                  <span className={styles.precoNovo}>
                    {i.precoPlanilha !== null ? brl.format(i.precoPlanilha) : 'sem preço'}
                  </span>
                )}
              </p>

              {i.observacao && <p className={styles.itemObs}>{i.observacao}</p>}
            </div>

            <div className={styles.itemAcoes}>
              <button type="button" className={styles.btnLinha} onClick={() => { setEditando(i); setErro(''); }}>
                Ajustar
              </button>
              <a
                className={styles.btnLinha}
                href={`/vitrine/produto/${i.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver no site
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
