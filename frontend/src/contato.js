/* E-mail de contato da equipe, exibido nas páginas Quem somos, Termos e
   Privacidade. Defina VITE_EMAIL_CONTATO no Render (serviço emprega-if) ou
   no .env do frontend. Sem ele, as páginas indicam a coordenação do projeto. */
export const EMAIL_CONTATO = (import.meta.env.VITE_EMAIL_CONTATO || "").trim();
