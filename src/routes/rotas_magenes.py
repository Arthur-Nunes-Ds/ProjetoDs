from fastapi.responses import RedirectResponse
from fastapi import APIRouter
from .publics import Rotas_Publics
from .user import Rotas_User
from .tipo_consumo import Rotas_Tipo_Consumo
from .dicas import Rotas_Dicas
from .meta import Rotas_Meta
from .consumo import Rotas_Consumo
from .iot import Rotas_Iot
from .st_schema import Rotas_ST
from ..schemas import Reposne500

manger_route = APIRouter(responses={
    422:{"description":"Pasrametro do Request body invalido"},
    500:{"description":"Erro interno no servidor",
         "model":Reposne500}
})

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
    Rotas_Tipo_Consumo,
    prefix="/tipo_consumo",
    tags=["Tipo Consumo"]
)

manger_route.include_router(
    Rotas_Dicas,
    prefix="/dicas",
    tags=["Dicas"]
)

manger_route.include_router(
    Rotas_Meta,
    prefix="/meta",
    tags=["Meta"]
)

manger_route.include_router(
    Rotas_Consumo,
    prefix="/consumo",
    tags=["Consumo"]
)

manger_route.include_router(
    Rotas_Iot,
    prefix="/iot",
    tags=["Iot"]
)

manger_route.include_router(
    Rotas_ST,
    prefix="/st",
    tags=["SmartThings"]
)
