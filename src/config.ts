// ===== Links de conversão das páginas de venda =====

// Mentoria: compra pelo WhatsApp/Typebot (todos os CTAs de /mentoria apontam aqui).
export const CHECKOUT_URL = 'https://typebot.co/esquematizaapp';

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

// Google Analytics 4. Vazio desliga a medição em todo o site.
export const GA_MEDICAO_ID = 'G-ZLPK9R4PZ6';

// VSL padrão (usada em /mentoria pelo componente YouTubeEmbed).
export const YOUTUBE_ID = 'cr-ZiaBDSf8';
export const YOUTUBE_START = 0;
