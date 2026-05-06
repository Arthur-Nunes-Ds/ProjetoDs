from pydantic import BaseModel

class BaseCriarIot(BaseModel):
    id_iot: int

class ResponseAllIot(BaseModel):
    class DicIot(BaseModel):
        id: int
        id_iot: int

    mensagem: list[DicIot]

class BaseEditarIot(BaseModel):
    id_iot : int | None = None
    id_user : int | None = None
