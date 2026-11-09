"""Contrato do currículo do estudante (modelo da plataforma).

Só texto, com limite em cada campo e em cada lista: o currículo inteiro
fica em poucos KB e o PDF é gerado pelo navegador, nunca guardado.
Não existem campos para foto, CPF, RG, data de nascimento, estado civil
ou endereço completo, de propósito (LGPD e boas práticas de currículo).
"""

from datetime import datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

NIVEIS_IDIOMA = ["Básico", "Intermediário", "Avançado", "Fluente"]

Habilidade = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)
]


class _Base(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class CurriculoFormacao(_Base):
    instituicao: str = Field(min_length=2, max_length=100)
    curso: str = Field(min_length=2, max_length=100)
    periodo: str = Field(
        default="", max_length=40
    )  # "2024 - 2027", "8º período (cursando)"


class CurriculoExperiencia(_Base):
    """Experiência, projeto, atividade de extensão ou voluntariado."""

    titulo: str = Field(min_length=2, max_length=100)
    organizacao: str = Field(default="", max_length=100)
    periodo: str = Field(default="", max_length=40)
    descricao: str = Field(default="", max_length=300)


class CurriculoCurso(_Base):
    nome: str = Field(min_length=2, max_length=100)
    instituicao: str = Field(default="", max_length=100)
    ano: str = Field(default="", max_length=20)


class CurriculoIdioma(_Base):
    idioma: str = Field(min_length=2, max_length=30)
    nivel: str

    @field_validator("nivel")
    @classmethod
    def validar_nivel(cls, valor: str) -> str:
        if valor not in NIVEIS_IDIOMA:
            raise ValueError("Escolha o nível do idioma.")
        return valor


class CurriculoDados(_Base):
    cidade: str = Field(default="", max_length=80)
    objetivo: str = Field(default="", max_length=300)
    formacao: list[CurriculoFormacao] = Field(default_factory=list, max_length=5)
    experiencias: list[CurriculoExperiencia] = Field(default_factory=list, max_length=6)
    cursos: list[CurriculoCurso] = Field(default_factory=list, max_length=8)
    habilidades: list[Habilidade] = Field(default_factory=list, max_length=15)
    idiomas: list[CurriculoIdioma] = Field(default_factory=list, max_length=5)

    @field_validator("habilidades")
    @classmethod
    def sem_repetidas(cls, itens: list[str]) -> list[str]:
        vistos, unicas = set(), []
        for item in itens:
            if item.lower() not in vistos:
                vistos.add(item.lower())
                unicas.append(item)
        return unicas

    @model_validator(mode="after")
    def preencher_algo(self):
        if not (
            self.objetivo
            or self.formacao
            or self.experiencias
            or self.cursos
            or self.habilidades
            or self.idiomas
        ):
            raise ValueError("Preencha ao menos uma seção do currículo.")
        return self


class CurriculoResposta(BaseModel):
    dados: CurriculoDados
    atualizado_em: datetime
