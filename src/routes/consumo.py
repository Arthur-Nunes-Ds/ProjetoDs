from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.conection import get_sesion
from src.schemas.consumo import BaseCriarConsumo, BaseEditarConsumo, ResponseAllConsumo
from src.schemas.geral import ResponseOk
from src.services import criar_consumo, del_consumo, editar_consumo, verificar_jwt_user
from src.services.consumo_grud import lista_consumo

Rotas_Consumo = APIRouter(
    responses={
        404: {
            "description": "Não há Consumo cadastrado com esse id",
        },
        401: {
            "description": "Não Altorizado",
        },
    }
)

@Rotas_Consumo.post("/Criar_Consumo", response_model=ResponseOk)
async def Criar_Consumo(base: BaseCriarConsumo, id: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),):
    """\n Cria um consumo do usuário"""

    return criar_consumo(session, base, id)

@Rotas_Consumo.put("/Editar_Consumo/{id}", response_model=ResponseOk)
async def Editar_Consumo(id: int,base: BaseEditarConsumo,
id_user: int = Depends(verificar_jwt_user), session: Session = Depends(get_sesion)):
    
    """\n Edita um consumo do usuário"""

    return editar_consumo(session, base, id, id_user)

@Rotas_Consumo.delete("/Del_Consumo/{id}", response_model=ResponseOk)
async def Del_Consumo(id: int, id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion)):
    """\n Remove um consumo do usuário"""

    return del_consumo(session, id, id_user)

@Rotas_Consumo.get("/Listar_Consumos", response_model=ResponseAllConsumo)
async def Listar_Consumos(
    id_user: int = Depends(verificar_jwt_user),session: Session = Depends(get_sesion)):
    
    """\n Lista os consumos do usuário"""

    return lista_consumo(session, id_user)
