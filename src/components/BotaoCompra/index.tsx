'use client';

import { avisarGtm, comCampanha, type ItemMedido } from '@/lib/rastreio';

/**
 * O botão que leva ao checkout, medindo o clique e levando a campanha junto.
 *
 * Duas coisas acontecem no mesmo clique, e as duas precisam ser no navegador:
 *
 *  - o begin_checkout vai para o GTM, que é o último sinal que temos antes da
 *    pessoa sair do site. Depois disso quem mede é a Eduzz.
 *  - a utm do anúncio é colada no endereço do checkout. Sem isso a TAOS vê a
 *    venda acontecer e não sabe qual anúncio a trouxe.
 *
 * O ENDEREÇO É MONTADO NO CLIQUE, NÃO NA RENDERIZAÇÃO. A página do produto fica
 * guardada por 60 segundos e servida igual para todo mundo: um href montado no
 * servidor sairia com a campanha da visita anterior, colando a venda de uma
 * pessoa no anúncio de outra. No clique, quem manda é a aba de quem clicou.
 *
 * Por isso também não há `href` dinâmico aqui: o atributo continua sendo o
 * checkout limpo, o que mantém o botão funcionando com JavaScript desligado, ao
 * clique do meio e no "copiar endereço do link". A campanha entra por cima só
 * no clique normal.
 */
export default function BotaoCompra({
  href,
  item,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  href: string;
  item: ItemMedido;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}) {
  function aoClicar(evento: React.MouseEvent<HTMLAnchorElement>) {
    avisarGtm('begin_checkout', item);

    // Trocar o href aqui dentro vale para a navegação deste mesmo clique: o
    // navegador só lê o atributo depois que o evento termina de ser tratado.
    // Continua valendo para quem abre em aba nova com ctrl ou cmd, porque quem
    // decide COMO abrir é o navegador, e só o PARA ONDE muda aqui.
    //
    // Rodar de novo no segundo clique não duplica nada: comCampanha não mexe em
    // parâmetro que o endereço já tem.
    evento.currentTarget.href = comCampanha(href);
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={aoClicar}
    >
      {children}
    </a>
  );
}
