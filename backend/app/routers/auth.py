"""Autenticar-se (Login) - caso de uso incluído por UC02 e UC03.

Decisão de segurança adotada aqui: a resposta de erro é sempre a mesma,
"E-mail ou senha inválidos", sem dizer qual dos dois está errado. Dizer
"e-mail não encontrado" entregaria a quem tentasse adivinhar a lista de
quem tem conta na plataforma.
"""

import bcrypt
from fastapi import APIRouter, HTTPException, status

from app.db import query_one
from app.schemas import LoginEntrada, LoginResposta
from app.seguranca import criar_token, senha_confere
from config import settings

router = APIRouter(prefix="/auth", tags=["Autenticação"])

# Hash descartável, usado só para gastar o mesmo tempo de processamento
# quando o e-mail não existe. Sem isso, a diferença de tempo de resposta
# denunciaria quais e-mails estão cadastrados.
_HASH_FALSO = bcrypt.hashpw(b"senha-inexistente", bcrypt.gensalt()).decode()

SQL_ESTUDANTE = """
    SELECT id, nome, email_if AS email, senha_hash, ativo
      FROM estudantes
     WHERE email_if = %s
"""

SQL_EMPRESA = """
    SELECT id, razao_social AS nome, email_contato AS email, senha_hash, TRUE AS ativo
      FROM empresas
     WHERE email_contato = %s
"""

CREDENCIAIS_INVALIDAS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="E-mail ou senha inválidos.",
    headers={"WWW-Authenticate": "Bearer"},
)


@router.post("/login", response_model=LoginResposta, summary="Autenticar-se")
async def login(dados: LoginEntrada):
    email = dados.email.lower()

    usuario = await query_one(SQL_ESTUDANTE, (email,))
    papel = "estudante"

    if usuario is None:
        usuario = await query_one(SQL_EMPRESA, (email,))
        papel = "empresa"

    if usuario is None:
        senha_confere(dados.senha, _HASH_FALSO)  # equaliza o tempo de resposta
        raise CREDENCIAIS_INVALIDAS

    if not senha_confere(dados.senha, usuario["senha_hash"]):
        raise CREDENCIAIS_INVALIDAS

    if not usuario["ativo"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cadastro ainda não ativado. Verifique seu e-mail.",
        )

    # "Lembrar-me" estende a sessão para 30 dias.
    minutos = 60 * 24 * 30 if dados.lembrar_me else settings.JWT_EXPIRA_MINUTOS

    return {
        "access_token": criar_token(str(usuario["id"]), papel, minutos),
        "token_type": "bearer",
        "expira_em_minutos": minutos,
        "usuario": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
            "papel": papel,
        },
    }
