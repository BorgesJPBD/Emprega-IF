import os

from dotenv import load_dotenv

load_dotenv()


def _lista(valor: str) -> list[str]:
    return [item.strip() for item in valor.split(",") if item.strip()]


class Settings:
    # Banco
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/emprega_if",
    )
    DB_POOL_MIN: int = int(os.getenv("DB_POOL_MIN", 1))
    DB_POOL_MAX: int = int(os.getenv("DB_POOL_MAX", 10))

    # Autenticação (RN-05)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chave-de-desenvolvimento-troque-em-producao")
    JWT_ALGORITMO: str = "HS256"
    JWT_EXPIRA_MINUTOS: int = int(os.getenv("JWT_EXPIRA_MINUTOS", 480))

    # Origens liberadas para o frontend React
    CORS_ORIGINS: list[str] = _lista(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    )

    # Validação de vínculo com o IF (UC01, passo 3).
    # Vazio = aceita qualquer domínio (útil para testar).
    DOMINIOS_EMAIL_PERMITIDOS: list[str] = _lista(
        os.getenv("DOMINIOS_EMAIL_PERMITIDOS", "ifms.edu.br,estudante.ifms.edu.br")
    )


settings = Settings()
