"""Autenticar-se (Login) - caso de uso incluído por UC02 e UC03.

Decisão de segurança adotada aqui: a resposta de erro é sempre a mesma,
"E-mail ou senha inválidos", sem dizer qual dos dois está errado. Dizer
"e-mail não encontrado" entregaria a quem tentasse adivinhar a lista de
quem tem conta na plataforma.
"""

import hashlib
import secrets

import bcrypt
from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.db import query_one, transacao
from app.notificacoes import link_redefinir_senha
from app.schemas import LoginEntrada, LoginResposta, RecuperarSenhaEntrada, RedefinirSenhaEntrada
from app.seguranca import criar_token, gerar_hash_senha, senha_confere
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


# ------------------------------------------------------------------
# Recuperação de senha (migration 007)
#
# 1. POST /auth/recuperar-senha: gera um código aleatório, guarda só o
#    hash dele no banco e manda o link por e-mail.
# 2. POST /auth/redefinir-senha: confere o código (existe, não foi
#    usado, não venceu), troca a senha e marca o código como usado.
#
# A resposta do passo 1 é sempre a mesma, exista o e-mail ou não, pelo
# mesmo motivo do login: não revelar quem tem conta na plataforma.
# ------------------------------------------------------------------

MENSAGEM_RECUPERACAO = (
    "Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha. "
    "Confira também a caixa de spam."
)

LINK_INVALIDO = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Este link é inválido ou já expirou. Peça um novo na tela de login.",
)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/recuperar-senha", summary="Pedir link para criar nova senha")
async def recuperar_senha(dados: RecuperarSenhaEntrada, tarefas: BackgroundTasks):
    email = dados.email.lower()

    usuario = await query_one(SQL_ESTUDANTE, (email,))
    coluna = "estudante_id"
    if usuario is None:
        usuario = await query_one(SQL_EMPRESA, (email,))
        coluna = "empresa_id"
    if usuario is None:
        return {"mensagem": MENSAGEM_RECUPERACAO}

    token = secrets.token_urlsafe(32)

    # `coluna` só pode ser um dos dois nomes fixos acima; os valores vão
    # sempre como parâmetro.
    async with transacao() as cur:
        # um pedido novo invalida os anteriores que ainda estavam abertos
        await cur.execute(
            f"UPDATE redefinicoes_senha SET usado_em = now() WHERE {coluna} = %s AND usado_em IS NULL",
            (usuario["id"],),
        )
        await cur.execute(
            f"INSERT INTO redefinicoes_senha ({coluna}, token_hash, expira_em) "
            "VALUES (%s, %s, now() + interval '1 hour')",
            (usuario["id"], _hash_token(token)),
        )

    link = f"{settings.SITE_URL}/redefinir-senha?token={token}"
    tarefas.add_task(link_redefinir_senha, usuario["email"], usuario["nome"], link)
    return {"mensagem": MENSAGEM_RECUPERACAO}


@router.post("/redefinir-senha", summary="Criar nova senha com o link recebido")
async def redefinir_senha(dados: RedefinirSenhaEntrada):
    async with transacao() as cur:
        # FOR UPDATE: dois cliques no mesmo link não trocam a senha duas vezes
        await cur.execute(
            """
            SELECT id, estudante_id, empresa_id
              FROM redefinicoes_senha
             WHERE token_hash = %s AND usado_em IS NULL AND expira_em > now()
               FOR UPDATE
            """,
            (_hash_token(dados.token),),
        )
        pedido = await cur.fetchone()
        if pedido is None:
            raise LINK_INVALIDO

        novo_hash = gerar_hash_senha(dados.senha)
        if pedido["estudante_id"]:
            await cur.execute(
                "UPDATE estudantes SET senha_hash = %s WHERE id = %s",
                (novo_hash, pedido["estudante_id"]),
            )
        else:
            await cur.execute(
                "UPDATE empresas SET senha_hash = %s WHERE id = %s",
                (novo_hash, pedido["empresa_id"]),
            )
        await cur.execute(
            "UPDATE redefinicoes_senha SET usado_em = now() WHERE id = %s", (pedido["id"],)
        )

    return {"mensagem": "Senha alterada. Você já pode entrar com a nova senha."}
