from pydantic import BaseModel

class EmailSend(BaseModel):
    email: str
    #FIXME - remover user qaundo o banco estiver pronto
    user : str