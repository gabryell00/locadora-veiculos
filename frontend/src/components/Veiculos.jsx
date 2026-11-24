import { useEffect, useState } from 'react';
import { requisicao } from '../api.js';

const formularioVazio = { marca: '', modelo: '', placa: '', ano: '', valorDiaria: '' };

export default function Veiculos({ versao, aoAlterar }) {
  const [veiculos, setVeiculos] = useState([]);
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const filtro = somenteDisponiveis ? '?disponivel=true' : '';
    requisicao(`/veiculos${filtro}`)
      .then(setVeiculos)
      .catch((erro) => setMensagem(erro.message));
  }, [somenteDisponiveis, versao]);

  function alterarCampo(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    setMensagem('');

    try {
      await requisicao('/veiculos', {
        metodo: 'POST',
        corpo: {
          ...formulario,
          ano: Number(formulario.ano),
          valorDiaria: Number(formulario.valorDiaria),
        },
      });
      setFormulario(formularioVazio);
      setMensagem('Veículo cadastrado com sucesso');
      aoAlterar();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  return (
    <section>
      <h2>Veículos</h2>

      <form onSubmit={cadastrar}>
        <input name="marca" placeholder="Marca" value={formulario.marca} onChange={alterarCampo} />
        <input name="modelo" placeholder="Modelo" value={formulario.modelo} onChange={alterarCampo} />
        <input name="placa" placeholder="Placa" value={formulario.placa} onChange={alterarCampo} />
        <input name="ano" type="number" placeholder="Ano" value={formulario.ano} onChange={alterarCampo} />
        <input
          name="valorDiaria"
          type="number"
          step="0.01"
          placeholder="Valor da diária"
          value={formulario.valorDiaria}
          onChange={alterarCampo}
        />
        <button type="submit">Cadastrar veículo</button>
      </form>
      {mensagem && <p>{mensagem}</p>}

      <label>
        <input
          type="checkbox"
          checked={somenteDisponiveis}
          onChange={(e) => setSomenteDisponiveis(e.target.checked)}
        />
        Mostrar somente disponíveis
      </label>

      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Placa</th>
            <th>Ano</th>
            <th>Diária (R$)</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.id}</td>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.placa}</td>
              <td>{veiculo.ano}</td>
              <td>{Number(veiculo.valorDiaria).toFixed(2)}</td>
              <td>{veiculo.disponivel ? 'Disponível' : 'Locado'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
