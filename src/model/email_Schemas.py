from pydantic import BaseModel

class BaseEmailSend(BaseModel): email: str 

class BaseEmailToken(BaseModel): token: str