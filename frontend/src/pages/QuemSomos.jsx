import { Link } from "react-router-dom";

import PaginaTexto from "../componentes/PaginaTexto";
import { EMAIL_CONTATO, EQUIPE, ORIENTADOR } from "../contato";

export default function QuemSomos() {
  return (
    <PaginaTexto
      titulo="Quem somos"
      resumo="O Emprega-IF é um projeto de extensão feito por estudantes do IFMS para aproximar quem está começando a carreira das empresas que oferecem estágio e vagas de jovem aprendiz."
      secoes={[
        {
          titulo: "Por que o projeto existe",
          conteudo: (
            <>
              <p>
                Encontrar a primeira oportunidade é difícil: as vagas ficam espalhadas em sites,
                redes sociais e murais, e as plataformas grandes não são pensadas para quem nunca
                trabalhou. Numa pesquisa com estudantes do IF, a maioria disse que usaria uma
                plataforma feita só para isso.
              </p>
              <p>
                Aqui o estudante cria um perfil simples, encontra vagas compatíveis com o seu curso e
                acompanha cada candidatura. A empresa publica a vaga e vê os candidatos num só lugar.
              </p>
            </>
          ),
        },
        {
          titulo: "Equipe",
          conteudo: (
            <>
              <p>Projeto desenvolvido pelos estudantes:</p>
              <ul>{EQUIPE.map((nome) => <li key={nome}>{nome}</li>)}</ul>
              <p>Orientação: {ORIENTADOR}.</p>
            </>
          ),
        },
        {
          titulo: "Um projeto acadêmico",
          conteudo: (
            <p>
              O Emprega-IF é um trabalho de extensão do IFMS e não é um serviço oficial do Instituto
              Federal. As vagas exibidas no momento são exemplos usados para demonstração.
            </p>
          ),
        },
        {
          titulo: "Fale com a gente",
          conteudo: EMAIL_CONTATO ? (
            <p>
              Dúvidas, sugestões ou pedidos sobre seus dados:{" "}
              <a className="link" href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
            </p>
          ) : (
            <p>Dúvidas, sugestões ou pedidos sobre seus dados: procure a equipe do projeto no IFMS.</p>
          ),
        },
        {
          titulo: "Comece agora",
          conteudo: (
            <p>
              <Link className="link" to="/vagas">Veja as vagas abertas</Link>{" "}
              ou{" "}
              <Link className="link" to="/cadastro">crie sua conta</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
