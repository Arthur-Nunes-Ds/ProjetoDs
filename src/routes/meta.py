from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..conection import get_sesion
from ..schemas.geral import ResponseOk
from ..schemas.meta import BaseCriarMeta, BaseEditarMeta, ResponseAllMeta
from ..services import criar_meta, del_meta, editar_meta, verificar_jwt_user
from ..services.meta_grud import list_meta

Rotas_Meta = APIRouter(
    responses={
        404: {
            "description": "Não há Meta cadastrada com esse id",
        },
        401: {
            "description": "Não Altorizado",
        },
    }
)

@Rotas_Meta.post("/Criar_Meta", response_model=ResponseOk)
async def Criar_Meta(
    base: BaseCriarMeta,id: int = Depends(verificar_jwt_user),session: Session = Depends(get_sesion),
):
    """\n Cria uma meta do usuário """

    return criar_meta(session, base, id)

@Rotas_Meta.put("/Editar_Meta/{id}", response_model=ResponseOk)
async def Editar_Meta(
    id: int,base: BaseEditarMeta,id_user: int = Depends(verificar_jwt_user),session: Session = Depends(get_sesion),
):
    """\n Edita uma meta do usuário autenticado."""

    return editar_meta(session, base, id, id_user)

@Rotas_Meta.delete("/Del_Meta/{id}", response_model=ResponseOk)
async def Del_Meta( 
    id: int,id_user: int = Depends(verificar_jwt_user),session: Session = Depends(get_sesion),
):
    """\n Remove uma meta do usuário """

    return del_meta(session, id, id_user)

@Rotas_Meta.get("/Listar_Metas", response_model=ResponseAllMeta)
async def Listar_Metas(
    id_user: int = Depends(verificar_jwt_user),session: Session = Depends(get_sesion),
):
    """\n Lista as metas do usuário  """

    return list_meta(session, id_user)
