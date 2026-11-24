import { useEffect, useState } from 'react';
import { requisicao } from '../api.js';

function formatarData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-';
}

export default function Locacoes({ versao, aoAlterar }) {
  const [locacoes, setLocacoes] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [veiculoId, setVeiculoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataPrevistaDevolucao, setDataPrevistaDevolucao] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    requisicao('/locacoes')
      .then(setLocacoes)
      .catch((erro) => setMensagem(erro.message));
    requisicao('/veiculos?disponivel=true')
      .then(setDisponiveis)
      .catch((erro) => setMensagem(erro.message));
  }, [versao]);

  async function registrar(evento) {
    evento.preventDefault();
    setMensagem('');

    if (!veiculoId || !dataInicio || !dataPrevistaDevolucao) {
      setMensagem('Preencha o veículo e as duas datas');
      return;
    }

    try {
      const locacao = await requisicao('/locacoes', {
        metodo: 'POST',
        corpo: {
          veiculoId: Number(veiculoId),
          dataInicio: new Date(dataInicio).toISOString(),
          dataPrevistaDevolucao: new Date(dataPrevistaDevolucao).toISOString(),
        },
      });
      setVeiculoId('');
      setDataInicio('');
      setDataPrevistaDevolucao('');
      setMensagem(`Locação registrada. Valor total: R$ ${Number(locacao.valorTotal).toFixed(2)}`);
      aoAlterar();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  async function finalizar(id) {
    setMensagem('');

    try {
      await requisicao(`/locacoes/${id}/finalizar`, { metodo: 'PATCH' });
      setMensagem('Locação finalizada');
      aoAlterar();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  return (
    <section>
      <h2>Locações</h2>

      <form onSubmit={registrar}>
        <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
          <option value="">Escolha um veículo disponível</option>
          {disponiveis.map((veiculo) => (
            <option key={veiculo.id} value={veiculo.id}>
              {veiculo.marca} {veiculo.modelo} - {veiculo.placa} (R$ {Number(veiculo.valorDiaria).toFixed(2)}/dia)
            </option>
          ))}
        </select>
        <label>
          Início:
          <input type="datetime-local" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label>
          Devolução prevista:
          <input
            type="datetime-local"
            value={dataPrevistaDevolucao}
            onChange={(e) => setDataPrevistaDevolucao(e.target.value)}
          />
        </label>
        <button type="submit">Registrar locação</button>
      </form>
      {mensagem && <p>{mensagem}</p>}

      <h3>Minhas locações</h3>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Veículo</th>
            <th>Início</th>
            <th>Devolução prevista</th>
            <th>Devolvido em</th>
            <th>Valor (R$)</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {locacoes.map((locacao) => (
            <tr key={locacao.id}>
              <td>{locacao.id}</td>
              <td>
                {locacao.veiculo.marca} {locacao.veiculo.modelo} ({locacao.veiculo.placa})
              </td>
              <td>{formatarData(locacao.dataInicio)}</td>
              <td>{formatarData(locacao.dataPrevistaDevolucao)}</td>
              <td>{formatarData(locacao.dataDevolucao)}</td>
              <td>{Number(locacao.valorTotal).toFixed(2)}</td>
              <td>{locacao.status}</td>
              <td>
                {locacao.status === 'ATIVA' && (
                  <button onClick={() => finalizar(locacao.id)}>Finalizar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
