"""Vagas: listagem pública, UC03 - Publicar Vaga e gestão pela empresa.

Quem pode o quê:
  - listar, buscar e ver detalhes: qualquer pessoa, sem login
    ("Explore as oportunidades sem precisar fazer login")
  - publicar, mudar a situação e ver candidatos: só a empresa dona da
    vaga; a empresa vem do token, nunca de um id enviado pelo navegador.

As leituras usam a view vw_vagas (migration 006), que já junta empresa,
área e as listas de requisitos, diferenciais e benefícios.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg import errors

from app.db import query_all, query_one, transacao
from app.dependencias import Usuario, exigir_empresa
from app.schemas import (
    MODALIDADES,
    TIPOS_VAGA,
    TIPOS_VAGA_TELA,
    Candidato,
    VagaCriar,
    VagaResposta,
    VagaSituacao,
)

router = APIRouter(prefix="/vagas", tags=["Vagas"])

COLUNAS = """
    id, titulo, tipo, area, localizacao, modalidade, horario_entrada,
    horario_saida, carga_horaria, remuneracao, numero_vagas, descricao,
    requisitos, diferenciais, beneficios, situacao, inscricoes_abertas,
    data_publicacao, prazo_inscricao, empresa_id, empresa_nome
"""

VAGA_NAO_ENCONTRADA = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Vaga não encontrada."
)


def _formatar(linha: dict) -> dict:
    """Linha da view -> resposta da API (rótulos da tela)."""
    return {
        **linha,
        "tipo": TIPOS_VAGA_TELA.get(linha["tipo"], linha["tipo"]),
        "remuneracao": float(linha["remuneracao"]) if linha["remuneracao"] is not None else None,
    }


def _erro_de_regra(erro: errors.RaiseException) -> HTTPException:
    """Regra recusada por um trigger (RAISE EXCEPTION). A mensagem foi
    escrita no banco em português e vai direto para a tela."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT, detail=erro.diag.message_primary
    )


async def buscar_vaga(vaga_id: UUID) -> dict | None:
    linha = await query_one(
        f"SELECT {COLUNAS} FROM vw_vagas WHERE id = %s AND situacao <> 'Rascunho'",
        (vaga_id,),
    )
    return _formatar(linha) if linha else None


async def _vaga_da_empresa(vaga_id: UUID, empresa: Usuario) -> None:
    """404 se a vaga não existe ou é de outra empresa (não revela qual)."""
    dona = await query_one("SELECT empresa_id FROM vagas WHERE id = %s", (vaga_id,))
    if dona is None or dona["empresa_id"] != empresa.id:
        raise VAGA_NAO_ENCONTRADA


@router.get("/opcoes", summary="Valores aceitos nos campos de tipo, área e modalidade")
async def opcoes():
    areas = await query_all("SELECT nome FROM areas ORDER BY id")
    return {
        "tipos": list(TIPOS_VAGA),
        "areas": [a["nome"] for a in areas],
        "modalidades": MODALIDADES,
    }


def _escapar_like(texto: str) -> str:
    """% e _ digitados pelo usuário viram caracteres comuns no ILIKE."""
    return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("", response_model=list[VagaResposta], summary="Listar e buscar vagas abertas")
async def listar_vagas(
    q: str | None = Query(None, max_length=100, description="Palavras para buscar no título e na descrição"),
    tipo: str | None = Query(None, description="Estágio ou Jovem aprendiz"),
    area: str | None = None,
    localizacao: str | None = None,
    limite: int = Query(50, ge=1, le=100),
):
    """Vagas com inscrições abertas. Sem `q`, as mais recentes primeiro;
    com `q`, as mais relevantes primeiro (título pesa mais que descrição).
    Filtros vazios são ignorados."""
    condicoes = ["inscricoes_abertas"]
    params: list = []
    ordem = "data_publicacao DESC NULLS LAST"

    if q and q.strip():
        # websearch_to_tsquery aceita texto livre, como num buscador:
        # "estagio -remoto", "design OR marketing", "\"recursos humanos\""
        # O Full Text Search só casa palavras inteiras; para quem digita só
        # o começo do nome da vaga ("market", "desenv"), o título também é
        # comparado por trecho, sem diferenciar acentos nem maiúsculas.
        consulta = "websearch_to_tsquery('portuguese', sem_acento(%s))"
        condicoes.append(f"(busca @@ {consulta} OR sem_acento(titulo) ILIKE sem_acento(%s))")
        params.append(q.strip())
        params.append(f"%{_escapar_like(q.strip())}%")
        ordem = f"ts_rank(busca, {consulta}) DESC, {ordem}"
    if tipo:
        condicoes.append("tipo = %s")
        params.append(TIPOS_VAGA.get(tipo, tipo))
    if area:
        condicoes.append("area = %s")
        params.append(area)
    if localizacao:
        condicoes.append("localizacao = %s")
        params.append(localizacao)

    if q and q.strip():
        params.append(q.strip())  # o mesmo texto, para o ts_rank do ORDER BY
    params.append(limite)

    # Só trechos fixos entram na string; todo valor vai como parâmetro.
    linhas = await query_all(
        f"SELECT {COLUNAS} FROM vw_vagas WHERE {' AND '.join(condicoes)} "
        f"ORDER BY {ordem} LIMIT %s",
        tuple(params),
    )
    return [_formatar(linha) for linha in linhas]


@router.get("/{vaga_id}", response_model=VagaResposta, summary="Detalhes de uma vaga")
async def detalhar_vaga(vaga_id: UUID):
    vaga = await buscar_vaga(vaga_id)
    if vaga is None:
        raise VAGA_NAO_ENCONTRADA
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
          FROM vw_vagas v
         WHERE v.inscricoes_abertas
           AND v.id <> %(id)s
           AND EXISTS (SELECT 1 FROM vw_vagas ref
                        WHERE ref.id = %(id)s
                          AND (ref.tipo = v.tipo OR ref.area = v.area))
         ORDER BY (v.area = (SELECT area FROM vw_vagas WHERE id = %(id)s)) DESC,
                  v.data_publicacao DESC
         LIMIT %(limite)s
        """,
        {"id": vaga_id, "limite": limite},
    )
    return [_formatar(linha) for linha in linhas]


@router.post(
    "",
    response_model=VagaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Publicar vaga (empresa)",
)
async def publicar_vaga(dados: VagaCriar, empresa: Usuario = Depends(exigir_empresa)):
    """Grava a vaga e as suas listas numa única transação: se qualquer
    parte falhar, nada fica gravado pela metade."""
    try:
        async with transacao() as cur:
            await cur.execute("SELECT id FROM areas WHERE nome = %s", (dados.area,))
            area = await cur.fetchone()
            if area is None:
                raise HTTPException(
                    status_code=422,
                    detail=[{"loc": ["body", "area"], "msg": "Selecione a área de atuação."}],
                )

            await cur.execute(
                """
                INSERT INTO vagas
                    (empresa_id, titulo, tipo, area_id, localizacao, modalidade,
                     horario_entrada, horario_saida, carga_horaria, remuneracao,
                     descricao, prazo_inscricao, numero_vagas, situacao)
                VALUES
                    (%(empresa_id)s, %(titulo)s, %(tipo)s, %(area_id)s, %(localizacao)s,
                     %(modalidade)s, %(horario_entrada)s, %(horario_saida)s,
                     %(carga_horaria)s, %(remuneracao)s, %(descricao)s,
                     %(prazo_inscricao)s, %(numero_vagas)s, 'Ativa')
                RETURNING id
                """,
                {
                    **dados.model_dump(exclude={"aceite_termos", "area", "requisitos",
                                                "diferenciais", "beneficios"}),
                    "empresa_id": empresa.id,
                    "area_id": area["id"],
                },
            )
            vaga_id = (await cur.fetchone())["id"]

            # unnest ... WITH ORDINALITY numera os itens na ordem digitada
            for tabela, itens in (("vaga_requisitos", dados.requisitos),
                                  ("vaga_diferenciais", dados.diferenciais)):
                if itens:
                    await cur.execute(
                        f"INSERT INTO {tabela} (vaga_id, ordem, descricao) "
                        "SELECT %s, item.ordem, item.texto "
                        "FROM unnest(%s::text[]) WITH ORDINALITY AS item (texto, ordem)",
                        (vaga_id, itens),
                    )

            if dados.beneficios:
                # benefício novo entra no catálogo; o existente é reaproveitado
                await cur.execute(
                    "INSERT INTO beneficios (nome) SELECT unnest(%s::text[]) ON CONFLICT DO NOTHING",
                    (dados.beneficios,),
                )
                await cur.execute(
                    """
                    INSERT INTO vaga_beneficios (vaga_id, beneficio_id)
                    SELECT %s, b.id FROM beneficios b
                     WHERE lower(b.nome) IN (SELECT lower(x) FROM unnest(%s::text[]) AS x)
                    ON CONFLICT DO NOTHING
                    """,
                    (vaga_id, dados.beneficios),
                )
    except errors.ForeignKeyViolation:
        # token válido de uma empresa que não existe mais no banco
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sua sessão expirou. Entre novamente.",
        )
    return await buscar_vaga(vaga_id)


@router.patch(
    "/{vaga_id}/situacao",
    response_model=VagaResposta,
    summary="Mudar a situação da vaga (empresa dona)",
)
async def mudar_situacao(
    vaga_id: UUID, dados: VagaSituacao, empresa: Usuario = Depends(exigir_empresa)
):
    """Ativa -> EmSelecao (encerra inscrições) -> Finalizada, ou Cancelada.
    Transição inválida é recusada pelo trigger do banco (409)."""
    await _vaga_da_empresa(vaga_id, empresa)
    try:
        async with transacao() as cur:
            await cur.execute(
                "UPDATE vagas SET situacao = %s WHERE id = %s", (dados.situacao, vaga_id)
            )
    except errors.RaiseException as erro:
        raise _erro_de_regra(erro)
    return await buscar_vaga(vaga_id)


@router.get(
    "/{vaga_id}/candidatos",
    response_model=list[Candidato],
    summary="Candidatos de uma vaga (empresa dona)",
)
async def listar_candidatos(vaga_id: UUID, empresa: Usuario = Depends(exigir_empresa)):
    await _vaga_da_empresa(vaga_id, empresa)
    return await query_all(
        """
        SELECT c.id AS candidatura_id, c.status, c.data_inscricao,
               e.nome, e.email_if, e.telefone, e.curso, e.periodo, e.instituicao
          FROM candidaturas c
          JOIN estudantes e ON e.id = c.estudante_id
         WHERE c.vaga_id = %s
         ORDER BY c.data_inscricao
        """,
        (vaga_id,),
    )
