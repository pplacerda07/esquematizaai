'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { enviarCapa } from './actions';
import styles from './capa.module.css';

/**
 * Escolher e enviar a capa do material.
 *
 * FEITO PARA SERVIR O BLOG TAMBÉM. A tabela posts já tem capa_url desde sempre e
 * nunca teve por onde mandar arquivo; quando chegar a vez dela, é este mesmo
 * componente com `pasta="blog"`.
 *
 * O envio acontece na hora de escolher, não no salvar. Assim a pessoa vê a
 * imagem antes de gravar o resto, e descobre um arquivo pesado ou de formato
 * errado enquanto ainda está montando o cadastro, e não depois de preencher
 * tudo.
 *
 * A URL e as medidas viajam em campos escondidos: o formulário de fora só
 * precisa enviá-los junto, sem saber nada de upload.
 */
export default function CapaUpload({ pasta = 'produtos' }: { pasta?: 'produtos' | 'blog' }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [medida, setMedida] = useState<{ largura: number | null; altura: number | null }>({
    largura: null,
    altura: null,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro(null);
    const fd = new FormData();
    fd.set('imagem', arquivo);
    fd.set('pasta', pasta);

    iniciar(async () => {
      const r = await enviarCapa(fd);
      if (r.ok) {
        setUrl(r.url);
        setMedida({ largura: r.largura, altura: r.altura });
      } else {
        setErro(r.erro);
        setUrl('');
      }
    });
  }

  return (
    <div className={styles.bloco}>
      <span className={styles.rotulo}>Capa</span>

      <div className={styles.area}>
        {url ? (
          <div className={styles.previa}>
            <Image
              src={url}
              alt="Capa escolhida"
              width={medida.largura ?? 452}
              height={medida.altura ?? 640}
              className={styles.imagem}
              unoptimized
            />
          </div>
        ) : (
          <div className={styles.vazio} aria-hidden="true">
            sem capa
          </div>
        )}

        <div className={styles.controles}>
          <input
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={escolher}
            className={styles.arquivo}
            id="capa-arquivo"
          />
          <label htmlFor="capa-arquivo" className={styles.botao}>
            {enviando ? 'Enviando...' : url ? 'Trocar imagem' : 'Escolher imagem'}
          </label>

          {url && (
            <button
              type="button"
              className={styles.remover}
              onClick={() => {
                setUrl('');
                setMedida({ largura: null, altura: null });
                if (entrada.current) entrada.current.value = '';
              }}
            >
              Remover
            </button>
          )}

          <p className={styles.dica}>
            JPG, PNG, WebP ou AVIF, até 5 MB. As capas de hoje são retratos, tipo 452 por 640.
            {url && medida.largura ? ` Esta tem ${medida.largura} por ${medida.altura}.` : ''}
          </p>

          {erro && <p className={styles.erro}>{erro}</p>}
        </div>
      </div>

      <input type="hidden" name="capa_url" value={url} />
      <input type="hidden" name="capa_largura" value={medida.largura ?? ''} />
      <input type="hidden" name="capa_altura" value={medida.altura ?? ''} />
    </div>
  );
}
