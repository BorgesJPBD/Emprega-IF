"""Candidaturas (UC02).

- O estudante logado se candidata; o estudante vem sempre do token,
  nunca do corpo da requisição.
- A empresa dona da vaga muda o andamento (Pendente -> Entrevista ->
  Finalizado).

As regras "só em vaga aberta" e "andamento válido" ficam no banco
(triggers da migration 005); aqui elas viram respostas HTTP. O histórico
de status também é gravado pelo banco, sem código nesta rota.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import errors

from app.db import query_all, query_one, transacao
from app.dependencias import Usuario, exigir_empresa, exigir_estudante
from app.schemas import CandidaturaCriar, CandidaturaResposta, CandidaturaStatus

router = APIRouter(prefix="/candidaturas", tags=["Candidaturas"])

JA_CANDIDATOU = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail={"campo": "vaga_id", "mensagem": "Você já se candidatou a esta vaga."},
)
SESSAO_EXPIRADA = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Sua sessão expirou. Entre novamente.",
)

# histórico em ordem, montado como lista JSON numa subconsulta
HISTORICO = """
    COALESCE((
        SELECT json_agg(json_build_object(
                   'status_anterior', h.status_anterior,
                   'status_novo',     h.status_novo,
                   'alterado_em',     h.alterado_em)
               ORDER BY h.alterado_em, h.id)
          FROM candidatura_historico h
         WHERE h.candidatura_id = c.id
    ), '[]'::json) AS historico
"""


@router.post(
    "",
    response_model=CandidaturaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Candidatar-se a uma vaga",
)
async def candidatar(
    dados: CandidaturaCriar, estudante: Usuario = Depends(exigir_estudante)
):
    vaga = await query_one("SELECT situacao FROM vagas WHERE id = %s", (dados.vaga_id,))
    if vaga is None or vaga["situacao"] == "Rascunho":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaga não encontrada.")

    try:
        async with transacao() as cur:
            await cur.execute(
                """
                INSERT INTO candidaturas (estudante_id, vaga_id)
                VALUES (%s, %s)
                RETURNING id
                """,
                (estudante.id, dados.vaga_id),
            )
            nova = await cur.fetchone()
    except errors.UniqueViolation:
        raise JA_CANDIDATOU  # UNIQUE (estudante_id, vaga_id)
    except errors.ForeignKeyViolation:
        raise SESSAO_EXPIRADA  # token de um estudante que não existe mais
    except errors.RaiseException as erro:
        # trigger tg_candidaturas_validar: vaga encerrada ou cadastro inativo
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=erro.diag.message_primary)

    return await _buscar(nova["id"])


async def _buscar(candidatura_id: UUID) -> dict:
    return await query_one(
        f"""
        SELECT c.id, c.vaga_id, c.status, c.data_inscricao,
               v.titulo AS vaga_titulo,
               COALESCE(e.nome_fantasia, e.razao_social) AS empresa_nome,
               {HISTORICO}
          FROM candidaturas c
          JOIN vagas v    ON v.id = c.vaga_id
          JOIN empresas e ON e.id = v.empresa_id
         WHERE c.id = %s
        """,
        (candidatura_id,),
    )


@router.get(
    "/minhas",
    response_model=list[CandidaturaResposta],
    summary="Candidaturas do estudante logado, com o histórico de status",
)
async def minhas_candidaturas(estudante: Usuario = Depends(exigir_estudante)):
    return await query_all(
        f"""
        SELECT c.id, c.vaga_id, c.status, c.data_inscricao,
               v.titulo AS vaga_titulo,
               COALESCE(e.nome_fantasia, e.razao_social) AS empresa_nome,
               {HISTORICO}
          FROM candidaturas c
          JOIN vagas v    ON v.id = c.vaga_id
          JOIN empresas e ON e.id = v.empresa_id
         WHERE c.estudante_id = %s
         ORDER BY c.data_inscricao DESC
        """,
        (estudante.id,),
    )


@router.patch(
    "/{candidatura_id}/status",
    response_model=CandidaturaResposta,
    summary="Mudar o andamento de uma candidatura (empresa dona da vaga)",
)
async def mudar_status(
    candidatura_id: UUID,
    dados: CandidaturaStatus,
    empresa: Usuario = Depends(exigir_empresa),
):
    dona = await query_one(
        """
        SELECT v.empresa_id
          FROM candidaturas c JOIN vagas v ON v.id = c.vaga_id
         WHERE c.id = %s
        """,
        (candidatura_id,),
    )
    if dona is None or dona["empresa_id"] != empresa.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidatura não encontrada.")

    try:
        async with transacao() as cur:
            await cur.execute(
                "UPDATE candidaturas SET status = %s WHERE id = %s",
                (dados.status, candidatura_id),
            )
    except errors.RaiseException as erro:
        # trigger tg_candidaturas_andamento: transição não permitida
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=erro.diag.message_primary)

    return await _buscar(candidatura_id)
