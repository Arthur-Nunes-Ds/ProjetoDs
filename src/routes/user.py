from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.conection import get_sesion
from src.schemas import ResponseOk, BaseEditarUsuarioi, ResponseDadosUser

from src.services import( del_acont, alterar_dados, 
                         dados_user, verificar_jwt_user )

Rotas_User = APIRouter(
    responses={
        404: {
            "description":"Não há User Verificado com esse Email"
        },
        401:{
            "description":"Não Altorizado"
        }
    }
)

@Rotas_User.get("/Dados_User",
                response_model=ResponseDadosUser)
async def Dados_User(id: int = Depends(verificar_jwt_user), 
                     session: Session = Depends(get_sesion)):
    """\n Pega dados do user"""
    return dados_user(id, session)

@Rotas_User.delete("/Del_User",
                   response_model=ResponseOk)
async def Dell_User(id: int = Depends(verificar_jwt_user), 
                     session: Session = Depends(get_sesion)):
    """\n Deletar o User"""
    return del_acont(id, session)

@Rotas_User.put("/Editar_User",
                response_model=ResponseOk)
async def Editar_User(base : BaseEditarUsuarioi, id: int = Depends(verificar_jwt_user), 
                     session: Session = Depends(get_sesion)):
    """\n Alterar dados do user \n \n \
        nome | senha é opicional \
        OS DOIS PAREMETROS NÃO PODE SER Null\n \n \
    """

    return alterar_dados(id, base, session)

