from pydantic import BaseModel, EmailStr
from datetime import datetime

class BaseCriarUsuario(BaseModel):
    nome: str
    senha: str
    #ver o formato(se tem: "@",".", se tá na possição correta)
    email: EmailStr

class ResponseLogarUser(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BaseEditarUsuarioi(BaseModel):
    #Igualar a None gera um campo opcional, ou seja, se ele não for passado, o código continua
    nome: str | None = None
    senha: str | None = None

class BaseEditarUsuarioiAdmin(BaseModel):
    id: int
    nome: str 

class BaseEmailReste(BaseModel): email: str

class BaseAltSenha(BaseModel): senha: str

class ResponseDadosUser(BaseModel):
    #isso server como uma representação de -> {}
    class DicReponse(BaseModel):
        nome: str
        email : str
        criado_em: datetime

    mensagem: DicReponse

class ResponseAllUser(BaseModel):
    class DicReponse(BaseModel):
        id:int
        nome: str
        email: str
        email_verificado: bool
        criado_em: datetime
    
    mensagem: list[DicReponse]

class VerificarEmail(BaseModel): toke: str
