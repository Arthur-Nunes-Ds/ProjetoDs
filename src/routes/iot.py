from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_sesion
from ..schemas import ResponseOk, BaseCriarIot, ResponseAllIot, BaseCriarConsumo
from ..services import (verificar_jwt_user, criar_consumo,
            criar_iot, editar_iot, del_iot, lista_iot)


Rotas_Iot = APIRouter(
    responses={
        404: {
            "description": "Não há Iot cadastrada com esse id",
        },
        401: {
            "description": "Não Altorizado",
        },
    }
)

@Rotas_Iot.post("/Criar_Iot", response_model=ResponseOk)
async def Criar_Iot(
    base: BaseCriarIot,
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion)):
    """\n Cria um iot do usuário """

    return criar_iot(session, base.id_iot, id_user)

@Rotas_Iot.put("/Editar_Iot", response_model=ResponseOk)
async def Editar_Iot(
    base: BaseCriarIot,
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),
):
    """\n Edita um iot do usuário autenticado. """

    return editar_iot(session, base.id_iot, id_user)

@Rotas_Iot.delete("/Del_Iot/{id}", response_model=ResponseOk)
async def Del_Iot(
    id: int,
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),
):
    """\n Remove um iot do usuário """

    return del_iot(session, id, id_user)

@Rotas_Iot.get("/Listar_Iots", response_model=ResponseAllIot)
async def Listar_Iots(
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),
):
    """\n Lista os iots do usuário """

    return lista_iot(session, id_user)

@Rotas_Iot.post("/Cadastrar_Consumo/{id_user}", response_model=ResponseOk)
async def Cadastarar_Consumo(
    base: BaseCriarConsumo,
    id_user : int,
    session: Session = Depends(get_sesion)
): 
    """\n Cadastro via o Iot Central """

    return criar_consumo(session,base.valor, base.dt_perioto, 
                         base.TIPO_CONSUMO_id, id_user)