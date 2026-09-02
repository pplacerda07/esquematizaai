// ===== Links de conversão das páginas de venda =====

// Mentoria: aplicação pelo Typeform (todos os CTAs de /mentoria apontam aqui).
// Substituiu o Typebot no WhatsApp em 27/08, a pedido do Sérgio, junto com o
// lançamento da mentoria para SEFAZ-AL.
export const CHECKOUT_URL = 'https://esquematizaai.typeform.com/mentoria';

// CGU (LP de captura): grupo VIP no WhatsApp (todos os CTAs de /cgu apontam aqui).
export const GRUPO_VIP_URL = 'https://chat.whatsapp.com/DfqbvIRKC1UBQKdZL7qrar';

// Site principal (logo / navegação de volta).
export const SITE_URL = 'https://esquematizaai.com';

// Área do aluno (botão do topo). Substituiu o antigo /minha-conta do WordPress.
export const AREA_ALUNO_URL = 'https://membros.esquematizaai.com/logar';

// Suporte do Esquematiza Aí: +55 11 5286-5954.
// Todo botão de WhatsApp do site aponta para cá; trocar aqui muda o site inteiro.
export const WHATSAPP_NUMERO = '551152865954';
export const whatsappUrl = (mensagem: string) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

// Pasta de amostras no Google Drive. É para cá que vai o botão "Ver amostras
// grátis" de TODOS os produtos: em vez de servir PDF por produto, manda a pessoa
// para a pasta compartilhada. Trocar este link muda o botão do site inteiro.
export const AMOSTRAS_DRIVE_URL =
  'https://drive.google.com/drive/folders/1zHPjcFj8e86R4681MfL9LbkS-2a34f_O?usp=sharing';

// Pasta pública dos vídeos de depoimento, no Supabase Storage.
// Cada aluno tem dois arquivos com o mesmo nome: <slug>.mp4 e <slug>.jpg.
export const DEPOIMENTOS_VIDEO_BASE =
  'https://xjcasijvuzjtnaxxvunm.supabase.co/storage/v1/object/public/depoimentos';

// Google Analytics 4. Vazio desliga a medição em todo o site.
export const GA_MEDICAO_ID = 'G-ZLPK9R4PZ6';

// VSL padrão (usada em /mentoria pelo componente YouTubeEmbed).
export const YOUTUBE_ID = 'cr-ZiaBDSf8';
export const YOUTUBE_START = 0;

/**
 * Redes sociais do rodapé.
 *
 * SÓ APARECE O QUE TEM ENDEREÇO. O Sérgio pediu os quatro ícones, mas o único
 * link que existe hoje é o do Instagram: no site atual o Facebook aponta para
 * um "profile.php" sem identificador, e YouTube e TikTok não aparecem em lugar
 * nenhum. Ícone bonito levando a lugar nenhum é pior que ícone ausente, então
 * quem estiver em branco simplesmente não é desenhado.
 *
 * Para ligar os outros três, basta preencher a string aqui.
 */
/**
 * Redes sociais do rodapé. O ícone só aparece se a URL estiver preenchida,
 * porque ícone que não leva a lugar nenhum é pior que ícone ausente.
 *
 * Os três últimos vieram do Sérgio em 02/09. TIREI OS PARÂMETROS DE RASTREIO
 * que vinham colados nos links (`?si=`, `?_r=1&_t=`, `?mibextid=`): são códigos
 * de compartilhamento gerados pelo app dele naquele momento, não fazem parte do
 * endereço e podem envelhecer. Os endereços sem eles abrem os mesmos perfis.
 */
export const REDES_SOCIAIS = {
  instagram: 'https://www.instagram.com/esquematizaai/',
  youtube: 'https://youtube.com/@esquematizaai',
  tiktok: 'https://www.tiktok.com/@esquematizaai',
  facebook: 'https://www.facebook.com/share/1BaG8f3fsq/',
} as const;
