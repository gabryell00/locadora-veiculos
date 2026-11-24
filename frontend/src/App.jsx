import { useEffect, useState } from 'react';
import { obterToken, removerToken, requisicao } from './api.js';
import Autenticacao from './components/Autenticacao.jsx';
import Veiculos from './components/Veiculos.jsx';
import Locacoes from './components/Locacoes.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!obterToken()) {
      setCarregando(false);
      return;
    }

    requisicao('/auth/perfil')
      .then(setUsuario)
      .catch(() => removerToken())
      .finally(() => setCarregando(false));
  }, []);

  function sair() {
    removerToken();
    setUsuario(null);
  }

  function atualizarDados() {
    setVersao((atual) => atual + 1);
  }

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (!usuario) {
    return <Autenticacao aoEntrar={setUsuario} />;
  }

  return (
    <div>
      <h1>Locadora de Veículos</h1>
      <p>
        Logado como <strong>{usuario.nome}</strong> ({usuario.email}){' '}
        <button onClick={sair}>Sair</button>
      </p>
      <hr />
      <Veiculos versao={versao} aoAlterar={atualizarDados} />
      <hr />
      <Locacoes versao={versao} aoAlterar={atualizarDados} />
    </div>
  );
}
