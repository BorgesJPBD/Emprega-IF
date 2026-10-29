"""E-mails da plataforma, enviados pela API HTTP do Brevo.

Por que API e não SMTP: o plano grátis do Render bloqueia as portas SMTP
(25, 465 e 587), então o envio tradicional (Gmail via SMTP) não funciona
lá. O Brevo recebe o e-mail por HTTPS e entrega; o plano grátis permite
300 e-mails por dia.

O envio roda em segundo plano (BackgroundTasks do FastAPI), depois que a
resposta já foi enviada: a tela não espera o e-mail, e uma falha no envio
nunca desfaz a candidatura. Sem BREVO_API_KEY configurada, nada é enviado
(útil no desenvolvimento) e só fica um aviso no log.
"""

import logging
from datetime import datetime
from html import escape
from zoneinfo import ZoneInfo

import httpx

from config import settings

log = logging.getLogger("uvicorn.error")

URL_BREVO = "https://api.brevo.com/v3/smtp/email"
FUSO = ZoneInfo("America/Campo_Grande")
VERDE = "#2f9e41"


async def enviar_email(para_email: str, para_nome: str, assunto: str, html: str, texto: str) -> bool:
    if not settings.BREVO_API_KEY or not settings.EMAIL_REMETENTE:
        log.info("E-mail não enviado (BREVO_API_KEY/EMAIL_REMETENTE não configurados): %s", assunto)
        return False
    try:
        async with httpx.AsyncClient(timeout=10) as cliente:
            resposta = await cliente.post(
                URL_BREVO,
                headers={"api-key": settings.BREVO_API_KEY, "accept": "application/json"},
                json={
                    "sender": {"email": settings.EMAIL_REMETENTE, "name": settings.EMAIL_REMETENTE_NOME},
                    "to": [{"email": para_email, "name": para_nome}],
                    "subject": assunto,
                    "htmlContent": html,
                    "textContent": texto,
                },
            )
        if resposta.status_code >= 300:
            log.warning("Brevo recusou o e-mail (%s): %s", resposta.status_code, resposta.text[:300])
            return False
        return True
    except httpx.HTTPError as erro:
        log.warning("Falha ao enviar e-mail: %s", erro)
        return False


def _modelo(titulo: str, paragrafos: list[str], botao_texto: str, botao_link: str) -> str:
    """HTML simples e com estilos inline: é o que os leitores de e-mail
    (Gmail, Outlook) exibem de forma confiável."""
    corpo = "".join(
        f'<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3f3f46">{p}</p>'
        for p in paragrafos
    )
    return f"""<!doctype html>
<html lang="pt-br"><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">
    <tr><td style="background:{VERDE};padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold">
      Emprega<span style="opacity:.75">-IF</span>
    </td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 18px;font-size:20px;color:#18181b">{titulo}</h1>
      {corpo}
      <p style="margin:24px 0 8px"><a href="{botao_link}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:bold">{botao_texto}</a></p>
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #f4f4f5;font-size:12px;color:#a1a1aa">
      Emprega-IF · Projeto de extensão do IFMS. Você recebeu este e-mail porque tem uma conta na plataforma.
    </td></tr>
  </table>
</td></tr></table>
</body></html>"""


async def confirmar_candidatura(email: str, nome: str, vaga: str, empresa: str, quando: datetime) -> None:
    primeiro_nome = escape(nome.split()[0])
    data = quando.astimezone(FUSO).strftime("%d/%m/%Y às %H:%M")
    link = f"{settings.SITE_URL}/minhas-candidaturas"
    html = _modelo(
        "Candidatura recebida!",
        [
            f"Olá, {primeiro_nome}!",
            f"Sua candidatura para a vaga <strong>{escape(vaga)}</strong>, da empresa "
            f"<strong>{escape(empresa)}</strong>, foi registrada em {data}.",
            "A empresa vai analisar o seu perfil. Você pode acompanhar o andamento "
            "a qualquer momento pela plataforma.",
        ],
        "Acompanhar candidatura",
        link,
    )
    texto = (
        f"Olá, {nome.split()[0]}!\n\nSua candidatura para a vaga {vaga}, da empresa {empresa}, "
        f"foi registrada em {data}.\n\nAcompanhe o andamento em: {link}\n\n"
        "Emprega-IF · Projeto de extensão do IFMS"
    )
    await enviar_email(email, nome, f"Candidatura recebida: {vaga}", html, texto)


MENSAGENS_STATUS = {
    "Entrevista": (
        "Você foi chamado para entrevista!",
        "A empresa <strong>{empresa}</strong> quer conversar com você sobre a vaga "
        "<strong>{vaga}</strong>. Fique de olho no seu e-mail e telefone: o contato "
        "para combinar a entrevista vem da própria empresa.",
    ),
    "Finalizado": (
        "Processo seletivo finalizado",
        "O processo seletivo da vaga <strong>{vaga}</strong>, da empresa "
        "<strong>{empresa}</strong>, foi finalizado para a sua candidatura. "
        "Obrigado pelo interesse! Continue explorando novas oportunidades.",
    ),
}


async def avisar_mudanca_status(email: str, nome: str, vaga: str, empresa: str, status: str) -> None:
    if status not in MENSAGENS_STATUS:
        return
    titulo, modelo = MENSAGENS_STATUS[status]
    paragrafo = modelo.format(vaga=escape(vaga), empresa=escape(empresa))
    link = f"{settings.SITE_URL}/minhas-candidaturas"
    html = _modelo(titulo, [f"Olá, {escape(nome.split()[0])}!", paragrafo], "Ver minhas candidaturas", link)
    texto = (
        f"Olá, {nome.split()[0]}!\n\n"
        + paragrafo.replace("<strong>", "").replace("</strong>", "")
        + f"\n\nVeja em: {link}\n\nEmprega-IF · Projeto de extensão do IFMS"
    )
    await enviar_email(email, nome, f"{titulo} · {vaga}", html, texto)


async def boas_vindas(email: str, nome: str, papel: str) -> None:
    """Enviado logo após o cadastro de estudante ou de empresa."""
    if papel == "empresa":
        saudacao = f"Olá, equipe {escape(nome)}!"
        texto_principal = (
            "O cadastro da sua empresa no Emprega-IF foi concluído. Agora você já pode "
            "publicar vagas de estágio e jovem aprendiz para estudantes do IF e "
            "acompanhar os candidatos pelo painel."
        )
        botao, link = "Publicar a primeira vaga", f"{settings.SITE_URL}/vagas/nova"
        nome_texto = nome
    else:
        saudacao = f"Olá, {escape(nome.split()[0])}!"
        texto_principal = (
            "Seu cadastro no Emprega-IF foi concluído. Agora você já pode se candidatar "
            "às vagas de estágio e jovem aprendiz e acompanhar cada etapa pela plataforma."
        )
        botao, link = "Ver vagas abertas", f"{settings.SITE_URL}/vagas"
        nome_texto = nome.split()[0]
    html = _modelo(
        "Cadastro concluído",
        [saudacao, texto_principal,
         f"Para entrar, use o e-mail <strong>{escape(email)}</strong> e a senha que você criou."],
        botao, link,
    )
    texto = (
        f"Olá, {nome_texto}!\n\n{texto_principal}\n\nPara entrar, use o e-mail {email} "
        f"e a senha que você criou.\n\n{link}\n\nEmprega-IF · Projeto de extensão do IFMS"
    )
    await enviar_email(email, nome, "Bem-vindo ao Emprega-IF", html, texto)


async def link_redefinir_senha(email: str, nome: str, link: str) -> None:
    """Link de uso único para criar uma nova senha (vale por 1 hora)."""
    primeiro_nome = nome.split()[0]
    html = _modelo(
        "Crie uma nova senha",
        [
            f"Olá, {escape(primeiro_nome)}!",
            "Recebemos um pedido para criar uma nova senha na sua conta do Emprega-IF. "
            "Clique no botão abaixo para escolher a nova senha.",
            "O link vale por <strong>1 hora</strong> e só pode ser usado uma vez. "
            "Se não foi você que pediu, ignore este e-mail: sua senha atual continua valendo.",
        ],
        "Criar nova senha",
        link,
    )
    texto = (
        f"Olá, {primeiro_nome}!\n\nPara criar uma nova senha no Emprega-IF, acesse:\n{link}\n\n"
        "O link vale por 1 hora e só pode ser usado uma vez. Se não foi você que pediu, "
        "ignore este e-mail.\n\nEmprega-IF · Projeto de extensão do IFMS"
    )
    await enviar_email(email, nome, "Criar uma nova senha no Emprega-IF", html, texto)


def email_configurado() -> bool:
    return bool(settings.BREVO_API_KEY and settings.EMAIL_REMETENTE)
