from src.conection import get_session
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException,status, Depends
from src.model import Usuario, BaseEditarUsuario
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

#SECTION - Dados do User
@Rota_Cliente.get("/dados_user")
async def get_dados_user(id_user: int = Depends(verificar_jwt), session: Session = Depends(get_session)):
    """\nObtém os dados do cliente (nome e email).\
    \nAutenticação: Envie o JWT no header: Authorization: Bearer <token>\
    \nRetorno:\
    \n-{"mensagem": {"nome": ..., "email": ...}}.\
    \nErros:\
    \n-404: cliente não encontrado."""
    query_u = session.query(Usuario).filter_by(id = id_user).first()

    if query_u != None:
        return {
            'mensagem':{
                'nome' : query_u.nome,
                'email' : query_u.email
            }
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Cliente não existe.'
        )
#!SECTION

#SECTION - editar dados
@Rota_Cliente.post("/editar_dados")
async def edit_dados(base: BaseEditarUsuario,id_user: int = Depends(verificar_jwt), session: Session = Depends(get_session)):
    """\nEdita dados do cliente (nome e/ou senha).\
    \nAutenticação: Envie o JWT no header: Authorization: Bearer <token>\
    \nPara não alterar um campo, não o envie na requisição.\
    \nParâmetros:\
    \n-nome : str \
    \n-senha : str\
    \nPermissões: cliente \\ adm.\
    \nRetorno:\
    \n-{"mensagem": "cliente editado com sucesso."}.\
    \nErros:\
    \n-421: Informe um novo nome ou uma nova senha.\
    \n-404: Cliente não cadastrado/encontrado."""

    query_u = session.query(Usuario).filter_by(id = id_user, role = 'cliente').first()
    if query_u:
        if base.senha != None :
            query_u.altera_senha(base.senha)
            
        if base.nome != None:
            query_u.nome = base.nome
            
        if base.nome == None and base.senha == None:
            raise HTTPException(
                status_code=status.HTTP_421_MISDIRECTED_REQUEST,
                detail='Informe um novo Nome ou uma nova Senha.'
            )

        session.commit()
        return {'mensagem': 'cliente editado com sucesso.'}
    else:
        raise HTTPException(
             status_code=status.HTTP_404_NOT_FOUND,
             detail="Cliente não cadastrado/encontrado."
        )
#!SECTION



