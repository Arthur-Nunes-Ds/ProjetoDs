from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import HOST_FRONT
from .routes import manger_route as mr
from .services import admin_create, erros
from .conection import get_sesion

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
    lifespan=lifespan,  # type: ignore
    title='Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE Ecologic Tech',
    description = "O AEchoDE (Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE) é uma API \
    desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar \
    o consumo sustentável de recursos, permitindo a integração com aplicativo EchoDE. \n \
    \nPara Mais informação acesse a [github do projeto](https://github.com/NunesDevelloper/ProjetoDs/tree/nunes).",
    version="1.0.0", 
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
            "name":"Meta",
            "description":"""
            Operações relacionadas ao cadastro do consumo do usuario. \n \
            Todos os EndPoint devem receber o JWT no Heard \n \
            """
        },
        {
            "name":"Tipo Consumo",
            "description":"""
            Operações relacionadas ao CRUD do Tipo de Consumo só o Adm pode altera esse tipo. \n \
            Todos EndPoint que tiver um cateado devem receber o JWT no Heard \n \
            """
        },
        {
            "name":"Consumo",
            "description":"""
            Operações relaciondas ao CRUD do Consumo do User \n \
            Todos EndPoint deve receber o JWT no Heard \n \
            """
        },
        {
            "name":"Dicas",
            "description":"""
            Operações relaciondas as Dicas de Redução de Gasto \n \
            Todos EndPoint deve receber o JWT no Heard \n \
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
