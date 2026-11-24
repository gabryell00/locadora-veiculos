import { useState } from 'react';
import { requisicao, salvarToken } from '../api.js';

export default function Autenticacao({ aoEntrar }) {
  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem('');

    try {
      if (modo === 'cadastro') {
        await requisicao('/auth/cadastro', { metodo: 'POST', corpo: { nome, email, senha } });
        setModo('login');
        setMensagem('Cadastro realizado. Faça login.');
        return;
      }

      const resultado = await requisicao('/auth/login', { metodo: 'POST', corpo: { email, senha } });
      salvarToken(resultado.token);
      aoEntrar(resultado.usuario);
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  return (
    <div>
      <h1>Locadora de Veículos</h1>
      <h2>{modo === 'login' ? 'Login' : 'Cadastro'}</h2>
      <form onSubmit={enviar}>
        {modo === 'cadastro' && (
          <p>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </p>
        )}
        <p>
          <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </p>
        <p>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </p>
        <button type="submit">{modo === 'login' ? 'Entrar' : 'Cadastrar'}</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
      <button onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}>
        {modo === 'login' ? 'Criar conta' : 'Já tenho conta'}
      </button>
    </div>
  );
}
