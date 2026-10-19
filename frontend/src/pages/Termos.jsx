import { Link } from "react-router-dom";

import PaginaTexto from "../componentes/PaginaTexto";
import { EMAIL_CONTATO } from "../contato";

export default function Termos() {
  const contato = EMAIL_CONTATO ? (
    <a className="font-medium text-marca-700 underline" href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>
  ) : "a equipe do projeto no IFMS";

  return (
    <PaginaTexto
      titulo="Termos de uso"
      resumo="Regras para usar o Emprega-IF. Ao criar uma conta, você concorda com estes termos e com a política de privacidade."
      atualizado="19/10/2026"
      secoes={[
        {
          titulo: "O que é a plataforma",
          conteudo: (
            <p>
              O Emprega-IF conecta estudantes do Instituto Federal a vagas de estágio e de jovem
              aprendiz. É um projeto de extensão do IFMS, mantido por estudantes, oferecido
              gratuitamente e sem garantia de funcionamento contínuo.
            </p>
          ),
        },
        {
          titulo: "Quem pode usar",
          conteudo: (
            <ul>
              <li><strong>Estudantes</strong> com matrícula ativa no IF.</li>
              <li><strong>Empresas</strong> com CNPJ válido e legalmente habilitadas a contratar estagiários e aprendizes (Lei 11.788/2008 e CLT, art. 428).</li>
            </ul>
          ),
        },
        {
          titulo: "Sua conta",
          conteudo: (
            <ul>
              <li>As informações do cadastro devem ser verdadeiras e mantidas atualizadas.</li>
              <li>A conta é pessoal. Guarde a sua senha e não a compartilhe.</li>
              <li>Cada CPF, CNPJ e e-mail pode ter apenas um cadastro.</li>
            </ul>
          ),
        },
        {
          titulo: "Regras para empresas",
          conteudo: (
            <ul>
              <li>Publicar apenas vagas reais de estágio ou de jovem aprendiz, com informações corretas sobre atividades, requisitos, remuneração, horário e local.</li>
              <li>Usar os dados dos candidatos somente para o processo seletivo da vaga.</li>
              <li>Não cobrar nenhum valor dos candidatos.</li>
              <li>Encerrar ou cancelar a vaga quando ela deixar de estar disponível.</li>
            </ul>
          ),
        },
        {
          titulo: "Regras para estudantes",
          conteudo: (
            <ul>
              <li>Candidatar-se apenas a vagas de real interesse.</li>
              <li>Acompanhar o andamento e responder aos contatos das empresas.</li>
            </ul>
          ),
        },
        {
          titulo: "O que não é permitido",
          conteudo: (
            <ul>
              <li>Publicar conteúdo falso, ofensivo, discriminatório ou que não seja uma vaga.</li>
              <li>Tentar acessar dados de outros usuários ou burlar a segurança da plataforma.</li>
              <li>Usar a plataforma para enviar propaganda ou mensagens em massa.</li>
            </ul>
          ),
        },
        {
          titulo: "Responsabilidades",
          conteudo: (
            <p>
              A plataforma apenas aproxima estudantes e empresas. O processo seletivo, a contratação e o
              cumprimento da legislação trabalhista e de estágio são de responsabilidade das empresas e
              das instituições envolvidas.
            </p>
          ),
        },
        {
          titulo: "Dados pessoais",
          conteudo: (
            <p>
              O tratamento dos seus dados está descrito na{" "}
              <Link className="font-medium text-marca-700 underline" to="/privacidade">política de privacidade</Link>.
            </p>
          ),
        },
        {
          titulo: "Alterações e contato",
          conteudo: (
            <p>
              Estes termos podem mudar; a data de atualização fica no topo da página. Dúvidas: {contato}.
            </p>
          ),
        },
      ]}
    />
  );
}
