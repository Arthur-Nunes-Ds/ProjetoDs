from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.conection import get_sesion
from src.schemas import ResponseOk, BaseEditarUsuarioiAdmin, ResponseAllUser
from src.services import(verificar_jwt_admin)

"""Rota_Admin = APIRouter(
    responses={
        404: {
            "description":"Não há User Verificado com esse Email"
        },
        401:{
            "description":"Não Altorizado"
        }
    },
    dependencies=Depends(verificar_jwt_admin)
)
"""




