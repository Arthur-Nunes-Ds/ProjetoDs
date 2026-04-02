from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model import TipoConsumo
from .erros import ErroInesperado, DuplicationTipo, RequestInvalida,NoteTipo

def criar_tipo(session: Session, Base: object) -> dict:
    try:
        tipo_consumo = TipoConsumo(Base.nome, Base.unidade_medida) # type: ignore

        session.add(tipo_consumo)
        session.commit()
        return {'mensagem': 'tipo de consumo criado com sucesso'}
    
    except IntegrityError:
        raise DuplicationTipo(session)
    
    except Exception as e:
        raise ErroInesperado(e, session)

def editar_tipo(session: Session,id:int , Base: object)-> dict:
    try:
        query = session.query(TipoConsumo).filter_by(_id = id).first() # type: ignore

        if query is None: raise NoteTipo(session)

        if Base.nome is None and Base.unidade_medida is None: raise RequestInvalida(session) # type: ignore
        
        if Base.nome is not None: query.nome = Base.nome  # type: ignore
        
        if Base.unidade_medida is not None: query.unidadeMedida = Base.unidade_medida  # type: ignore

        session.commit()

        return {"mensagem":"Dica Edita com suseso"}
    
    except (NoteTipo, RequestInvalida): raise

    except Exception as e:
        raise ErroInesperado(e, session)

def del_tipo(id: int, session: Session)-> dict:
    try:

        query = session.query(TipoConsumo).filter_by(_id = id).delete() 

        if query:
            session.commit()
            return {"mensagem": "Tipo de Consumo removido."}
        else: raise NoteTipo(session)

    except (NoteTipo) : raise

    except Exception as e:
        raise ErroInesperado(e, session)
    
def show_tipo(session: Session) -> dict:
    try:
        query = session.query(TipoConsumo).all()

        if query == []: raise NoteTipo(session)

        todos_tipos = {'mensagem': []}

        for i in query:
            todos_tipos["mensagem"].append(
                {
                    "id": i.id,
                    "nome": i.nome,
                    "unidade_medida" : i.unidadeMedida
                }
            )

        return todos_tipos
    
    except NoteTipo: raise

    except Exception as e: 
        raise ErroInesperado(e, session)

