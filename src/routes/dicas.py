from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..conection import get_sesion
from ..schemas import (BaseCriarDica, BaseEditarDica, BaseDicaRecomendada,ResponseOk, ResponseAllDica)
from ..services import (criar_dica,editar_dica,excluir_dica,mostra_dica,
                        verificar_jwt_admin,verificar_jwt_user, list_dica)

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

@Rotas_Dicas.post("/Criar_Dica", response_model=ResponseOk)
async def Criar_Dica(
    base: BaseCriarDica,
    _: int = Depends(verificar_jwt_admin),
    session: Session = Depends(get_sesion),
):
    """Cria uma dica sustentável."""

    return criar_dica(session, base)

@Rotas_Dicas.put("/Editar_Dica/{id}", response_model=ResponseOk)
async def Editar_Dica(
    id: int,
    base: BaseEditarDica,
    _: int = Depends(verificar_jwt_admin),
    session: Session = Depends(get_sesion),
):
    """Edita uma dica sustentável."""

    return editar_dica(session, base, id)

@Rotas_Dicas.delete("/Del_Dica/{id}", response_model=ResponseOk)
async def Del_Dica(
    id: int,
    _: int = Depends(verificar_jwt_admin),
    session: Session = Depends(get_sesion),
):
    """Remove uma dica sustentável."""

    return excluir_dica(session, id)

@Rotas_Dicas.get("/Lista_Dica", response_model=ResponseAllDica)
async def Lista_Dica(
    id: int, _: int = Depends(verificar_jwt_admin),
    session: Session = Depends(get_sesion),
):
    """Mostra todas as ticas."""

    return list_dica(session,)

@Rotas_Dicas.post("/Mostra_Dica", response_model=ResponseOk)
async def Mostra_Dica(
    base: BaseDicaRecomendada,
    id_user: int = Depends(verificar_jwt_user),
    session: Session = Depends(get_sesion),
):
    """
    Mostra uma dica com base na meta e no consumo do usuario para um tipo específico.
    """

    return mostra_dica(session, id_user, base)

