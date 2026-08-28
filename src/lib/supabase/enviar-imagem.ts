'use server';

import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';

/**
 * Envia uma imagem do painel para o Supabase e devolve a URL pública.
 *
 * FEITA PARA SERVIR OS DOIS. Hoje é a capa do produto; o blog vem em seguida, e
 * a tabela posts já tem `capa_url` esperando desde sempre, sem nunca ter tido
 * por onde mandar arquivo. Por isso a função recebe a PASTA como parâmetro em
 * vez de assumir "produtos": o blog vai chamar a mesma coisa com 'blog'.
 *
 * O upload usa a sessão de quem está logado, não uma chave de serviço: a
 * política do bucket exige eh_admin(), então quem não é administrador não passa
 * nem que descubra o endereço.
 *
 * O NOME DO ARQUIVO É SORTEADO, e isso é de propósito. Nome vindo do que a
 * pessoa escolheu traria acento, espaço e parêntese, que o Storage rejeita, e
 * ainda deixaria duas capas diferentes brigarem pelo mesmo endereço quando dois
 * produtos tivessem nomes parecidos.
 */

const BUCKET = 'imagens';
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

const EXTENSAO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export type ResultadoImagem =
  | { ok: true; url: string; largura: number | null; altura: number | null }
  | { ok: false; erro: string };

/**
 * Mede a imagem sem biblioteca nenhuma, lendo o cabeçalho do arquivo.
 *
 * As medidas importam porque o next/image precisa delas para reservar o espaço
 * antes de a imagem chegar; sem isso a página pula quando ela carrega. São
 * poucos bytes em posições fixas, e é menos peso do que carregar um decodificador
 * inteiro no servidor só para ler dois números.
 */
function medir(bytes: Uint8Array, tipo: string): { largura: number; altura: number } | null {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  try {
    if (tipo === 'image/png') {
      // largura e altura em big-endian logo depois do cabeçalho IHDR
      return { largura: dv.getUint32(16), altura: dv.getUint32(20) };
    }

    if (tipo === 'image/jpeg') {
      // percorre os marcadores até achar um SOF, que é onde ficam as medidas
      let i = 2;
      while (i < bytes.length - 9) {
        if (bytes[i] !== 0xff) {
          i++;
          continue;
        }
        const marcador = bytes[i + 1];
        const ehSOF =
          marcador >= 0xc0 && marcador <= 0xcf && marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc;
        if (ehSOF) return { altura: dv.getUint16(i + 5), largura: dv.getUint16(i + 7) };
        i += 2 + dv.getUint16(i + 2);
      }
      return null;
    }

    if (tipo === 'image/webp') {
      // só o WebP simples (VP8X), que é o que sai de qualquer conversor
      const marca = String.fromCharCode(...bytes.slice(12, 16));
      if (marca === 'VP8X') {
        const largura = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
        const altura = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
        return { largura, altura };
      }
      return null;
    }
  } catch {
    // cabeçalho fora do esperado: a imagem sobe do mesmo jeito, só sem medida
    return null;
  }

  return null;
}

export async function enviarImagem(
  pasta: 'produtos' | 'blog',
  formData: FormData,
  campo = 'imagem',
): Promise<ResultadoImagem> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const arquivo = formData.get(campo);
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: 'Escolha uma imagem.' };
  }

  const extensao = EXTENSAO[arquivo.type];
  if (!extensao) {
    return { ok: false, erro: 'Formato não aceito. Use JPG, PNG, WebP ou AVIF.' };
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1);
    return { ok: false, erro: `A imagem tem ${mb} MB e o limite é 5 MB. Reduza e tente de novo.` };
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const medida = medir(bytes, arquivo.type);

  const nome = `${pasta}/${crypto.randomUUID()}.${extensao}`;

  const supabase = await criarSupabaseServer();
  const { error } = await supabase.storage.from(BUCKET).upload(nome, bytes, {
    contentType: arquivo.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) return { ok: false, erro: 'Não foi possível enviar a imagem: ' + error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);

  return {
    ok: true,
    url: data.publicUrl,
    largura: medida?.largura ?? null,
    altura: medida?.altura ?? null,
  };
}
