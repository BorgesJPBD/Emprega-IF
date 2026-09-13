import { Link, Route, Routes } from "react-router-dom";

import Cabecalho from "./componentes/Cabecalho";
import Rodape from "./componentes/Rodape";
import CadastroEstudante from "./pages/CadastroEstudante";
import Login from "./pages/Login";

/** Telas ainda não construídas. Cada uma sai daqui quando for implementada. */
function EmBreve({ titulo, figura }) {
  return (
    <main className="pagina">
      <h1>{titulo}</h1>
      <p className="pagina__apoio">
        Tela prevista na documentação ({figura}), ainda não implementada.
      </p>
      <p>
        <Link to="/cadastro/estudante">Ir para o cadastro de estudante</Link>
      </p>
    </main>
  );
}

export default function App() {
  return (
    <div className="app">
      <Cabecalho />

      <div className="app__conteudo">
        <Routes>
          <Route path="/" element={<EmBreve titulo="Página inicial" figura="Figura 2" />} />
          <Route path="/cadastro/estudante" element={<CadastroEstudante />} />
          <Route
            path="/cadastro/empresa"
            element={<EmBreve titulo="Cadastro de empresa" figura="Figura 4" />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/recuperar-senha"
            element={<EmBreve titulo="Recuperar senha" figura="RN-05" />}
          />
          <Route path="/vagas" element={<EmBreve titulo="Vagas" figura="UC02" />} />
          <Route
            path="/vagas/nova"
            element={<EmBreve titulo="Publicar vaga" figura="Figura 4" />}
          />
          <Route path="*" element={<EmBreve titulo="Página não encontrada" figura="404" />} />
        </Routes>
      </div>

      <Rodape />
    </div>
  );
}
