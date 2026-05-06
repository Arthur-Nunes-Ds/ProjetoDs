from sqlalchemy.orm import Session
import httpx
from ..model import Meta, Consumo
from .erros import NotConsumo, NotMeta, ErroInesperado

async def mostra_dica(session: Session, id_user: int, tipo_consumo_id: int) -> dict:
    try:
        query_consumo = session.query(Consumo).filter_by(_USUARIO_id=id_user,
                                                         _TIPO_CONSUMO_id=tipo_consumo_id).first()

        query_meta = session.query(Meta).filter_by(_USUARIO_id=id_user,
                                                   _TIPO_CONSUMO_id=tipo_consumo_id).first()
        
        if query_consumo is None: raise NotConsumo(session)
        
        if query_meta is None: raise NotMeta(session)

        tipo_consumo = query_consumo.tipo_consumo.nome
        valor_consumo = query_consumo.valor
        valor_meta = query_meta.valor
        unidade_medida = query_consumo.tipo_consumo.unidadeMedida

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://ia:11434/api/generate",
                json={
                    "model": "gemma2:2b",
                    "prompt": f"Quero que me gere uma dica simples no minomo em 2 linha sem emotes sobre o tipo de consumo: \"{tipo_consumo}\",\
                          sabendo que a meta era: \"{valor_meta}\" e o consumo foi de \"{valor_consumo}\" onde tudo está na unidade de medida \"{unidade_medida}\". \
                          já me reponda com a dica direta.",
                    "stream": False,
                    "options": {
                        "num_predict": 150,
                        "temperature": 0.7
                    }
                }
            )

        data = response.json()
        dica: str | None = data.get("response")

        if dica is None or dica.strip() == "":
            raise ErroInesperado("Dica vazia retornada pela IA", session)

        return {"mensagem": dica}

    except (NotConsumo, NotMeta):raise
    
    except Exception as e:
        raise ErroInesperado(e, session)

