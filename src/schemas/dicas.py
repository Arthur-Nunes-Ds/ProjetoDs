from pydantic import BaseModel


class BaseCriarDica(BaseModel):
    nome: str
    descricao: str
    TIPO_CONSUMO_id: int


class BaseEditarDica(BaseModel):
    nome: str | None = None
    descricao: str | None = None
    TIPO_CONSUMO_id: int | None = None
