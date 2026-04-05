from datetime import datetime
from pydantic import BaseModel

class BaseCriarMeta(BaseModel):
    valor_meta: float
    periodo: datetime
    TIPO_CONSUMO_id: int

class BaseEditarMeta(BaseModel):
    valor_meta: float | None = None
    periodo: datetime | None = None
    TIPO_CONSUMO_id: int | None = None

class ResponseAllMeta(BaseModel):
    class DicReponse(BaseModel):
        id: int
        valorMeta: float
        period: datetime
        tipoConsumo: str

    mensagem: list[DicReponse]
