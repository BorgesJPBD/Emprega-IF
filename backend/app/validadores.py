"""Validações de domínio usadas no cadastro (UC01, passo 3)."""

import re
from urllib.parse import urlparse

from config import settings


def somente_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor or "")


def cpf_valido(cpf: str) -> bool:
    """Valida os dois dígitos verificadores do CPF."""
    digitos = somente_digitos(cpf)

    if len(digitos) != 11 or digitos == digitos[0] * 11:
        return False

    for posicao in (9, 10):
        soma = sum(int(digitos[i]) * (posicao + 1 - i) for i in range(posicao))
        verificador = (soma * 10) % 11 % 10
        if verificador != int(digitos[posicao]):
            return False

    return True


def cnpj_valido(cnpj: str) -> bool:
    """Valida os dois dígitos verificadores do CNPJ."""
    digitos = somente_digitos(cnpj)

    if len(digitos) != 14 or digitos == digitos[0] * 14:
        return False

    pesos_primeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos_segundo = [6] + pesos_primeiro

    for pesos, posicao in ((pesos_primeiro, 12), (pesos_segundo, 13)):
        soma = sum(int(digitos[i]) * pesos[i] for i in range(posicao))
        resto = soma % 11
        verificador = 0 if resto < 2 else 11 - resto
        if verificador != int(digitos[posicao]):
            return False

    return True


def email_institucional(email: str) -> bool:
    """Confere o vínculo com o IF pelo domínio do e-mail.
    Lista vazia em DOMINIOS_EMAIL_PERMITIDOS libera qualquer domínio."""
    permitidos = settings.DOMINIOS_EMAIL_PERMITIDOS
    if not permitidos:
        return True

    dominio = email.split("@")[-1].lower()
    return any(
        dominio == permitido.lower() or dominio.endswith("." + permitido.lower())
        for permitido in permitidos
    )


def normalizar_linkedin(valor: str | None) -> str | None:
    """Aceita o link do perfil com ou sem https://, com ou sem www e com
    barra no fim, e devolve sempre https://www.linkedin.com/in/<perfil>.
    Vazio vira None (remove o link). Qualquer outro endereço é recusado."""
    valor = (valor or "").strip()
    if not valor:
        return None
    if "://" not in valor:
        valor = "https://" + valor
    partes = urlparse(valor)
    dominio = (partes.hostname or "").lower()
    caminho = re.fullmatch(r"/in/([A-Za-z0-9%_-]{3,100})/?", partes.path)
    if (
        partes.scheme not in ("http", "https")
        or not (dominio == "linkedin.com" or dominio.endswith(".linkedin.com"))
        or not caminho
    ):
        raise ValueError("Informe o link do seu perfil, como linkedin.com/in/seu-nome.")
    return f"https://www.linkedin.com/in/{caminho.group(1)}"


_INSTAGRAM_RESERVADOS = {
    "p",
    "reel",
    "reels",
    "explore",
    "stories",
    "accounts",
    "tv",
    "direct",
}


def normalizar_instagram(valor: str | None) -> str | None:
    """Aceita @usuario, usuario ou o link do perfil e devolve só o usuário,
    em minúsculas e sem @. Vazio vira None (remove o usuário)."""
    valor = (valor or "").strip()
    if not valor:
        return None

    if valor.startswith("@"):
        usuario = valor[1:]
    elif "instagram.com" in valor.lower():
        if "://" not in valor:
            valor = "https://" + valor
        partes = urlparse(valor)
        dominio = (partes.hostname or "").lower()
        if partes.scheme not in ("http", "https") or not (
            dominio == "instagram.com" or dominio.endswith(".instagram.com")
        ):
            raise ValueError("Informe o seu usuário do Instagram, como @seu.usuario.")
        segmentos = [s for s in partes.path.split("/") if s]
        usuario = segmentos[0] if segmentos else ""
    else:
        usuario = valor

    usuario = usuario.lower()
    if usuario in _INSTAGRAM_RESERVADOS or not re.fullmatch(
        r"[a-z0-9._]{1,30}", usuario
    ):
        raise ValueError("Informe o seu usuário do Instagram, como @seu.usuario.")
    return usuario
