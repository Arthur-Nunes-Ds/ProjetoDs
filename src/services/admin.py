from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..model import Usuario
from ..config import USER_ADMIN, SENHA_ADMIN
from .erros import ErroInesperado, DuplicationUser

def admin_create(session: Session) -> dict:
    try:
        query = session.query(Usuario).filter_by(_id = -1).first()

        if query is not None: query.novaSenha(SENHA_ADMIN)

        else:
            user = Usuario("admin",USER_ADMIN, SENHA_ADMIN, True) # type: ignore
            user.idAdmin()

            session.add(user)
        
        session.commit()
        return {'mensagem': 'cliente criado com sucesso'}
    
    except IntegrityError:
        raise DuplicationUser(session)
    
    except Exception as e:
        raise ErroInesperado(e, session)