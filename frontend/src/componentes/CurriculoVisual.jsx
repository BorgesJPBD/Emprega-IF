/* A "folha" do currículo no modelo da plataforma. Recebe só dados:
   - dados: o conteúdo do currículo (cidade, objetivo, formacao, ...)
   - contato: nome, e-mail, telefone e redes, que vêm do cadastro/perfil
   Fundo branco e texto escuro fixos, para ficar igual na tela e no PDF. */

   const telefone = (t) => (t ? `(${t.slice(0, 2)}) ${t.slice(2, -4)}-${t.slice(-4)}` : "");
   const semProtocolo = (url) => url.replace(/^https?:\/\/(www\.)?/, "");
   
   function Secao({ titulo, children }) {
     return (
       <section className="mt-5">
         <h3 className="border-b border-neutral-300 pb-1 text-[13px] font-extrabold uppercase tracking-wider text-neutral-700">
           {titulo}
         </h3>
         <div className="mt-2.5 space-y-3">{children}</div>
       </section>
     );
   }
   
   const juntar = (...partes) => partes.filter(Boolean).join(" · ");
   
   export default function CurriculoVisual({ dados, contato }) {
     const {
       cidade = "", objetivo = "", formacao = [], experiencias = [],
       cursos = [], habilidades = [], idiomas = [],
     } = dados;
   
     const linhaContato = [
       contato.email_if,
       telefone(contato.telefone),
       cidade,
       contato.linkedin_url && semProtocolo(contato.linkedin_url),
       contato.instagram_usuario && `Instagram @${contato.instagram_usuario}`,
     ].filter(Boolean);
   
     const vazio = !(objetivo || formacao.length || experiencias.length || cursos.length || habilidades.length || idiomas.length);
   
     return (
       <article className="curriculo-folha cartao bg-white p-6 text-[15px] leading-relaxed text-neutral-900 sm:p-9">
         <div>
           <p className="text-3xl font-extrabold leading-tight">{contato.nome}</p>
           {linhaContato.length > 0 && (
             <p className="mt-1.5 break-words text-[14px] text-neutral-700">{linhaContato.join("  |  ")}</p>
           )}
         </div>
   
         {vazio && (
           <p className="mt-6 text-neutral-500">A prévia do seu currículo aparece aqui conforme você preenche.</p>
         )}
   
         {objetivo && (
           <Secao titulo="Objetivo">
             <p className="whitespace-pre-line">{objetivo}</p>
           </Secao>
         )}
   
         {formacao.length > 0 && (
           <Secao titulo="Formação">
             {formacao.map((f, i) => (
               <div key={i}>
                 <p className="font-bold">{f.curso}</p>
                 <p className="text-neutral-700">{juntar(f.instituicao, f.periodo)}</p>
               </div>
             ))}
           </Secao>
         )}
   
         {experiencias.length > 0 && (
           <Secao titulo="Experiências e projetos">
             {experiencias.map((x, i) => (
               <div key={i}>
                 <p className="font-bold">{x.titulo}</p>
                 {juntar(x.organizacao, x.periodo) && (
                   <p className="text-neutral-700">{juntar(x.organizacao, x.periodo)}</p>
                 )}
                 {x.descricao && <p className="mt-0.5 whitespace-pre-line">{x.descricao}</p>}
               </div>
             ))}
           </Secao>
         )}
   
         {cursos.length > 0 && (
           <Secao titulo="Cursos e certificados">
             {cursos.map((c, i) => (
               <div key={i}>
                 <p className="font-bold">{c.nome}</p>
                 {juntar(c.instituicao, c.ano) && <p className="text-neutral-700">{juntar(c.instituicao, c.ano)}</p>}
               </div>
             ))}
           </Secao>
         )}
   
         {habilidades.length > 0 && (
           <Secao titulo="Habilidades">
             <p>{habilidades.join("  •  ")}</p>
           </Secao>
         )}
   
         {idiomas.length > 0 && (
           <Secao titulo="Idiomas">
             <p>{idiomas.map((i) => `${i.idioma} (${i.nivel})`).join("  •  ")}</p>
           </Secao>
         )}
       </article>
     );
   }