from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..model import DicaSustentavel
from .erros import BeadRequeste, DuplicationTipo, ErroInesperado, NotDica, DuplicationConsumo

def criar_dica(session: Session, Base: object) -> dict:
    try:
        dica = DicaSustentavel(Base.nome, Base.descricao, Base.TIPO_CONSUMO_id)  # type: ignore

        session.add(dica)
        session.commit()

        return {"mensagem": "dica criada com sucesso"}

    except IntegrityError: raise DuplicationConsumo(session)

    except Exception as e:raise ErroInesperado(e, session)

def editar_dica(session: Session, Base: object, id: int) -> dict:
    try:
        query = session.query(DicaSustentavel).filter_by(_id=id).first()

        if query is None: raise NotDica(session)

        if Base.nome is None and Base.descricao is None and Base.TIPO_CONSUMO_id is None:  # type: ignore
            raise BeadRequeste(session)

        if Base.nome is not None: query.nome = Base.nome  # type: ignore

        if Base.descricao is not None: query.descricao = Base.descricao  # type: ignore

        if Base.TIPO_CONSUMO_id is not None: query._TIPO_CONSUMO_id = Base.TIPO_CONSUMO_id  # type: ignore

        session.commit()

        return {"mensagem": "dica editada com sucesso"}

    except (NotDica, BeadRequeste):raise

    except IntegrityError: raise DuplicationTipo(session)

    except Exception as e: raise ErroInesperado(e, session)

def excluir_dica(session: Session, id: int) -> dict:
    try:

        query = session.query(DicaSustentavel).filter_by(_id = id).delete() 

        if query:
            session.commit()
            return {"mensagem": "dica removida"}

        raise NotDica(session)

    except NotDica : raise
    
    except Exception as e: raise ErroInesperado(e, session)

#FIXME - add mostart e listar dicas


