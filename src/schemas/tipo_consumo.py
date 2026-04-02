from pydantic import BaseModel


class BaseCriarTipoConsumo(BaseModel):
    nome: str
    unidade_medida: str


class BaseEditarTipoConsumo(BaseModel):
    nome: str | None = None
    unidade_medida: str | None = None


class ResponseTipoConsumo(BaseModel):
    class DicReponse(BaseModel):
        id: int
        nome: str
        unidade_medida: str

    mensagem: list[DicReponse]
