from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.conection import get_sesion
from src.schemas import (BaseCriarUsuario, ResponseOk, 
                        ResponseLogarUser)
from src.services import (criar_conta, logar_conta, 
                          enviar_email,verificar_email)

Rotas_Publics = APIRouter()

#SECTION - Criar_Conta
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
    #documentação para de como usar há api
    """\nCria um novo cliente no sistema."""
    
    resut_conta = criar_conta(base, session)
    await enviar_email(base, session)

    return resut_conta
#!SECTION

#SECTION - Logar_Conta
@Rotas_Publics.post("/Logar_Conta", tags=["Cliente"],
                    response_model=ResponseLogarUser,
                    responses={
                        404: {
                            "description":"Não há User Verificado com esse Email"
                        },
                        401 : {
                            "description":"Senha Inváida"
                        }
                    })
#OAuth2PasswordRequestForm: padrão do FastAPI para fazer autenticação mais simples no /docs
async def Logar_Conta(base: OAuth2PasswordRequestForm = Depends(), 
                      session: Session = Depends(get_sesion)):
    '''\nRealiza o login do cliente e retorna um token JWT. \n \n \
    O username = email \n \n \
    O password = senha \n \n \
    '''

    return logar_conta(base, session)
#!SECTION

@Rotas_Publics.get("/Verificar_Email/{token}", tags=["Cliente"],
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
async def Verificar_Email(token : str, session: Session = Depends(get_sesion)):
   '''\nVerifica o linck(jwt) do email do user.'''

   return verificar_email(token, session)



