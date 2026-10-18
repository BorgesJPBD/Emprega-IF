"""Quem está fazendo a requisição (middleware de autenticação por papel).

Uso nas rotas:

    from app.dependencias import exigir_empresa, exigir_estudante

    @router.post("/vagas")
    async def publicar(dados: VagaCriar, empresa: Usuario = Depends(exigir_empresa)):
        ...  # empresa.id é o id da empresa logada

O frontend manda o token no cabeçalho:  Authorization: Bearer <token>
Sem token, ou com token inválido/vencido -> 401.
Com token válido, mas do papel errado    -> 403.
"""

from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.seguranca import ler_token

# auto_error=False para devolvermos a nossa própria mensagem em português.
_bearer = HTTPBearer(auto_error=False)


@dataclass
class Usuario:
    id: UUID
    papel: str  # estudante | empresa


def usuario_logado(
    credenciais: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> Usuario:
    conteudo = ler_token(credenciais.credentials) if credenciais else None
    if not conteudo or "sub" not in conteudo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sua sessão expirou. Entre novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Usuario(id=UUID(conteudo["sub"]), papel=conteudo.get("papel", ""))


def _exigir_papel(papel: str, mensagem: str):
    def verificar(usuario: Usuario = Depends(usuario_logado)) -> Usuario:
        if usuario.papel != papel:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=mensagem)
        return usuario

    return verificar


exigir_empresa = _exigir_papel(
    "empresa", "Apenas contas de empresa podem fazer isso."
)
exigir_estudante = _exigir_papel(
    "estudante", "Apenas contas de estudante podem fazer isso."
)
