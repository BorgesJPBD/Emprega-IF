"""Validações de domínio usadas no cadastro (UC01, passo 3)."""

import re

from config import settings


def somente_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor or "")


def cpf_valido(cpf: str) -> bool:
    """Valida os dois dígitos verificadores do CPF."""
    digitos = somente_digitos(cpf)

    if len(digitos) != 11 or digitos == digitos[0] * 11:
        return False

    for posicao in (9, 10):
        soma = sum(
            int(digitos[i]) * (posicao + 1 - i) for i in range(posicao)
        )
        verificador = (soma * 10) % 11 % 10
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
