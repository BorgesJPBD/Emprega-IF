import { Link, Route, Routes } from "react-router-dom";


import ParaEmpresas from "./pages/ParaEmpresas";
import ParaEstudantes from "./pages/ParaEstudantes";
import EscolhaCadastro from "./pages/EscolhaCadastro";
import CadastroEmpresa from "./pages/CadastroEmpresa";
import Cabecalho from "./componentes/Cabecalho";
import Rodape from "./componentes/Rodape";
import CadastroEstudante from "./pages/CadastroEstudante";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Vagas from "./pages/Vagas";
import PublicarVaga from "./pages/PublicarVaga";
import DetalheVaga from "./pages/DetalheVaga"; 

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
          <Route path="/para-estudantes" element={<ParaEstudantes />} />
          <Route path="/para-empresas" element={<ParaEmpresas />} />
          <Route path="/cadastro" element={<EscolhaCadastro />} />
          <Route path="/" element={<Home />} />
          <Route path="/cadastro/estudante" element={<CadastroEstudante />} />
          <Route
            path="/cadastro/empresa"
            element={<CadastroEmpresa />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/recuperar-senha"
            element={<EmBreve titulo="Recuperar senha" figura="RN-05" />}
          />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/vagas/nova" element={<PublicarVaga />} />
          <Route path="/vagas/:id" element={<DetalheVaga />} />
          <Route path="*" element={<EmBreve titulo="Página não encontrada" figura="404" />} />
        </Routes>
      </div>

      <Rodape />
    </div>
  );
}
