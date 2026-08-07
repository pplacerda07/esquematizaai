'use client';

import { useEffect, useState } from 'react';

// A chave mudou de nome junto com a duração. Quem visitou o site antes tem no
// navegador um prazo de até 8 horas à frente; lido pelo relógio novo, que mostra
// minutos e segundos, aquilo viraria algo como "437:12". Chave nova ignora o
// valor velho sem precisar limpar nada na máquina de ninguém.
const STORAGE_KEY = 'esquematiza_cupom_esq10_prazo';
const DURATION_MS = 10 * 60 * 1000;

export type Remaining = {
  hours: number;
  minutes: number;
  seconds: number;
} | null;

export function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function useCountdown(): Remaining {
  const [remaining, setRemaining] = useState<Remaining>(null);

  useEffect(() => {
    let deadline: number;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;

    if (Number.isFinite(parsed) && parsed > Date.now()) {
      deadline = parsed;
    } else {
      deadline = Date.now() + DURATION_MS;
      window.localStorage.setItem(STORAGE_KEY, String(deadline));
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };

    // Zerou, para em 00:00 e fica lá.
    //
    // Antes o relógio se reiniciava sozinho ao chegar no fim. Com 8 horas
    // ninguém via; com 10 minutos, quem deixa a aba aberta veria o contador
    // pular de volta para 10:00 na frente dele, e aí o aviso de "corra" deixa
    // de significar qualquer coisa.
    //
    // Numa visita seguinte o prazo guardado já passou, o bloco acima cria um
    // novo, e a pessoa recebe os 10 minutos de novo.

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return remaining;
}
