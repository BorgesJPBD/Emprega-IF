"""Senha e token (RN-05: autenticação segura).

A senha nunca é gravada em texto puro: o banco guarda só o hash bcrypt,
que é de mão única. Na verificação, a senha digitada é reprocessada e
comparada com o hash.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from config import settings


def gerar_hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def senha_confere(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))


def criar_token(sujeito: str, papel: str, minutos: int | None = None) -> str:
    """Token JWT com o id do usuário e o papel (estudante ou empresa).

    `minutos` permite estender a validade quando a pessoa marca
    "Lembrar-me" na tela de login.
    """
    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=minutos or settings.JWT_EXPIRA_MINUTOS
    )
    payload = {"sub": sujeito, "papel": papel, "exp": expira_em}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITMO)
