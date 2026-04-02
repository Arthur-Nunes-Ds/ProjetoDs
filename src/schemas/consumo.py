from datetime import datetime

from pydantic import BaseModel


class BaseCriarConsumo(BaseModel):
    valor: float
    dt_perioto: datetime
    TIPO_CONSUMO_id: int


class BaseEditarConsumo(BaseModel):
    valor: float | None = None
    dt_perioto: datetime | None = None
    TIPO_CONSUMO_id: int | None = None


class ResponseAllConsumo(BaseModel):
    class DicReponse(BaseModel):
        id: int
        valor: float
        dataRegistrada: datetime
        tipoConsumo: str

    mensagem: list[DicReponse]
