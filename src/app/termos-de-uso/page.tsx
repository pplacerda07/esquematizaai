import type { Metadata } from 'next';
import Termos, { type DocumentoTermos } from '@/components/Termos';
import documento from '@/data/termos/materiais.json';

/**
 * Termos de uso dos materiais.
 *
 * O Sérgio pediu uma página dedicada porque o checkout da Eduzz tem um link de
 * "Termos de Compra da Plataforma" e ele quer apontar para cá. Hoje isso existe
 * só no WordPress; ter no site novo evita mandar o comprador para outro
 * endereço no meio do pagamento.
 */
export const metadata: Metadata = {
  title: 'Termos de uso dos materiais | Esquematiza Aí',
  description:
    'Termos e condições de uso e conduta dos materiais e produtos digitais do Esquematiza Aí: acesso, liberação programada, reembolso e propriedade intelectual.',
};

export default function TermosDeUsoPage() {
  return <Termos documento={documento as DocumentoTermos} atualizadoEm="28 de agosto de 2026" />;
}
