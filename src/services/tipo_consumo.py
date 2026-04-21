from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..model import TipoConsumo
from .erros import ErroInesperado, DuplicationTipo, RequestInvalida,NoteTipo

def criar_tipo(session: Session, unidade_medida: str, nome: str) -> dict:
    try:
        tipo_consumo = TipoConsumo(nome, unidade_medida) 

        session.add(tipo_consumo)
        session.commit()
        return {'mensagem': 'tipo de consumo criado com sucesso'}
    
    except IntegrityError:
        raise DuplicationTipo(session)
    
    except Exception as e:
        raise ErroInesperado(e, session)

def editar_tipo(session: Session, id:int , unidade_medida: str | None, nome: str | None)-> dict:
    try:
        query = session.query(TipoConsumo).filter_by(_id = id).first()

        if query is None: raise NoteTipo(session)

        if nome is None and unidade_medida is None: raise RequestInvalida(session)
        
        if nome is not None: query.nome = nome 
        
        if unidade_medida is not None: query.unidadeMedida = unidade_medida 

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

