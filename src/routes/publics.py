from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..db import get_sesion
from ..schemas import (BaseCriarUsuario, ResponseOk, 
                        ResponseLogarUser, BaseAltSenha)
from ..services import (criar_conta, logar_conta, 
                          enviar_email,verificar_email, 
                          verificar_email_senha)

Rotas_Publics = APIRouter()

@Rotas_Publics.post("/Criar_Conta", tags=["Cliente"], 
                    response_model=ResponseOk, 
                    responses={
                        409: {
                        "description": "já existe um cliente com esse email"},
                        501: {
                        "description": "Erro de autenticação no serviço de email."
                        },
                        503 :{
                            "description":"Serviço de email indisponível."
                              }
                    })
async def Criar_Conta(base: BaseCriarUsuario,
                      session: Session = Depends(get_sesion)):
    #documentação de como usar a api
    """\nCria um novo cliente no sistema."""
    
    resut_conta = criar_conta(base.nome,base.senha,base.email, session)

    await enviar_email(base.email, session)

    return resut_conta

@Rotas_Publics.get("/Email_Esqueceu_Senha/{email}", tags=["Cliente"],
                   response_model=ResponseOk,
                   responses={
                    409: {"description": "já existe um cliente com esse email"},
                    501: {"description": "Erro de autenticação no serviço de email."},
                    503 :{"description":"Serviço de email indisponível."},
                        })
async def Email_Restar_Senha(email: str, 
                             session: Session = Depends(get_sesion),):
    """ \n Manda Email para o Usuario caso o mesmo esqueceu a senha. """

    return await enviar_email(email, session, True)

@Rotas_Publics.put("/Email_Alterar_Senha/{jwt}", tags=["Cliente"],
                   response_model=ResponseOk,
                   responses={
                    404: {
                        "description":"Não há User Verificado com esse Email"
                    },
                    401:{
                        "description":"Não Autorizado"
                    },
                    403:{
                        "description":"Esse JWT não é valido para essa operação."
                    }
                    })
async def Alterar_Senha(jwt : str ,base: BaseAltSenha, 
                        session: Session = Depends(get_sesion)):
    """\n Alterar a senha de fato \n \
        Necessário passa o jwt que vai para o email do cliente."""

    return await verificar_email_senha(jwt, base.senha, session)

@Rotas_Publics.post("/Logar_Conta", tags=["Cliente"],
                    response_model=ResponseLogarUser,
                    responses={
                        404: {
                            "description":"Não há User Verificado com esse Email/Senha Inválida"
                        }
                    })
#OAuth2PasswordRequestForm: padrão do FastAPI para fazer autenticação mais simples no /docs
async def Logar_Conta(base: OAuth2PasswordRequestForm = Depends(), 
                      session: Session = Depends(get_sesion)):
    '''\n Realiza o login do cliente e retorna um token JWT. \n \n \
    O username = email \n \n \
    O password = senha \n \n \
    '''

    return logar_conta(base.username, base.password, session)

@Rotas_Publics.get("/Verificar_Email/{jwt}", tags=["Cliente"],
                   response_model=ResponseOk,
                   responses={
                       404: {
                            "description":"Não há User Verificado com esse Email"
                        },
                       401:{
                            "description":"JWT inválido"
                        },
                       403:{
                           "description":"Esse JWT não é valido para essa operação."
                       }
                   })
async def Verificar_Email(jwt : str, session: Session = Depends(get_sesion)):
   '''\n Verifica o link(jwt) do email do user.'''

   return verificar_email(jwt, session)