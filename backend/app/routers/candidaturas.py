"""Candidaturas - o estudante logado se candidata a uma vaga (UC02).

O estudante vem sempre do token, nunca do corpo da requisição: assim
ninguém consegue candidatar outra pessoa trocando um id no navegador.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import errors

from app.db import execute, query_all, query_one
from app.dependencias import Usuario, exigir_estudante
from app.schemas import CandidaturaCriar, CandidaturaResposta

router = APIRouter(prefix="/candidaturas", tags=["Candidaturas"])

JA_CANDIDATOU = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail={"campo": "vaga_id", "mensagem": "Você já se candidatou a esta vaga."},
)


@router.post(
    "",
    response_model=CandidaturaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Candidatar-se a uma vaga",
)
async def candidatar(
    dados: CandidaturaCriar, estudante: Usuario = Depends(exigir_estudante)
):
    vaga = await query_one(
        """
        SELECT situacao,
               prazo_inscricao IS NOT NULL AND prazo_inscricao < CURRENT_DATE AS vencida
          FROM vagas
         WHERE id = %s
        """,
        (dados.vaga_id,),
    )
    if vaga is None or vaga["situacao"] == "Rascunho":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaga não encontrada.")
    if vaga["situacao"] != "Ativa" or vaga["vencida"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="As inscrições para esta vaga estão encerradas.",
        )

    try:
        return await execute(
            """
            INSERT INTO candidaturas (estudante_id, vaga_id)
            VALUES (%s, %s)
            RETURNING id, vaga_id, status, data_inscricao
            """,
            (estudante.id, dados.vaga_id),
            returning=True,
        )
    except errors.UniqueViolation:
        # UNIQUE (estudante_id, vaga_id) no schema.sql
        raise JA_CANDIDATOU
    except errors.ForeignKeyViolation:
        # token válido de um estudante que não existe mais no banco
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sua sessão expirou. Entre novamente.",
        )


@router.get(
    "/minhas",
    response_model=list[CandidaturaResposta],
    summary="Candidaturas do estudante logado",
)
async def minhas_candidaturas(estudante: Usuario = Depends(exigir_estudante)):
    return await query_all(
        """
        SELECT c.id, c.vaga_id, c.status, c.data_inscricao,
               v.titulo AS vaga_titulo,
               COALESCE(e.nome_fantasia, e.razao_social) AS empresa_nome
          FROM candidaturas c
          JOIN vagas v    ON v.id = c.vaga_id
          JOIN empresas e ON e.id = v.empresa_id
         WHERE c.estudante_id = %s
         ORDER BY c.data_inscricao DESC
        """,
        (estudante.id,),
    )
