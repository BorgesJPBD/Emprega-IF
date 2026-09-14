"""Emprega IF - API REST (FastAPI).

Sobe com:  uvicorn main:app --reload
Docs em:   http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import abrir_pool, fechar_pool, query_one
from app.routers import auth, empresas, estudantes
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await abrir_pool()
    yield
    await fechar_pool()


app = FastAPI(
    title="Emprega IF",
    description="API da plataforma que conecta estudantes do IF a vagas de "
    "estágio e jovem aprendiz.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(estudantes.router)
app.include_router(empresas.router)


@app.get("/health", tags=["Infra"])
async def health():
    """Confirma que a API conversa com o PostgreSQL."""
    linha = await query_one("SELECT version() AS versao")
    return {"status": "ok", "postgres": linha["versao"]}