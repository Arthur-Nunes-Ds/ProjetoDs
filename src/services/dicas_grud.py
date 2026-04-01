from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model import DicaSustentavel
from .erros import ErroInesperado,BeadRequeste,NotDica

#FIXME - add uma ia para deixar as dicas pernalizada para o usuario com base na meta
def criar_dica(session: Session, Base: object) -> dict:
    try:
        #**Base.model_dump() -> mesma coisa de fazer manalmente: base.nome ...
        dicas = DicaSustentavel(**Base.model_dump())  # type: ignore
        
        session.add(dicas)
        session.commit()
        
        return {"mensagem":"dicas criadas"}

    except Exception as e:
        raise ErroInesperado(e, session)

def editar_dica(session: Session, Base: object, id: int) ->  dict:
    try:
        query = session.query(DicaSustentavel).filter_by(_id = id).first()

        if is_str_valido(Base.descricao) or is_str_valido(Base.nome) or  # type: ignore
            is_str_valido(Base.TIPO_CONSUMO_id): # type: ignore

            if is_str_valido(Base.descricao):  # type: ignore
                query.descricao = Base.descricao # type: ignore

            if is_str_valido(Base.nome): query.nome = Base.nome  # type: ignore
            
            if is_str_valido(Base.TIPO_CONSUMO_id):  # type: ignore
                query.TIPO_CONSUMO_id = Base.TIPO_CONSUMO_id  # type: ignore
        
        else: raise BeadRequeste(session)

        return {"mensagem": "dica edida com sucesso"}
    
    except () : raise

    except Exception as e: raise ErroInesperado(e, session)

def excluir_dica(session: Session, id: int) -> dict:
    try:

        query = session.query(DicaSustentavel).filter_by(_id = id).delete() 

        if query:
            session.commit()
            return {"mensagem": "dica removido."}
        
        else: raise NotDica(session)

    except (NotDica) : raise

    except Exception as e:
        raise ErroInesperado(e, session)

def list_dica(session: Session, id: int | None) -> dict:
    query = None

    if id is None : 
        query = session.query(DicaSustentavel).all()
    else:
        query = session.query(DicaSustentavel).filter_by(_id = id).first()
    
    if query != []:
        user_final = {'mensagem': []}
        for i in query: # type: ignore
            
            user_final['mensagem'].append({'id':i._id,
                                        'nome': i._nome,
                                        'descricao':i._descricao,
                                        #FIXME - troca por uma função que retorna o nome do tipo
                                        "tipo_consumo": i._TIPO_CONSUMO_id
                                        })
        
        if len(user_final['mensagem']) == 0: raise NotDica(session) 
        return user_final
    
    elif query is not None:
        return {"mensagem":{
            "nome": query._nome, # type: ignore
            "descricao": query._descricao,  # type: ignore
            #FIXME - troca por uma função que retorna o nome do tipo
            "tipo_consumo": query._TIPO_CONSUMO_id  # type: ignore
        }}

    else: raise NotDica(session)

