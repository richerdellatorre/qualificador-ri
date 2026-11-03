// ─── Cliente GitHub REST API ──────────────────────────────────
// Lê e escreve o arquivo customizacoes.json no repositório configurado
// Todas as chamadas são server-side apenas (usa GITHUB_TOKEN do env)

export interface RegraCustomizacao {
  ativo: boolean;                  // true = aplica a regra normalmente
  observacao?: string;             // Nota adicional do cartório para a IA
  motivo_desativacao?: string;     // Explicação quando ativo = false
}

export interface RegraConferidor {
  codigo: string;
  descricao: string;
  tipo: 'excecao' | 'instrucao';
  ativo: boolean;
}

export interface ConfigConferidor {
  excecoes: RegraConferidor[];
  instrucoes_adicionais: string[];
}

export interface CustomizacoesConfig {
  versao: string;
  cartorio: string;
  ultima_atualizacao: string;
  regras: Record<string, RegraCustomizacao>;
  instrucoes_adicionais: string[];  // Regras extras livres do cartório (qualificador)
  conferidor?: ConfigConferidor;    // Exceções e instruções do conferidor de minuta
}

const DEFAULT_CONFIG: CustomizacoesConfig = {
  versao: '1.0',
  cartorio: 'CRI Rondônia',
  ultima_atualizacao: new Date().toISOString(),
  regras: {},
  instrucoes_adicionais: [],
};

function getGitHubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN não configurado');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'qualificador-ri/1.0',
  };
}

function getApiUrl() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const path = process.env.GITHUB_FILE_PATH ?? 'customizacoes.json';
  if (!owner || !repo) throw new Error('GITHUB_OWNER ou GITHUB_REPO não configurados');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

// ── Lê o arquivo do GitHub (com cache em memória por 5 minutos) ──
let _cache: { data: CustomizacoesConfig; ts: number; sha: string } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function lerCustomizacoes(): Promise<{ config: CustomizacoesConfig; sha: string }> {
  // Retorna do cache se ainda válido
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return { config: _cache.data, sha: _cache.sha };
  }

  try {
    const resp = await fetch(getApiUrl(), {
      headers: getGitHubHeaders(),
      cache: 'no-store',
    });

    if (resp.status === 404) {
      // Arquivo ainda não existe — cria com defaults
      const criado = await criarArquivoInicial();
      return criado;
    }

    if (!resp.ok) {
      throw new Error(`GitHub API retornou ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    const conteudo = Buffer.from(data.content, 'base64').toString('utf-8');
    const limpo = conteudo.replace(/^\uFEFF/, '').trim();
    const config = JSON.parse(limpo) as CustomizacoesConfig;

    _cache = { data: config, ts: Date.now(), sha: data.sha };
    return { config, sha: data.sha };
  } catch (err) {
    // Se falhar por qualquer motivo, retorna config padrão sem bloquear a análise
    console.warn('[GitHub] Falha ao ler customizações, usando padrão:', err);
    return { config: DEFAULT_CONFIG, sha: '' };
  }
}

// ── Salva o arquivo no GitHub (cria commit) ──────────────────
export async function salvarCustomizacoes(
  config: CustomizacoesConfig,
  sha: string
): Promise<{ sha: string }> {
  const agora = new Date();
  const configAtualizada: CustomizacoesConfig = {
    ...config,
    ultima_atualizacao: agora.toISOString(),
  };

  const conteudoBase64 = Buffer.from(
    JSON.stringify(configAtualizada, null, 2)
  ).toString('base64');

  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const body: Record<string, unknown> = {
    message: `Atualização de regras — ${dataFormatada}`,
    content: conteudoBase64,
    committer: {
      name: 'Qualificador Registral',
      email: 'sistema@qualificador-ri.app',
    },
  };

  // SHA obrigatório para atualizar arquivo existente
  if (sha) body.sha = sha;

  const resp = await fetch(getApiUrl(), {
    method: 'PUT',
    headers: getGitHubHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao salvar no GitHub: ${resp.status} — ${erro}`);
  }

  const result = await resp.json();
  const novoSha = result.content?.sha ?? '';

  // Invalida cache
  _cache = { data: configAtualizada, ts: Date.now(), sha: novoSha };

  return { sha: novoSha };
}

// ── Cria o arquivo pela primeira vez ────────────────────────
async function criarArquivoInicial(): Promise<{ config: CustomizacoesConfig; sha: string }> {
  const { sha } = await salvarCustomizacoes(DEFAULT_CONFIG, '');
  return { config: DEFAULT_CONFIG, sha };
}

// ── Invalida o cache manualmente ────────────────────────────
export function invalidarCache() {
  _cache = null;
}

// ── Atualiza uma única regra diretamente no GitHub ──────────
export async function atualizarRegraIndividual(
  codigo: string,
  regra: RegraCustomizacao,
  mensagemCommit?: string
): Promise<{ sha: string; config: CustomizacoesConfig }> {
  invalidarCache();
  const { config, sha } = await lerCustomizacoes();

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const configAtualizada: CustomizacoesConfig = {
    ...config,
    regras: {
      ...config.regras,
      [codigo]: regra,
    },
    ultima_atualizacao: agora.toISOString(),
  };

  const commitMsg = mensagemCommit || `Ajuste na regra ${codigo} via IA — ${dataFormatada}`;
  const conteudoBase64 = Buffer.from(
    JSON.stringify(configAtualizada, null, 2)
  ).toString('base64');

  const body: Record<string, unknown> = {
    message: commitMsg,
    content: conteudoBase64,
    committer: {
      name: 'Qualificador Registral',
      email: 'sistema@qualificador-ri.app',
    },
  };
  if (sha) body.sha = sha;

  const resp = await fetch(getApiUrl(), {
    method: 'PUT',
    headers: getGitHubHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao salvar no GitHub: ${resp.status} — ${erro}`);
  }

  const result = await resp.json();
  const novoSha = result.content?.sha ?? '';
  _cache = { data: configAtualizada, ts: Date.now(), sha: novoSha };

  return { sha: novoSha, config: configAtualizada };
}

// ── Formata as customizações como texto para injeção no prompt ──
export function customizacoesParaPrompt(config: CustomizacoesConfig): string {
  const linhas: string[] = [];

  // Regras desativadas
  const desativadas = Object.entries(config.regras).filter(([, r]) => !r.ativo);
  if (desativadas.length > 0) {
    linhas.push('## REGRAS DESATIVADAS PELO CARTÓRIO (NÃO APLICAR):');
    for (const [codigo, regra] of desativadas) {
      linhas.push(`- Código ${codigo}: ${regra.motivo_desativacao ?? 'Desativado pelo cartório'}`);
    }
    linhas.push('');
  }

  // Observações do cartório por código
  const comObservacao = Object.entries(config.regras).filter(([, r]) => r.ativo && r.observacao);
  if (comObservacao.length > 0) {
    linhas.push('## OBSERVAÇÕES DO CARTÓRIO POR REGRA:');
    for (const [codigo, regra] of comObservacao) {
      linhas.push(`- ${codigo}: ${regra.observacao}`);
    }
    linhas.push('');
  }

  // Instruções adicionais livres
  if (config.instrucoes_adicionais.length > 0) {
    linhas.push('## INSTRUÇÕES ADICIONAIS DO CARTÓRIO:');
    for (const instrucao of config.instrucoes_adicionais) {
      linhas.push(`- ${instrucao}`);
    }
    linhas.push('');
  }

  if (linhas.length === 0) return '';

  return `\n\n---\n# CUSTOMIZAÇÕES DO CARTÓRIO (${config.cartorio})\n${linhas.join('\n')}---\n`;
}
