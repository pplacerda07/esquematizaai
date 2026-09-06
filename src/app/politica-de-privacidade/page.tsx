import type { Metadata } from 'next';
import Termos, { type DocumentoTermos } from '@/components/Termos';
import documento from '@/data/termos/privacidade.json';

/**
 * Política de privacidade.
 *
 * Existe no WordPress desde 2024 e é linkada do rodapé e das páginas de
 * produto. Sem ela aqui, a virada do domínio transformaria esse link num erro,
 * e é justamente o tipo de página que ninguém lê até precisar.
 *
 * O TEXTO É O MESMO, palavra por palavra. Trouxe do site antigo sem reescrever
 * nem resumir: documento jurídico publicado não se reescreve por conta própria,
 * e o que vale é o que já estava no ar. O que mudou foi só a forma, para usar o
 * mesmo componente das duas páginas de Termos.
 *
 * O ENDEREÇO É O MESMO do WordPress, /politica-de-privacidade, então os links
 * que já existem por aí continuam funcionando depois da virada.
 */
export const metadata: Metadata = {
  title: 'Política de Privacidade | Esquematiza Aí',
  description:
    'Como o Esquematiza Aí trata as informações de quem usa o site: dados coletados, cookies próprios e de terceiros, e o compromisso do usuário.',
};

export default function PoliticaDePrivacidadePage() {
  return (
    <Termos
      documento={documento as DocumentoTermos}
      atualizadoEm="20 de dezembro de 2024"
    />
  );
}
