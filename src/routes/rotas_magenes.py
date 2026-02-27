from fastapi.responses import RedirectResponse
from fastapi import APIRouter
from .publics import Rotas_Publics
from .user import Rotas_User
from .admin import Rota_t
from src.schemas import Reposne500

manger_route = APIRouter(responses={
    422:{"description":"Pasrametro do Request body invalido"},
    500:{"description":"Erro interno no servidor",
         "model":Reposne500}
})

#include_in_schema => indica se a rota será exibida no /docs ou não.
    #O padrão é que ela será exibida.
@manger_route.get("/",include_in_schema=False)
async def home_to_doc():
    #Toda vez que o usuário acessar essa rota, ele será redirecionado
    #automaticamente para /docs.
    return RedirectResponse(url='/docs')

manger_route.include_router(
    Rotas_Publics,
    prefix='/public',
    tags=["Public"]
)

manger_route.include_router(
    Rotas_User,
    prefix="/user",
    tags=["Cliente"]
)

manger_route.include_router(
    Rota_t
)
