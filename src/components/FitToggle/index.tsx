'use client';

import { useState } from 'react';
import styles from './styles.module.css';

type Item = { title: string; desc: string };

const DATA: Record<'yes' | 'no', Item[]> = {
  yes: [
    { title: 'Rotina apertada', desc: 'Trabalha quarenta horas por semana, tem de duas a três horas líquidas por dia e precisa que cada hora renda o triplo.' },
    { title: 'Travou e não evolui', desc: 'Já estuda há anos, conhece a rotina, mas empacou numa faixa de acerto e não consegue mais avançar sozinho.' },
    { title: 'Começando do zero', desc: 'Vem de Direito, Contábeis, Economia ou de qualquer outra formação e quer começar certo desde o primeiro dia.' },
    { title: 'Quer o salto', desc: 'Já é servidor de uma carreira menor ou militar e quer dar o salto para uma vaga fiscal ou de controle de R$ 20 mil.' },
    { title: 'Mira fiscal ou controle', desc: 'De SEFAZ, ISS e Receita, ou TCEs, TCU, CGU, CGEs e CGMs, com um plano ajustado à banca de cada um.' },
  ],
  no: [
    { title: 'Procura atalho', desc: 'Não aceita de doze a vinte e quatro meses de estudo com disciplina e quer um caminho mágico.' },
    { title: 'Quer ir sozinho', desc: 'Prefere estudar totalmente por conta própria, sem plano individual e sem mentor acompanhando.' },
    { title: 'Só quer material', desc: 'Quer apenas comprar conteúdo e não vai abrir a plataforma nem seguir as metas combinadas.' },
    { title: 'Sem tempo mínimo', desc: 'Não consegue reservar pelo menos duas a três horas de estudo na maioria dos dias.' },
  ],
};

export default function FitToggle() {
  const [active, setActive] = useState<'yes' | 'no'>('yes');
  const [shown, setShown] = useState<'yes' | 'no'>('yes');
  const [exiting, setExiting] = useState(false);

  const select = (next: 'yes' | 'no') => {
    if (next === active || exiting) return;
    setActive(next); // a pílula desliza imediatamente
    setExiting(true); // fade-out da lista atual
    window.setTimeout(() => {
      setShown(next); // troca o conteúdo
      setExiting(false); // entra com fade + slide-up (remonta via key)
    }, 160);
  };

  const items = DATA[shown];

  return (
    <div className={styles.wrap}>
      <div className={styles.toggle} role="tablist" aria-label="Filtrar perfil">
        <span
          className={`${styles.slider} ${active === 'no' ? styles.sliderRight : ''}`}
          aria-hidden="true"
        />
        <button
          type="button"
          role="tab"
          aria-selected={active === 'yes'}
          className={`${styles.opt} ${active === 'yes' ? styles.optActive : ''}`}
          onClick={() => select('yes')}
        >
          Para quem é
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'no'}
          className={`${styles.opt} ${active === 'no' ? styles.optActive : ''}`}
          onClick={() => select('no')}
        >
          Para quem não é
        </button>
      </div>

      <ul key={shown} className={`${styles.list} ${exiting ? styles.listExit : ''}`}>
        {items.map((it, i) => (
          <li key={it.title} className={styles.item} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={styles.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className={styles.body}>
              <h3 className={styles.itemTitle}>{it.title}</h3>
              <p className={styles.itemDesc}>{it.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
