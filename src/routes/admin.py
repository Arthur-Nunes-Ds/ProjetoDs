from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.conection import get_sesion
from src.schemas import ResponseOk, BaseEditarUsuarioi, ResponseDadosUser
from src.services import(all_user, verificar_jwt_admin)

Rota_t = APIRouter(
    responses={
        404: {
            "description":"Não há User Verificado com esse Email"
        },
        401:{
            "description":"Não Altorizado"
        }
    }
)

@Rota_t.get("/Dados_User")
async def Dados_User(id: int = Depends(verificar_jwt_admin), 
                     session: Session = Depends(get_sesion)):
    """\n Pega dados do user"""
    
    return id


