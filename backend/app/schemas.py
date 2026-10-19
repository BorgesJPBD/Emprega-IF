"""Contratos de entrada e saída da API (Pydantic v2).

O que entra aqui é validado antes de chegar na rota: se um campo estiver
errado, o FastAPI devolve 422 com a lista de problemas, campo por campo,
e o React consegue mostrar cada erro embaixo do input certo.
"""

from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)

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
            raise ValueError("Este e-mail não é aceito no cadastro. Use o e-mail do IF.")
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



# Setores de atuação e áreas da vaga vêm das tabelas `setores` e `areas`
# (migration 002). A rota confere o valor no banco; aqui só o formato.


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
        if not valor.strip():
            raise ValueError("Selecione um setor de atuação.")
        return valor.strip()

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

# ------------------------------------------------------------
# Vagas (UC03 - Publicar Vaga)
# ------------------------------------------------------------

# Na tela aparece "Estágio" / "Jovem aprendiz"; no banco o CHECK usa
# 'Estagio' / 'Jovem Aprendiz' (item 4.8.2). A tradução fica aqui.
TIPOS_VAGA = {"Estágio": "Estagio", "Jovem aprendiz": "Jovem Aprendiz"}
TIPOS_VAGA_TELA = {banco: tela for tela, banco in TIPOS_VAGA.items()}

MODALIDADES = ["Presencial", "Híbrido", "Remoto"]


def _lista(valor: str | list[str] | None, separar_virgula: bool = False) -> list[str]:
    """Texto do formulário (um item por linha) ou lista -> lista de itens.
    Remove marcadores digitados pela pessoa ("- ", "• ") e itens vazios.
    Cada item vira uma linha nas tabelas vaga_requisitos, vaga_diferenciais
    ou vaga_beneficios (1FN, migration 003)."""
    if not valor:
        return []
    if isinstance(valor, str):
        if separar_virgula:
            valor = valor.replace(",", "\n")
        valor = valor.splitlines()
    itens = [" ".join(item.strip(" -•*\t").split()) for item in valor]
    vistos, unicos = set(), []
    for item in itens:
        if item and item.lower() not in vistos:
            vistos.add(item.lower())
            unicos.append(item)
    return unicos


class VagaCriar(BaseModel):
    titulo: str = Field(min_length=3, max_length=100)
    tipo: str
    area: str
    localizacao: str = Field(min_length=3, max_length=100)
    modalidade: str
    horario_entrada: time | None = None
    horario_saida: time | None = None
    carga_horaria: str | None = Field(default=None, max_length=30)
    remuneracao: Decimal | None = Field(default=None, ge=0, le=99_999_999)
    beneficios: list[str] = []
    descricao: str = Field(min_length=30, max_length=1500)
    requisitos: list[str]
    diferenciais: list[str] = []
    prazo_inscricao: date
    numero_vagas: int = Field(default=1, ge=1, le=999)
    aceite_termos: bool

    @field_validator("titulo", "localizacao", "carga_horaria")
    @classmethod
    def limpar(cls, valor: str | None) -> str | None:
        return " ".join(valor.split()) if valor else None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, valor: str) -> str:
        if valor not in TIPOS_VAGA:
            raise ValueError("Selecione o tipo de vaga.")
        return TIPOS_VAGA[valor]

    @field_validator("area")
    @classmethod
    def validar_area(cls, valor: str) -> str:
        if not valor.strip():
            raise ValueError("Selecione a área de atuação.")
        return valor.strip()

    @field_validator("modalidade")
    @classmethod
    def validar_modalidade(cls, valor: str) -> str:
        if valor not in MODALIDADES:
            raise ValueError("Selecione a modalidade.")
        return valor

    # O formulário manda cada lista como texto (um item por linha);
    # aqui ele vira lista. mode="before" roda antes da checagem de tipo.
    @field_validator("requisitos", mode="before")
    @classmethod
    def validar_requisitos(cls, valor):
        # uma vírgula dentro de um requisito ("Cursando ADS, Ciência da
        # Computação...") não separa itens: só a quebra de linha separa
        itens = _lista(valor)
        if not itens:
            raise ValueError("Informe ao menos um requisito.")
        if len(itens) > 20 or any(len(i) > 300 for i in itens):
            raise ValueError("Até 20 requisitos, com no máximo 300 caracteres cada.")
        return itens

    @field_validator("diferenciais", mode="before")
    @classmethod
    def validar_diferenciais(cls, valor):
        itens = _lista(valor)
        if len(itens) > 20 or any(len(i) > 300 for i in itens):
            raise ValueError("Até 20 diferenciais, com no máximo 300 caracteres cada.")
        return itens

    @field_validator("beneficios", mode="before")
    @classmethod
    def validar_beneficios(cls, valor):
        itens = _lista(valor, separar_virgula=True)
        if len(itens) > 20 or any(len(i) > 80 for i in itens):
            raise ValueError("Até 20 benefícios, com no máximo 80 caracteres cada.")
        return itens

    @field_validator("prazo_inscricao")
    @classmethod
    def prazo_futuro(cls, valor: date) -> date:
        if valor < date.today():
            raise ValueError("A data limite não pode estar no passado.")
        return valor

    @field_validator("aceite_termos")
    @classmethod
    def exigir_aceite(cls, valor: bool) -> bool:
        if not valor:
            raise ValueError("Confirme para publicar.")
        return valor

    @field_validator("horario_saida")
    @classmethod
    def saida_depois_da_entrada(cls, valor: time | None, info: ValidationInfo):
        # horario_entrada vem antes na classe, então já está em info.data
        entrada = info.data.get("horario_entrada")
        if valor and entrada and valor <= entrada:
            raise ValueError("A saída deve ser depois da entrada.")
        return valor


class VagaResposta(BaseModel):
    id: UUID
    titulo: str
    tipo: str
    area: str | None
    localizacao: str | None
    modalidade: str | None
    horario_entrada: time | None
    horario_saida: time | None
    carga_horaria: str | None
    remuneracao: float | None
    numero_vagas: int
    descricao: str | None
    requisitos: list[str]
    diferenciais: list[str]
    beneficios: list[str]
    situacao: str
    inscricoes_abertas: bool
    data_publicacao: datetime | None
    prazo_inscricao: date | None
    empresa_id: UUID
    empresa_nome: str


# ------------------------------------------------------------
# Candidaturas (UC02)
# ------------------------------------------------------------

class CandidaturaCriar(BaseModel):
    vaga_id: UUID


class CandidaturaResposta(BaseModel):
    id: UUID
    vaga_id: UUID
    status: str
    data_inscricao: datetime
    vaga_titulo: str | None = None
    empresa_nome: str | None = None
    historico: list["EventoHistorico"] = []


class VagaSituacao(BaseModel):
    """Mudança de situação da vaga pela empresa. As transições permitidas
    são conferidas pelo trigger tg_vagas_ciclo_de_vida (migration 005)."""
    situacao: str

    @field_validator("situacao")
    @classmethod
    def validar(cls, valor: str) -> str:
        if valor not in ("EmSelecao", "Finalizada", "Cancelada"):
            raise ValueError("Situação inválida.")
        return valor


class PainelVaga(BaseModel):
    id: UUID
    titulo: str
    tipo: str
    situacao: str
    data_publicacao: datetime | None
    prazo_inscricao: date | None
    total_candidaturas: int
    pendentes: int
    em_entrevista: int
    finalizadas: int


class Candidato(BaseModel):
    candidatura_id: UUID
    status: str
    data_inscricao: datetime
    nome: str
    email_if: str
    telefone: str | None
    curso: str
    periodo: int
    instituicao: str


class CandidaturaStatus(BaseModel):
    """Andamento conferido pelo trigger tg_candidaturas_andamento."""
    status: str

    @field_validator("status")
    @classmethod
    def validar(cls, valor: str) -> str:
        if valor not in ("Entrevista", "Finalizado"):
            raise ValueError("Status inválido.")
        return valor


class EventoHistorico(BaseModel):
    status_anterior: str | None
    status_novo: str
    alterado_em: datetime


class Estatisticas(BaseModel):
    estudantes: int
    empresas: int
    vagas_abertas: int
    candidaturas: int


CandidaturaResposta.model_rebuild()
