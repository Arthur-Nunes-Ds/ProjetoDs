from pydantic import BaseModel, EmailStr
from datetime import datetime

class BaseCriarUsuario(BaseModel):
    nome: str
    senha: str
    #ver o formtato(se tem: "@",".", se tá na possição correta)
    email: EmailStr

class ResponseLogarUser(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BaseEditarUsuarioi(BaseModel):
    #Igualar a None gera um campo opcional, ou seja, se ele não for passado, o código continua
    nome: str | None = None
    senha: str | None = None

class ResponseDadosUser(BaseModel):
    #isso server como uma reprecentação de -> {}
    class DicReponse(BaseModel):
        nome: str
        email : str
        criado_em: datetime

    mensagem: DicReponse

class VerificarEmail(BaseModel): toke: str
