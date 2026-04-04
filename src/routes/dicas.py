from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..conection import get_sesion
from ..schemas.dicas import BaseCriarDica, BaseEditarDica
from ..schemas.geral import ResponseOk
from ..services import criar_dica, editar_dica, excluir_dica

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
async def Criar_Dica(base: BaseCriarDica, session: Session = Depends(get_sesion)):
    """Cria uma dica sustentável."""

    return criar_dica(session, base)

@Rotas_Dicas.put("/Editar_Dica/{id}", response_model=ResponseOk)
async def Editar_Dica(
    id: int, base: BaseEditarDica,session: Session = Depends(get_sesion),
):
    """Edita uma dica sustentável."""

    return editar_dica(session, base, id)

@Rotas_Dicas.delete("/Del_Dica/{id}", response_model=ResponseOk)
async def Del_Dica(id: int, session: Session = Depends(get_sesion)):
    """Remove uma dica sustentável."""

    return excluir_dica(session, id)
