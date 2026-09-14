"""Contratos de entrada e saída da API (Pydantic v2).

O que entra aqui é validado antes de chegar na rota: se um campo estiver
errado, o FastAPI devolve 422 com a lista de problemas, campo por campo,
e o React consegue mostrar cada erro embaixo do input certo.
"""

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.validadores import (
    cnpj_valido,
    cpf_valido,
    email_institucional,
    somente_digitos,
)


class EstudanteCriar(BaseModel):
    nome: str = Field(min_length=3, max_length=100)
    cpf: str
    email_if: EmailStr
    telefone: str | None = None
    instituicao: str = Field(min_length=2, max_length=100)
    curso: str = Field(min_length=2, max_length=50)
    periodo: int = Field(ge=1, le=12)
    senha: str = Field(min_length=8, max_length=72)
    confirmar_senha: str
    aceite_termos: bool

    @field_validator("nome", "instituicao", "curso")
    @classmethod
    def limpar_espacos(cls, valor: str) -> str:
        return " ".join(valor.split())

    @field_validator("nome")
    @classmethod
    def nome_completo(cls, valor: str) -> str:
        if len(valor.split()) < 2:
            raise ValueError("Informe o nome completo, com sobrenome.")
        return valor

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, valor: str) -> str:
        if not cpf_valido(valor):
            raise ValueError("CPF inválido.")
        return somente_digitos(valor)

    @field_validator("email_if")
    @classmethod
    def validar_vinculo(cls, valor: str) -> str:
        if not email_institucional(valor):
            raise ValueError("Use seu e-mail institucional do IF.")
        return valor.lower()

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, valor: str | None) -> str | None:
        if not valor:
            return None
        digitos = somente_digitos(valor)
        if len(digitos) not in (10, 11):
            raise ValueError("Telefone deve ter DDD e 8 ou 9 dígitos.")
        return digitos

    @field_validator("aceite_termos")
    @classmethod
    def exigir_aceite(cls, valor: bool) -> bool:
        if not valor:
            raise ValueError("É preciso aceitar os termos de uso.")
        return valor

    @model_validator(mode="after")
    def senhas_iguais(self):
        if self.senha != self.confirmar_senha:
            raise ValueError("As senhas não são iguais.")
        return self


class EstudanteResposta(BaseModel):
    id: UUID
    nome: str
    email_if: EmailStr
    curso: str
    periodo: int
    instituicao: str


class LoginEntrada(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=72)
    lembrar_me: bool = False


class UsuarioLogado(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    papel: str  # estudante | empresa


class LoginResposta(BaseModel):
    access_token: str
    token_type: str
    expira_em_minutos: int
    usuario: UsuarioLogado



SETORES = [
    "Tecnologia da Informação",
    "Educação",
    "Saúde",
    "Indústria",
    "Comércio",
    "Serviços",
    "Agronegócio",
    "Financeiro",
    "Logística",
    "Construção Civil",
    "Outro",
]


class EmpresaCriar(BaseModel):
    razao_social: str = Field(min_length=3, max_length=100)
    nome_fantasia: str | None = Field(default=None, max_length=100)
    cnpj: str
    setor: str
    email_contato: EmailStr
    telefone: str | None = None
    endereco: str | None = Field(default=None, max_length=200)
    senha: str = Field(min_length=8, max_length=72)
    confirmar_senha: str
    aceite_termos: bool

    @field_validator("razao_social", "nome_fantasia", "endereco")
    @classmethod
    def limpar(cls, valor: str | None) -> str | None:
        return " ".join(valor.split()) if valor else None

    @field_validator("cnpj")
    @classmethod
    def validar_cnpj(cls, valor: str) -> str:
        if not cnpj_valido(valor):
            raise ValueError("CNPJ inválido.")
        return somente_digitos(valor)

    @field_validator("setor")
    @classmethod
    def validar_setor(cls, valor: str) -> str:
        if valor not in SETORES:
            raise ValueError("Selecione um setor de atuação.")
        return valor

    @field_validator("email_contato")
    @classmethod
    def normalizar_email(cls, valor: str) -> str:
        return valor.lower()

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, valor: str | None) -> str | None:
        if not valor:
            return None
        digitos = somente_digitos(valor)
        if len(digitos) not in (10, 11):
            raise ValueError("Telefone deve ter DDD e 8 ou 9 dígitos.")
        return digitos

    @field_validator("aceite_termos")
    @classmethod
    def exigir_aceite(cls, valor: bool) -> bool:
        if not valor:
            raise ValueError("É preciso aceitar os termos de uso.")
        return valor

    @model_validator(mode="after")
    def senhas_iguais(self):
        if self.senha != self.confirmar_senha:
            raise ValueError("As senhas não são iguais.")
        return self


class EmpresaResposta(BaseModel):
    id: UUID
    razao_social: str
    nome_fantasia: str | None
    email_contato: EmailStr
    setor: str | None