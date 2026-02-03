from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from src.config import HOST_FRONT
from .services import Rota_Publics, Rota_Email, Rota_Cliente, Rotas_Metas

#info da api
app = FastAPI(title='Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE Ecologic Tech',
    description = "O AEchoDE (Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE) é uma API \
    desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar \
    o consumo sustentável de recursos, permitindo a integração com aplicativo EchoDE.",
    version="0.2.2")

#Configuração de CORS (Cross-Origin Resource Sharing) -> isso permite que o backend
    #se comunique com o frontend, mesmo que estejam em domínios diferentes.
app.add_middleware(
    CORSMiddleware,
    #quem pode fazer requisições para o bac
    allow_origins=HOST_FRONT,  
    #permite que o navegado envie credenciais(cookies, jwt) junto da requisição
    allow_credentials=True,
    #permite os metedos como get, post, etc.
    allow_methods=["*"], 
    #permite todos os tipos de cabeçalhos numa requisição.
    allow_headers=["*"],
)

#include_in_schema => indica se a rota será exibida no /docs ou não.
    #O padrão é que ela será exibida.
@app.get('/', include_in_schema=False)
def home_to_doc():
    #Toda vez que o usuário acessar essa rota, ele será redirecionado
    #automaticamente para /docs.
    return RedirectResponse(url='/docs')

#SECTION public
app.include_router(
    #Todas as rotas deste grupo começarão com /public.
    Rota_Publics,
    #Define o prefixo do endpoint. Para qualquer função neste roteador,
    #o caminho ficará assim: /public/endpoint — o endpoint pode mudar, mas /public não.
    prefix='/public',
    #Organiza as rotas deste grupo na documentação (/docs).
    tags=["Public"]
)
#!SECTION

#SECTION - email
app.include_router(
    Rota_Email,
    prefix='/emial',
    tags=["Email"]
)
#!SECTION

#SECTION - cliente
app.include_router(
    Rota_Cliente,
    prefix='/client',
    tags=["Cliente"]
)
#!SECTION

#SECTION - Metas
app.include_router(
    Rotas_Metas,
    prefix="/metas",
    tags=["Metas"]
)
#!SECTION
