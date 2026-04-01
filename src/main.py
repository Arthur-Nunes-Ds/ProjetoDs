from sys import exit
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config import HOST_FRONT
from src.routes import manger_route as mr
from src.services import admin_create, erros
from src.conection import get_sesion

#A "vida" da api -> configuração quando vc abre pela 1° fez a api ou fecha ela
#Linck da doc que fala mais sobre isso https://fastapi.tiangolo.com/advanced/events/
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        #pega um seção especifica
        session = next(get_sesion())
        admin_create(session)
    except erros.DuplicationUser: session.close()
    except erros.ErroInesperado:
        session.rollback()
        print("Server -> algo deu erra ao criar o admin. Finalizando a API")
        #finaliza a API
        exit(1)
    finally:
        #finaliza essa seção
        session.close()
    
    yield

#info da api
app = FastAPI(
    lifespan=lifespan,
    title='Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE Ecologic Tech',
    description = "O AEchoDE (Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE) é uma API \
    desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar \
    o consumo sustentável de recursos, permitindo a integração com aplicativo EchoDE. \n \
    \nPara Mais informação acesse a [github do projeto](https://github.com/NunesDevelloper/ProjetoDs/tree/nunes).",
    version="0.2.2", 
    openapi_tags=[
        {
            "name": "Public",
            "description": """
            Operações relacionadas aos usuários sem estar logado. \n
            """
        },
        {
            "name": "Cliente",
            "description": """
            Operações relacionadas aos usuários. Permite consultar, editar e deletar contas de usuário. \n
            Todos EndPoint que tiver um cateado devem receber o JWT no Heard \n \
            """
        },
        {
            "name": "Admin",
            "description":"""
             Operações relacionadas ao Admin serão substuita por uma ia,\n \
            admin ele é criado altomaticamente com base nas var de abiente do sistema. \n \
            Todos EndPoint que tiver um cateado devem receber o JWT no Heard \n \
            """
        }
    ]
)

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


app.include_router(mr)

