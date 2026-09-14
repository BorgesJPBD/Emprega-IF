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
