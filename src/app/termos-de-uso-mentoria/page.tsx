import type { Metadata } from 'next';
import Termos, { type DocumentoTermos } from '@/components/Termos';
import documento from '@/data/termos/mentoria.json';

/**
 * Termos de uso da mentoria.
 *
 * Documento separado do dos materiais porque o serviço é outro: tem plano
 * recorrente, reunião com o mentor e regras próprias de cancelamento. O Sérgio
 * quer o link no checkout da mentoria, cujo ticket é maior e o contrato mais
 * longo.
 */
export const metadata: Metadata = {
  title: 'Termos de uso da mentoria | Esquematiza Aí',
  description:
    'Termos e condições de uso da Esquematiza Aí Mentoria: objeto, planos, cancelamento, reembolso, propriedade intelectual e proteção de dados.',
};

export default function TermosDaMentoriaPage() {
  return <Termos documento={documento as DocumentoTermos} atualizadoEm="28 de agosto de 2026" />;
}
