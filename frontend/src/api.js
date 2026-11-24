const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function salvarToken(token) {
  localStorage.setItem('token', token);
}

export function removerToken() {
  localStorage.removeItem('token');
}

export function obterToken() {
  return localStorage.getItem('token');
}

export async function requisicao(caminho, { metodo = 'GET', corpo } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  const token = obterToken();

  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || 'Erro na requisição');
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}
