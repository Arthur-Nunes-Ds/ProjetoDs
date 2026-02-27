from src.config import USER_ADMIN, SENHA_ADMIN
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model import Usuario
from .erros import ErroInesperado, DuplicationUser

def admin_create(session: Session):
    try:
        user = Usuario("admin",USER_ADMIN, SENHA_ADMIN, True)
        session.add(user)
        session.commit()
        return {'mensagem': 'cliente criado com sucesso'}
    
    except IntegrityError:
        raise DuplicationUser(session)
    
    except Exception as e:
        raise ErroInesperado(e, session)
    
def all_user(id: int) -> dict:
    return {"mensagem":id}


