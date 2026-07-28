/**
 * Seta desenhada à mão que liga a janela da promessa à janela da entrega.
 *
 * PROVISÓRIA: o Sérgio vai mandar o traço original da área de membros. Quando
 * chegar, é só trocar o `path` daqui (ou o arquivo inteiro) — nada mais muda,
 * porque a cor vem de `currentColor` e o giro no celular é feito no CSS.
 *
 * Traço em vez de imagem: assim ela acompanha a cor do tema, não pesa nada e
 * não fica serrilhada em tela de alta densidade.
 */
export default function Seta({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 74"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* curva principal, com leve irregularidade para não parecer vetor de régua */}
      <path d="M5 16 C 34 3, 66 9, 87 33 C 93 40, 97 47, 100 54" />
      {/* farpas da ponta */}
      <path d="M100 54 C 99.4 48, 99 42, 98.6 38" />
      <path d="M100 54 C 95 51, 90 47, 87 45" />
    </svg>
  );
}
