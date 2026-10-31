import PaginaTexto from "../componentes/PaginaTexto";
import { EMAIL_CONTATO } from "../contato";

export default function Privacidade() {
  const contato = EMAIL_CONTATO ? (
    <a className="link" href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>
  ) : "a equipe do projeto no IFMS";

  return (
    <PaginaTexto
      titulo="Política de privacidade"
      resumo="Como o Emprega-IF coleta, usa e protege os seus dados, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
      atualizado="19/10/2026"
      secoes={[
        {
          titulo: "Quais dados coletamos",
          conteudo: (
            <>
              <p><strong>Estudantes:</strong> nome completo, CPF, e-mail, telefone (opcional), instituição, curso e período.</p>
              <p><strong>Empresas:</strong> razão social, nome fantasia, CNPJ, setor de atuação, e-mail de contato, telefone e endereço (opcionais).</p>
              <p><strong>Uso da plataforma:</strong> vagas publicadas, candidaturas enviadas, data de cada candidatura e o histórico de andamento.</p>
              <p>A senha nunca é guardada: o banco armazena apenas um código irreversível gerado a partir dela (<em>hash</em> bcrypt).</p>
            </>
          ),
        },
        {
          titulo: "Para que usamos",
          conteudo: (
            <ul>
              <li>Criar e manter a sua conta e permitir o login.</li>
              <li>Exibir vagas e registrar candidaturas.</li>
              <li>Enviar e-mails sobre a sua conta e as suas candidaturas (confirmação e mudanças de andamento).</li>
              <li>Mostrar números gerais da plataforma, sempre em totais, sem identificar ninguém.</li>
            </ul>
          ),
        },
        {
          titulo: "Com quem compartilhamos",
          conteudo: (
            <>
              <p>
                Quando você se candidata a uma vaga, a empresa que a publicou passa a ver o seu nome,
                e-mail, telefone, instituição, curso e período, além da data e do andamento da
                candidatura. <strong>O CPF não é mostrado às empresas.</strong> Uma empresa só vê os
                candidatos das próprias vagas.
              </p>
              <p>Para funcionar, a plataforma usa serviços de terceiros, que tratam os dados apenas para isso:</p>
              <ul>
                <li><strong>Render</strong>: hospedagem do site e do servidor (Estados Unidos).</li>
                <li><strong>Neon</strong>: hospedagem do banco de dados (Estados Unidos).</li>
                <li><strong>Brevo</strong>: envio dos e-mails da plataforma.</li>
              </ul>
              <p>Não vendemos dados e não usamos ferramentas de publicidade ou de rastreamento.</p>
            </>
          ),
        },
        {
          titulo: "Armazenamento no navegador",
          conteudo: (
            <p>
              Ao entrar, o seu navegador guarda uma credencial de acesso (token), que vale por algumas
              horas. Com “Lembrar-me” marcado, ela continua salva mesmo se você fechar o navegador; sem
              marcar, é apagada ao fechar a aba. Ao sair da conta, ela é removida. Não usamos cookies de
              rastreamento.
            </p>
          ),
        },
        {
          titulo: "Segurança",
          conteudo: (
            <p>
              A comunicação com o site é criptografada (HTTPS), assim como a conexão entre o servidor e
              o banco de dados. As senhas são guardadas só como <em>hash</em>, e cada ação é conferida
              pelo servidor: uma empresa não acessa candidatos de outra, e um estudante não acessa
              dados de outros estudantes.
            </p>
          ),
        },
        {
          titulo: "Por quanto tempo guardamos",
          conteudo: (
            <p>
              Enquanto a sua conta existir. Ao excluir a conta de um estudante, as candidaturas dele e o
              histórico delas são excluídos junto.
            </p>
          ),
        },
        {
          titulo: "Seus direitos",
          conteudo: (
            <>
              <p>
                Pela LGPD (art. 18), você pode pedir a confirmação de que tratamos seus dados, o acesso a
                eles, a correção de dados errados e a exclusão da sua conta e dos seus dados.
              </p>
              <p>Para isso, fale com {contato}.</p>
            </>
          ),
        },
        {
          titulo: "Projeto acadêmico",
          conteudo: (
            <p>
              O Emprega-IF é um projeto de extensão do IFMS, mantido por estudantes, e não um serviço
              oficial do Instituto Federal. Evite usar na plataforma a mesma senha de outros serviços.
            </p>
          ),
        },
      ]}
    />
  );
}
