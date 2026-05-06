from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .erros import ErroInesperado, DuplicationIot, NotIot, RequestInvalida
from ..model import Iot

#criar_consumo

def criar_iot(session: Session, id_iot:int , id_user: int) -> dict:
    try:
        iot = Iot(
            id_iot,
            id_user
        )

        session.add(iot)
        session.commit()

        return {"mensagem": "iot criado com sucesso"}

    except IntegrityError: raise DuplicationIot(session)

    except Exception as e: raise ErroInesperado(e, session)

def editar_iot(session: Session, id_iot: int | None, id_user: int | None) -> dict:
    try:
        query = session.query(Iot).filter_by(_id=id_iot, _USUARIO_id=id_user).first()

        if query is None: raise NotIot(session)

        if id_iot is None and id_user is None: raise RequestInvalida(session) 

        if id_iot is not None: query.id_iot = id_iot  

        if id_user is not None: query.id_user = id_user  

        session.commit()

        return {"mensagem": "Iot editado com sucesso"}

    except (NotIot, RequestInvalida): raise

    except IntegrityError: raise RequestInvalida(session)

    except Exception as e: raise ErroInesperado(e, session)

def del_iot(session: Session, id_iot: int, id_user: int) -> dict:
    try:
        query = session.query(Iot).filter_by(_id_iot=id_iot, _USUARIO_id=id_user).delete()

        if query:
            session.commit()
            return {"mensagem": "Iot removido"}

        raise NotIot(session)

    except NotIot: raise

    except Exception as e: raise ErroInesperado(e, session)

def lista_iot(session: Session, id_user: int):
    try:
        todos_iot = {"mensagem": []}

        query = session.query(Iot).filter_by(_USUARIO_id = id_user).all()
        
        if query == []: raise NotIot(session)

        for i in query:
            todos_iot["mensagem"].append({
                "id": i.id,
                "id_iot": i.id_iot,
            })

        return todos_iot
    
    except NotIot : raise

    except Exception as e: raise ErroInesperado(e, session)

