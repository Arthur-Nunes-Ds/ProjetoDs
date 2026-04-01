from fastapi import HTTPException, status
from sqlalchemy.orm import Session

class DuplicationUser(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail='já existe um cliente com esse email'
        )

class NoteUser(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há User Verificado com esse Email"
        )

class NotDica(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há Dicas Cadastrada com esse id"
        )

class SenhaInvalida(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha inválida."
        )

class ErroInesperado(HTTPException):
    def __init__(self, e, session: Session | None = None):
        if session is not None:
            session.rollback()

        super().__init__(
            status_code=500,
            detail=f"Erro inesperado do servidor.Erro -> {e}"
        )

class StmpIndisponivel(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=503,
            detail="Serviço de email indisponível."
        )

class AutStmpServer(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=501,
            detail="Erro de autenticação no serviço de email."
            )
          
class JwtInvalido(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="JWT inválido"
        )

class JwtNotEmail(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=403,
            detail="Esse JWT não é valido para essa operação."
        )

class DnsEmailNotExiste(HTTPException):
    def __init__(self):

        super().__init__(
            status_code=422,
            detail= "Dns do email não existe"
        )

class RequestInvalida(HTTPException):
    def __init__(self, session: Session | None = None):
        
        if session is not None: session.rollback()

        super().__init__(
            status_code=422,
            detail= "Nem um campo devidamente informado"
        )

class AdminActionNotAllowed(HTTPException):
    def __init__(self):

        super().__init__(
            status_code=403,
            detail= "Essa opeção não pode excutar por admin."
        )

class CannotChangeAdmin(HTTPException):
    def __init__(self, session: Session ):

        session.rollback()

        super().__init__(
            status_code=403,
            detail= "Não se pode alterar um admin"
        )

class JustAdmin(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail= "Essa opeção só pode ser excutada por admin."
        )
        
class BeadRequeste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Falata requisto'
        )

