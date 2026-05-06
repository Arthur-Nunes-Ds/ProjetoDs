from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_sesion
from ..schemas import (BaseDicaRecomendada,ResponseOk)
from ..services import (mostra_dica,verificar_jwt_user)

Rotas_Dicas = APIRouter(
    responses={
        404: {
            "description": "Não há Dicas Cadastrada com esse id",
        },
        409: {
            "description": "Já existe um registro duplicado",
        },
    }
)

@Rotas_Dicas.post("/Mostra_Dica", response_model=ResponseOk)
async def Mostra_Dica(
    base: BaseDicaRecomendada,
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),
):
    """
    Mostra uma dica com base na meta e no consumo do usuario para um tipo específico.
    """

    return mostra_dica(session, id_user, base.tipo_consumo_id)

