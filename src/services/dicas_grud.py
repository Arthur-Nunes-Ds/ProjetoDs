from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..model import DicaSustentavel, Meta, Consumo
from .erros import BeadRequeste, DuplicationTipo, ErroInesperado, NotDica, DuplicationConsumo, NotMeta

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

def mostra_dica(session: Session, id_user: int, Base: object) -> dict:
    try:
        meta_query = session.query(Meta).filter_by(_USUARIO_id=id_user)
        
        meta_query = meta_query.filter_by(_TIPO_CONSUMO_id=Base.tipo_consumo_id) # type: ignore
        
        meta = meta_query.order_by(Meta._id.desc()).first()
        
        if meta is None: raise NotMeta(session)
        
        total_consumo = (
			session.query(func.coalesce(func.sum(Consumo._valor), 0.0))
			.filter_by(
				_USUARIO_id=id_user,
				_TIPO_CONSUMO_id=meta._TIPO_CONSUMO_id,
			).scalar()
		)
        
        dica = (
			session.query(DicaSustentavel).filter_by(_TIPO_CONSUMO_id=meta._TIPO_CONSUMO_id)
			.order_by(func.random()).first()
		)
        
        if dica is None: raise NotDica(session)
        
        consumo_atual = float(total_consumo or 0.0)
        valor_meta = float(meta.valorMeta)
        
        contexto = f"Seu consumo está {'dentro' if consumo_atual <= valor_meta else 'acima'} da meta."
		
        return {
			"mensagem": (
				f"{contexto} Consumo: {consumo_atual:.2f} | "
				f"Meta: {valor_meta:.2f} | Tipo: {meta.tipo_consumo.nome}. "
				f"Dica: {dica.descricao}"
			)
		}
    
    except (NotMeta, NotDica): raise

    except Exception as e: raise ErroInesperado(e, session)

def list_dica(session: Session) -> dict:
    try:
        todas_dicas= {"mensagem": []}

        query = session.query(DicaSustentavel).all()
        
        if query == []: raise NotDica(session)

        for i in query:
            todas_dicas["mensagem"].append({
                "id": i.id,
                "descrição":i.descricao,
                "nome": i.nome,
                "tipoConsumo": i.tipo_consumo.nome,
            })

        return todas_dicas
    
    except NotDica : raise

    except Exception as e: raise ErroInesperado(e, session)
