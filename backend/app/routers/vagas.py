"""Vagas: listagem pública e UC03 - Publicar Vaga.

Quem pode o quê:
  - listar e ver detalhes: qualquer pessoa, sem login
    ("Explore as oportunidades sem precisar fazer login")
  - publicar: só empresa logada; a vaga fica ligada à empresa do token,
    nunca a um id enviado pelo navegador.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg import errors

from app.db import execute, query_all, query_one
from app.dependencias import Usuario, exigir_empresa
from app.schemas import (
    AREAS,
    MODALIDADES,
    TIPOS_VAGA,
    TIPOS_VAGA_TELA,
    VagaCriar,
    VagaResposta,
)

router = APIRouter(prefix="/vagas", tags=["Vagas"])

# Colunas devolvidas em todas as consultas de vaga, já com o nome da empresa.
COLUNAS = """
    v.id, v.titulo, v.tipo, v.area, v.localizacao, v.modalidade,
    v.horario_entrada, v.horario_saida, v.carga_horaria, v.remuneracao,
    v.numero_vagas, v.descricao, v.requisitos, v.diferenciais, v.beneficios,
    v.situacao, v.data_publicacao, v.prazo_inscricao,
    v.empresa_id, COALESCE(e.nome_fantasia, e.razao_social) AS empresa_nome
"""

# Vaga aberta = ativa e com prazo ainda não vencido.
ABERTA = """
    v.situacao = 'Ativa'
    AND (v.prazo_inscricao IS NULL OR v.prazo_inscricao >= CURRENT_DATE)
"""

SQL_INSERIR = """
    INSERT INTO vagas
        (empresa_id, titulo, tipo, area, localizacao, modalidade,
         horario_entrada, horario_saida, carga_horaria, remuneracao,
         beneficios, descricao, requisitos, diferenciais,
         prazo_inscricao, numero_vagas, situacao, data_publicacao)
    VALUES
        (%(empresa_id)s, %(titulo)s, %(tipo)s, %(area)s, %(localizacao)s,
         %(modalidade)s, %(horario_entrada)s, %(horario_saida)s,
         %(carga_horaria)s, %(remuneracao)s, %(beneficios)s, %(descricao)s,
         %(requisitos)s, %(diferenciais)s, %(prazo_inscricao)s,
         %(numero_vagas)s, 'Ativa', now())
    RETURNING id
"""


def _linhas(texto: str | None) -> list[str]:
    return [item for item in (texto or "").splitlines() if item.strip()]


def _formatar(linha: dict) -> dict:
    """Linha do banco -> formato da resposta (listas e rótulos da tela)."""
    return {
        **linha,
        "tipo": TIPOS_VAGA_TELA.get(linha["tipo"], linha["tipo"]),
        "remuneracao": float(linha["remuneracao"]) if linha["remuneracao"] is not None else None,
        "requisitos": _linhas(linha["requisitos"]),
        "diferenciais": _linhas(linha["diferenciais"]),
        "beneficios": _linhas(linha["beneficios"]),
    }


async def buscar_vaga(vaga_id: UUID) -> dict | None:
    linha = await query_one(
        f"SELECT {COLUNAS} FROM vagas v JOIN empresas e ON e.id = v.empresa_id "
        "WHERE v.id = %s AND v.situacao <> 'Rascunho'",
        (vaga_id,),
    )
    return _formatar(linha) if linha else None


@router.get("/opcoes", summary="Valores aceitos nos campos de tipo, área e modalidade")
async def opcoes():
    return {"tipos": list(TIPOS_VAGA), "areas": AREAS, "modalidades": MODALIDADES}


@router.get("", response_model=list[VagaResposta], summary="Listar vagas abertas")
async def listar_vagas(
    tipo: str | None = Query(None, description="Estágio ou Jovem aprendiz"),
    area: str | None = None,
    localizacao: str | None = None,
    limite: int = Query(50, ge=1, le=100),
):
    """Vagas ativas e dentro do prazo, mais recentes primeiro.
    Filtros vazios são ignorados."""
    condicoes = [ABERTA]
    params: list = []

    if tipo:
        condicoes.append("v.tipo = %s")
        params.append(TIPOS_VAGA.get(tipo, tipo))
    if area:
        condicoes.append("v.area = %s")
        params.append(area)
    if localizacao:
        condicoes.append("v.localizacao = %s")
        params.append(localizacao)

    params.append(limite)
    # Só os trechos fixos acima entram na string; os valores vão como %s.
    linhas = await query_all(
        f"SELECT {COLUNAS} FROM vagas v JOIN empresas e ON e.id = v.empresa_id "
        f"WHERE {' AND '.join(condicoes)} "
        "ORDER BY v.data_publicacao DESC NULLS LAST LIMIT %s",
        tuple(params),
    )
    return [_formatar(linha) for linha in linhas]


@router.get("/{vaga_id}", response_model=VagaResposta, summary="Detalhes de uma vaga")
async def detalhar_vaga(vaga_id: UUID):
    vaga = await buscar_vaga(vaga_id)
    if vaga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaga não encontrada.")
    return vaga


@router.get(
    "/{vaga_id}/parecidas",
    response_model=list[VagaResposta],
    summary="Vagas abertas do mesmo tipo ou área",
)
async def vagas_parecidas(vaga_id: UUID, limite: int = Query(3, ge=1, le=12)):
    linhas = await query_all(
        f"""
        SELECT {COLUNAS}
          FROM vagas v
          JOIN empresas e ON e.id = v.empresa_id
          JOIN vagas ref ON ref.id = %s
         WHERE {ABERTA}
           AND v.id <> ref.id
           AND (v.tipo = ref.tipo OR v.area = ref.area)
         ORDER BY (v.area = ref.area) DESC, v.data_publicacao DESC
         LIMIT %s
        """,
        (vaga_id, limite),
    )
    return [_formatar(linha) for linha in linhas]


@router.post(
    "",
    response_model=VagaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Publicar vaga (empresa)",
)
async def publicar_vaga(dados: VagaCriar, empresa: Usuario = Depends(exigir_empresa)):
    try:
        nova = await execute(
            SQL_INSERIR,
            {
                **dados.model_dump(exclude={"aceite_termos"}),
                "empresa_id": empresa.id,
            },
            returning=True,
        )
    except errors.ForeignKeyViolation:
        # token válido de uma empresa que não existe mais no banco
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sua sessão expirou. Entre novamente.",
        )
    return await buscar_vaga(nova["id"])
