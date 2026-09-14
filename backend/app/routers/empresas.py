from fastapi import APIRouter, HTTPException, status
from psycopg import errors

from app.db import execute, query_one
from app.schemas import SETORES, EmpresaCriar, EmpresaResposta
from app.seguranca import gerar_hash_senha

router = APIRouter(prefix="/empresas", tags=["Empresas"])

SQL_INSERIR = """
    INSERT INTO empresas
        (razao_social, nome_fantasia, cnpj, setor, email_contato,
         telefone, endereco, senha_hash)
    VALUES
        (%(razao_social)s, %(nome_fantasia)s, %(cnpj)s, %(setor)s,
         %(email_contato)s, %(telefone)s, %(endereco)s, %(senha_hash)s)
    RETURNING id, razao_social, nome_fantasia, email_contato, setor
"""


@router.get("/setores", summary="Setores de atuação aceitos")
async def listar_setores() -> list[str]:
    return SETORES


@router.post(
    "",
    response_model=EmpresaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar perfil de empresa",
)
async def cadastrar_empresa(dados: EmpresaCriar):
    existente = await query_one(
        "SELECT cnpj, email_contato FROM empresas WHERE cnpj = %s OR email_contato = %s",
        (dados.cnpj, dados.email_contato),
    )
    if existente:
        campo = "cnpj" if existente["cnpj"] == dados.cnpj else "email_contato"
        mensagem = (
            "Este CNPJ já possui cadastro."
            if campo == "cnpj"
            else "Este e-mail já possui cadastro."
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"campo": campo, "mensagem": mensagem},
        )

    try:
        empresa = await execute(
            SQL_INSERIR,
            {
                "razao_social": dados.razao_social,
                "nome_fantasia": dados.nome_fantasia,
                "cnpj": dados.cnpj,
                "setor": dados.setor,
                "email_contato": dados.email_contato,
                "telefone": dados.telefone,
                "endereco": dados.endereco,
                "senha_hash": gerar_hash_senha(dados.senha),
            },
            returning=True,
        )
    except errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"campo": "cnpj", "mensagem": "Esta empresa já possui cadastro."},
        )

    return empresa