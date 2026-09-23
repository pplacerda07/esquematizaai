'use client';

import { useEffect } from 'react';
import { avisarGtm, type ItemMedido } from '@/lib/rastreio';

/**
 * Avisa o GTM que alguém está vendo este produto.
 *
 * Não desenha nada: existe só para disparar o view_item quando a página monta.
 * Fica num componente próprio porque a página do produto é de servidor, e
 * evento de medição é coisa de navegador.
 *
 * O array de dependência leva o id: quem navega de um produto para outro sem
 * recarregar a página mantém o componente montado, e sem isso o segundo produto
 * nunca seria contado.
 */
export default function MedicaoDeProduto({ item }: { item: ItemMedido }) {
  useEffect(() => {
    avisarGtm('view_item', item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return null;
}
