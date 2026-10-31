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
import PainelEmpresa from "./pages/PainelEmpresa";
import MinhasCandidaturas from "./pages/MinhasCandidaturas";
import QuemSomos from "./pages/QuemSomos";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

function EmBreve({ titulo, figura }) {
  return (
    <main className="container-site py-16 sm:py-24">
      <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
        <h1 className="text-3xl">{titulo}</h1>
        <p className="mt-2 text-[17px] text-tinta-media">
          {figura === "404"
            ? "Este endereço não leva a nenhuma página do Emprega IF."
            : `Tela prevista na documentação (${figura}), ainda não implementada.`}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="botao" to="/vagas">Ver vagas abertas</Link>
          <Link className="botao botao--contorno" to="/">Ir para o início</Link>
        </div>
      </div>
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
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/vagas/nova" element={<PublicarVaga />} />
          <Route path="/vagas/:id" element={<DetalheVaga />} />
          <Route path="/painel" element={<PainelEmpresa />} />
          <Route path="/minhas-candidaturas" element={<MinhasCandidaturas />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="*" element={<EmBreve titulo="Página não encontrada" figura="404" />} />
        </Routes>
      </div>

      <Rodape />
    </div>
  );
}
