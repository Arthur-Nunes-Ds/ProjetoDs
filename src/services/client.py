from src.conection import get_session
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException,status, Depends
from src.model import Usuario
from .depeds import verificar_jwt

Rota_Cliente = APIRouter()

#SECTION - Dell User
#A Depends indica que a rota depende de verificar_jwt
@Rota_Cliente.delete('/dell_user')
async def dell_user(id_user: int = Depends(verificar_jwt),session: Session = Depends(get_session)):
    """Remove o cliente pelo JWT. \
    \nAutenticação: Envie o JWT no header: Authorization: Bearer <token>\
    \nRetorno:\
    \n-{"mensagem": "cliente removido."}\
    \nErros:\
    \n-404: cliente não cadastrado/encontrado."""
    query_u = session.query(Usuario).filter_by(id = id_user, email_verificado = 1).delete()

    if query_u:
        session.commit()
        return {"mensagem": "cliente removido."}
    else:
        raise HTTPException(
             status_code=status.HTTP_404_NOT_FOUND,
             detail="cliente não cadastrado/encontrado."
        )
#!SECTION

