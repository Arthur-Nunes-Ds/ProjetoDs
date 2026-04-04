from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..conection import get_sesion
from ..schemas.tipo_consumo import (BaseCriarTipoConsumo,BaseEditarTipoConsumo,ResponseTipoConsumo)
from ..schemas.geral import ResponseOk
from ..services import criar_tipo, del_tipo, editar_tipo, show_tipo

Rotas_Tipo_Consumo = APIRouter(
    responses={
        404: {
            "description": "Não há Tipo de Consumo cadastrado com esse id",
        },
        409: {
            "description": "Já existe um tipo de consumo desse tipo",
        },
    }
)

@Rotas_Tipo_Consumo.post("/Criar_Tipo", response_model=ResponseOk)
async def Criar_Tipo(base: BaseCriarTipoConsumo, session: Session = Depends(get_sesion)):
    """Cria um novo tipo de consumo."""

    return criar_tipo(session, base)

@Rotas_Tipo_Consumo.put("/Editar_Tipo/{id}", response_model=ResponseOk)
async def Editar_Tipo(
    id: int,base: BaseEditarTipoConsumo,session: Session = Depends(get_sesion),
):
    """Edita um tipo de consumo existente."""

    return editar_tipo(session, id, base)

@Rotas_Tipo_Consumo.delete("/Del_Tipo/{id}", response_model=ResponseOk)
async def Del_Tipo(id: int, session: Session = Depends(get_sesion)):
    """Remove um tipo de consumo."""

    return del_tipo(id, session)

@Rotas_Tipo_Consumo.get("/Mostrar_Tipos", response_model=ResponseTipoConsumo)
async def Mostrar_Tipos(session: Session = Depends(get_sesion)):
    """Lista todos os tipos de consumo."""

    return show_tipo(session)
