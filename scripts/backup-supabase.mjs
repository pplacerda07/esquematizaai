/**
 * Copia de segurança do banco, em JSON, dentro do próprio repositório.
 *
 * POR QUE ISTO EXISTE: o projeto do Supabase está no plano gratuito, e plano
 * gratuito NÃO TEM backup automático. A Supabase só faz cópia diária de projeto
 * pago, e a recomendação dela para quem está no gratuito é exportar os dados por
 * conta própria. Sem isto, um clique errado no painel apagaria os artigos do
 * blog, escritos à mão, sem nada de onde voltar.
 *
 * O banco inteiro tem menos de 1 MB de texto, então a cópia cabe no Git. Isso
 * resolve duas coisas de uma vez: fica fora da máquina (no GitHub) e fica
 * versionada, dá para ver o que mudou entre uma cópia e outra.
 *
 *   node scripts/backup-supabase.mjs
 *
 * Depois é só commitar a pasta `backups/`. Rode antes de qualquer mexida grande
 * no banco, e de vez em quando sem motivo nenhum.
 *
 * O QUE NÃO ENTRA: a tabela `administradores`, que é e-mail de pessoa e tem uma
 * linha só, e o Storage (vídeos de depoimento e capas). O Storage não é banco, e
 * a cópia dele são os arquivos originais que a equipe já tem.
 *
 * PARA RESTAURAR: os arquivos são a resposta crua da API, uma lista de objetos.
 * Dá para reinserir com um upsert pela chave primária de cada tabela. Não existe
 * script de restauração de propósito: restaurar banco é operação para se fazer
 * olhando, não em um comando que alguém roda por engano.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// .env.local na mão: o script roda fora do Next, que é quem normalmente carrega
for (const linha of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const ENDERECO = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ENDERECO || !CHAVE) {
  console.error('faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local.');
  console.error('Supabase > projeto esquematiza-blog > Settings > API > service_role');
  process.exit(1);
}

// service_role passa por cima do RLS de propósito: a cópia tem que trazer o que
// está escondido do visitante, como rascunho de post e ajuste de produto oculto.
const db = createClient(ENDERECO, CHAVE, { auth: { persistSession: false } });

const TABELAS = [
  'posts',
  'noticias',
  'produtos_ajustes',
  'disciplinas',
  'disciplina_topicos',
  'curso_disciplinas',
  'produtos_novos',
];

const DESTINO = path.join(import.meta.dirname, '..', 'backups');
fs.mkdirSync(DESTINO, { recursive: true });

let falhou = false;

for (const tabela of TABELAS) {
  const { data, error } = await db.from(tabela).select('*');
  if (error) {
    console.error(tabela.padEnd(20) + 'ERRO: ' + error.message);
    falhou = true;
    continue;
  }
  // ordena pelo id para o arquivo não mudar de ordem sozinho entre duas cópias:
  // sem isso todo backup vira um diff gigante e ninguém consegue ler a mudança
  const linhas = [...data].sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')));
  const arquivo = path.join(DESTINO, tabela + '.json');
  fs.writeFileSync(arquivo, JSON.stringify(linhas, null, 2) + '\n', 'utf8');
  console.log(tabela.padEnd(20) + String(linhas.length).padStart(4) + ' linhas');
}

const carimbo = new Date().toISOString().slice(0, 19).replace('T', ' ');
fs.writeFileSync(path.join(DESTINO, 'QUANDO.txt'), carimbo + ' UTC\n', 'utf8');

console.log();
console.log('cópia em backups/, de ' + carimbo + ' UTC');
console.log('agora commite: git add backups && git commit -m "backup do banco"');

if (falhou) process.exitCode = 1;
