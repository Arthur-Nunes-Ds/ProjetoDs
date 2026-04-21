from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from datetime import datetime as dt
from ..model import Meta
from .erros import ErroInesperado, NotMeta, RequestInvalida, DuplicationMeta

def criar_meta(session: Session, valor_meta: float, periodo: dt,
               TIPO_CONSUMO_id: int , id_user: int) -> dict:
    try:
        meta = Meta(
            valor_meta,  
            periodo,  
            TIPO_CONSUMO_id,  
            id_user,
        )

        session.add(meta)
        session.commit()

        return {"mensagem": "meta criada com sucesso"}

    except IntegrityError:
        raise DuplicationMeta(session)

    except Exception as e:
        raise ErroInesperado(e, session)

def editar_meta(session: Session, id: int, id_user: int, valor_meta: float |None, 
                periodo: dt|None, TIPO_CONSUMO_id: int|None) -> dict:
    try:
        query = session.query(Meta).filter_by(_id=id, _USUARIO_id=id_user).first()

        if query is None: raise NotMeta(session)

        if valor_meta is None and periodo is None and TIPO_CONSUMO_id is None: raise RequestInvalida(session)

        if valor_meta is not None: query.valorMeta = valor_meta 

        if periodo is not None: query.periodo = periodo 

        if TIPO_CONSUMO_id is not None: query._TIPO_CONSUMO_id = TIPO_CONSUMO_id 

        session.commit()

        return {"mensagem": "meta editada com sucesso"}

    except (NotMeta, RequestInvalida): raise

    except IntegrityError:
        raise RequestInvalida(session)

    except Exception as e:
        raise ErroInesperado(e, session)

def del_meta(session: Session, id: int, id_user: int) -> dict:
    try:
        query = session.query(Meta).filter_by(_id=id, _USUARIO_id=id_user).delete()

        if query:
            session.commit()
            return {"mensagem": "meta removida"}

        raise NotMeta(session)

    except NotMeta: raise

    except Exception as e:
        raise ErroInesperado(e, session)

def list_meta(session: Session, id_user: int) -> dict:
    try:
        todas_metas = {"mensagem": []}

        query = session.query(Meta).filter_by(_USUARIO_id = id_user).all()
        
        if query == []: raise NotMeta(session)

        for i in query:
            todas_metas["mensagem"].append({
                "id": i.id,
                "valorMeta":i.valorMeta,
                "period": i.periodo,
                "tipoConsumo": i.tipo_consumo.nome,
            })

        return todas_metas
    
    except NotMeta : raise

    except Exception as e: raise ErroInesperado(e, session)
