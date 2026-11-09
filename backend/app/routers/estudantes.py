"""UC01 - Cadastrar Perfil de Estudante."""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from psycopg import errors
from psycopg.types.json import Jsonb

from app.db import execute, query_one
from app.dependencias import Usuario, exigir_estudante
from app.notificacoes import boas_vindas
from app.schemas import (
    EstudanteCriar,
    EstudanteResposta,
    PerfilAtualizar,
    PerfilEstudante,
)
from app.schemas_curriculo import CurriculoDados, CurriculoResposta
from app.seguranca import gerar_hash_senha

router = APIRouter(prefix="/estudantes", tags=["Estudantes"])

SQL_INSERIR = """
    INSERT INTO estudantes
        (nome, cpf, curso, email_if, senha_hash, periodo, instituicao, telefone)
    VALUES
        (%(nome)s, %(cpf)s, %(curso)s, %(email_if)s, %(senha_hash)s,
         %(periodo)s, %(instituicao)s, %(telefone)s)
    RETURNING id, nome, email_if, curso, periodo, instituicao
"""


@router.post(
    "",
    response_model=EstudanteResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar perfil de estudante",
)
async def cadastrar_estudante(dados: EstudanteCriar, tarefas: BackgroundTasks):
    """Cria o perfil do estudante.

    As exceções previstas no UC01 viram respostas HTTP:
      - dados inválidos / falha na validação de vínculo -> 422 (Pydantic)
      - e-mail ou CPF já cadastrado                     -> 409
    """
    # Checagem antecipada, para responder com uma mensagem clara por campo.
    existente = await query_one(
        "SELECT email_if, cpf FROM estudantes WHERE email_if = %s OR cpf = %s",
        (dados.email_if, dados.cpf),
    )
    if existente:
        campo = "email_if" if existente["email_if"] == dados.email_if else "cpf"
        mensagem = (
            "Este e-mail já possui cadastro."
            if campo == "email_if"
            else "Este CPF já possui cadastro."
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"campo": campo, "mensagem": mensagem},
        )

    try:
        estudante = await execute(
            SQL_INSERIR,
            {
                "nome": dados.nome,
                "cpf": dados.cpf,
                "curso": dados.curso,
                "email_if": dados.email_if,
                "senha_hash": gerar_hash_senha(dados.senha),
                "periodo": dados.periodo,
                "instituicao": dados.instituicao,
                "telefone": dados.telefone,
            },
            returning=True,
        )
    except errors.UniqueViolation:
        # Rede de segurança: alguém pode cadastrar o mesmo e-mail no
        # intervalo entre a checagem acima e o INSERT.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"campo": "email_if", "mensagem": "Este e-mail já possui cadastro."},
        )

    # UC01 passos 5 e 6 (e-mail de confirmação e ativação por link) ficam
    # para a próxima etapa; por ora o cadastro já nasce ativo.
    # e-mail de boas-vindas em segundo plano: a tela não espera o envio
    tarefas.add_task(boas_vindas, estudante["email_if"], estudante["nome"], "estudante")
    return estudante


# ------------------------------------------------------------------
# Perfil do estudante logado (LinkedIn e Instagram, opcionais)
# ------------------------------------------------------------------

COLUNAS_PERFIL = """
    id, nome, email_if, telefone, instituicao, curso, periodo,
    linkedin_url, instagram_usuario
"""

SESSAO_EXPIRADA = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Sua sessão expirou. Entre novamente.",
)


@router.get("/me", response_model=PerfilEstudante, summary="Perfil do estudante logado")
async def meu_perfil(estudante: Usuario = Depends(exigir_estudante)):
    perfil = await query_one(
        f"SELECT {COLUNAS_PERFIL} FROM estudantes WHERE id = %s", (estudante.id,)
    )
    if perfil is None:
        raise SESSAO_EXPIRADA  # token de um estudante que não existe mais
    return perfil


@router.patch(
    "/me",
    response_model=PerfilEstudante,
    summary="Atualizar o LinkedIn e o Instagram do perfil",
)
async def atualizar_perfil(
    dados: PerfilAtualizar, estudante: Usuario = Depends(exigir_estudante)
):
    """Os dois campos são opcionais: vazio remove o link. O formato é
    conferido e padronizado pelo schema, e de novo pelo CHECK do banco."""
    perfil = await execute(
        f"""
        UPDATE estudantes
           SET linkedin_url = %s, instagram_usuario = %s
         WHERE id = %s
        RETURNING {COLUNAS_PERFIL}
        """,
        (dados.linkedin_url, dados.instagram_usuario, estudante.id),
        returning=True,
    )
    if perfil is None:
        raise SESSAO_EXPIRADA
    return perfil


# ------------------------------------------------------------------
# Currículo do estudante logado (opcional, modelo da plataforma)
#
# Guardado como dados (JSON), uma linha por estudante. O estudante
# cria, edita e apaga quando quiser; se a conta for excluída, o
# ON DELETE CASCADE da tabela leva o currículo junto.
# ------------------------------------------------------------------


@router.get(
    "/me/curriculo",
    response_model=CurriculoResposta | None,
    summary="Currículo do estudante logado (null se ainda não criou)",
)
async def meu_curriculo(estudante: Usuario = Depends(exigir_estudante)):
    return await query_one(
        "SELECT dados, atualizado_em FROM curriculos WHERE estudante_id = %s",
        (estudante.id,),
    )


@router.put(
    "/me/curriculo",
    response_model=CurriculoResposta,
    summary="Criar ou atualizar o currículo",
)
async def salvar_curriculo(
    dados: CurriculoDados, estudante: Usuario = Depends(exigir_estudante)
):
    try:
        curriculo = await execute(
            """
            INSERT INTO curriculos (estudante_id, dados)
            VALUES (%s, %s)
            ON CONFLICT (estudante_id)
            DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = now()
            RETURNING dados, atualizado_em
            """,
            (estudante.id, Jsonb(dados.model_dump())),
            returning=True,
        )
    except errors.ForeignKeyViolation:
        raise SESSAO_EXPIRADA  # token de um estudante que não existe mais
    return curriculo


@router.delete(
    "/me/curriculo",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Apagar o currículo",
)
async def apagar_curriculo(estudante: Usuario = Depends(exigir_estudante)):
    await execute("DELETE FROM curriculos WHERE estudante_id = %s", (estudante.id,))
