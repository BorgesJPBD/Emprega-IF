"""Empresas: cadastro e painel da empresa logada."""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from psycopg import errors

from app.db import execute, query_all, query_one
from app.dependencias import Usuario, exigir_empresa
from app.notificacoes import boas_vindas
from app.schemas import EmpresaCriar, EmpresaResposta, PainelVaga
from app.seguranca import gerar_hash_senha

router = APIRouter(prefix="/empresas", tags=["Empresas"])

# O setor chega pelo nome e é gravado pelo id da tabela `setores`.
# Se o nome não existir, o SELECT não devolve linha e nada é gravado.
SQL_INSERIR = """
    WITH nova AS (
        INSERT INTO empresas
            (razao_social, nome_fantasia, cnpj, setor_id, email_contato,
             telefone, endereco, senha_hash)
        SELECT %(razao_social)s, %(nome_fantasia)s, %(cnpj)s, s.id,
               %(email_contato)s, %(telefone)s, %(endereco)s, %(senha_hash)s
          FROM setores s
         WHERE s.nome = %(setor)s
        RETURNING id, razao_social, nome_fantasia, email_contato, setor_id
    )
    SELECT nova.id, nova.razao_social, nova.nome_fantasia, nova.email_contato,
           s.nome AS setor
      FROM nova JOIN setores s ON s.id = nova.setor_id
"""


@router.get("/setores", summary="Setores de atuação aceitos")
async def listar_setores() -> list[str]:
    linhas = await query_all("SELECT nome FROM setores ORDER BY id")
    return [linha["nome"] for linha in linhas]


@router.get(
    "/me/vagas",
    response_model=list[PainelVaga],
    summary="Painel: vagas da empresa logada, com contagem de candidaturas",
)
async def minhas_vagas(empresa: Usuario = Depends(exigir_empresa)):
    linhas = await query_all(
        """
        SELECT id, titulo, tipo, situacao, data_publicacao, prazo_inscricao,
               total_candidaturas, pendentes, em_entrevista, finalizadas
          FROM vw_painel_vagas
         WHERE empresa_id = %s
         ORDER BY data_publicacao DESC NULLS LAST
        """,
        (empresa.id,),
    )
    rotulo = {"Estagio": "Estágio", "Jovem Aprendiz": "Jovem aprendiz"}
    return [{**linha, "tipo": rotulo.get(linha["tipo"], linha["tipo"])} for linha in linhas]


@router.post(
    "",
    response_model=EmpresaResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar perfil de empresa",
)
async def cadastrar_empresa(dados: EmpresaCriar, tarefas: BackgroundTasks):
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

    if empresa is None:
        raise HTTPException(
            status_code=422,
            detail=[{"loc": ["body", "setor"], "msg": "Selecione um setor de atuação."}],
        )
    nome = empresa["nome_fantasia"] or empresa["razao_social"]
    tarefas.add_task(boas_vindas, empresa["email_contato"], nome, "empresa")
    return empresa