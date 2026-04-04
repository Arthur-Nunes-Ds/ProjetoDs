from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..model import Consumo
from .erros import ErroInesperado, NotConsumo, RequestInvalida, DuplicationConsumo

def criar_consumo(session: Session, Base: object, id_user: int) -> dict:
    try:
        consumo = Consumo(
            Base.valor,  # type: ignore
            Base.dt_perioto,  # type: ignore
            Base.TIPO_CONSUMO_id,  # type: ignore
            id_user,
        )

        session.add(consumo)
        session.commit()

        return {"mensagem": "consumo criado com sucesso"}

    except IntegrityError: raise DuplicationConsumo(session)

    except Exception as e: raise ErroInesperado(e, session)

def editar_consumo(session: Session, Base: object, id: int, id_user: int) -> dict:
    try:
        query = session.query(Consumo).filter_by(_id=id, _USUARIO_id=id_user).first()

        if query is None: raise NotConsumo(session)

        if Base.valor is None and Base.dt_perioto is None and Base.TIPO_CONSUMO_id is None: raise RequestInvalida(session) # type: ignore

        if Base.valor is not None: query.valor = Base.valor  # type: ignore

        if Base.dt_perioto is not None: query.dt_perioto = Base.dt_perioto  # type: ignore

        if Base.TIPO_CONSUMO_id is not None: query._TIPO_CONSUMO_id = Base.TIPO_CONSUMO_id  # type: ignore

        session.commit()

        return {"mensagem": "consumo editado com sucesso"}

    except (NotConsumo, RequestInvalida): raise

    except IntegrityError: raise RequestInvalida(session)

    except Exception as e: raise ErroInesperado(e, session)

def del_consumo(session: Session, id: int, id_user: int) -> dict:
    try:
        query = session.query(Consumo).filter_by(_id=id, _USUARIO_id=id_user).delete()

        if query:
            session.commit()
            return {"mensagem": "consumo removido"}

        raise NotConsumo(session)

    except NotConsumo: raise

    except Exception as e: raise ErroInesperado(e, session)

def lista_consumo(session: Session, id_user: int):
    try:
        todas_metas = {"mensagem": []}

        query = session.query(Consumo).filter_by(_USUARIO_id = id_user).all()
        
        if query == []: raise NotConsumo(session)

        for i in query:
            todas_metas["mensagem"].append({
                "id": i.id,
                "valor":i.valor,
                "dataRegistrada": i.dt_perioto,
                "tipoConsumo": i.tipo_consumo.nome,
            })

        return todas_metas
    
    except NotConsumo : raise

    except Exception as e: raise ErroInesperado(e, session)

