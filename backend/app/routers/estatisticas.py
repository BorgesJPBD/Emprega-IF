"""Números da página inicial, contados no banco (view vw_estatisticas)."""

from fastapi import APIRouter

from app.db import query_one
from app.schemas import Estatisticas

router = APIRouter(prefix="/estatisticas", tags=["Estatísticas"])


@router.get("", response_model=Estatisticas, summary="Totais da plataforma")
async def estatisticas():
    return await query_one("SELECT * FROM vw_estatisticas")
