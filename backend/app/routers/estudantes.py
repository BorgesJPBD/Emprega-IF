"""UC01 - Cadastrar Perfil de Estudante."""

from fastapi import APIRouter, HTTPException, status
from psycopg import errors

from app.db import execute, query_one
from app.schemas import EstudanteCriar, EstudanteResposta
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
async def cadastrar_estudante(dados: EstudanteCriar):
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
    return estudante
