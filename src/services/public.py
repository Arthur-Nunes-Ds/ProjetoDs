from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import jwt
from datetime import datetime, timezone, timedelta
from src.config import SECRETES_KEY,ALG,EXPIRATION_TIMER_MINUTES
from src.conection import get_session
from src.model import Usuario, BaseCriarUsuario, NotUser, SenhaInvalida

Rota_Publics = APIRouter()

def criar_token(id_user):
    #Obtém o tempo atual e adiciona o tempo de expiração
    dt_expi = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_TIMER_MINUTES)
    #O dic_info está configurado com base no padrão JWT: https://www.jwt.io/
    dic_info = {'sub': str(id_user),'exp': dt_expi}
    #Cria o JWT
    jwt_codificado = jwt.encode(dic_info, SECRETES_KEY, ALG)#type: ignore
    return jwt_codificado

#SECTION - Criar_Conta
@Rota_Publics.post("/Criar_Conta")
async def Criar_Conta(base: BaseCriarUsuario, session: Session = Depends(get_session)):
    """\nCria um novo cliente no sistema.\
        \nPara criar um cliente, informe os dados na requisição.\
        \nParâmetros:\
        \n-nome : str \
        \n-email : str \
        \n-senha : str\
        \nRetorno:\
        \n-{"mensagem": "cliente criado com sucesso."}.\
        \nErros:\
        \n-409: Já existe um cliente com esse email."""
    try:
        user = Usuario(base.nome, base.email,base.senha)
        session.add(user)
        session.commit()
        return {'mensagem': 'cliente criado com sucesso'}
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='já existe um cliente com esse email'
        )
#!SECTION

#SECTION - Logar_Conta
@Rota_Publics.post("/Logar_Conta")
#OAuth2PasswordRequestForm: padrão do FastAPI para fazer autenticação mais simples no /docs
async def Logar_Conta(base: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    '''\nRealiza o login do cliente e retorna um token JWT.\
        \nPara autenticar, informe as credenciais na requisição.\
        \nParâmetros:\
        \n-username (email) : str \
        \n-password (senha) : str\
        \nRetorno:\
        \n-{"access_token": "...", "token_type": "bearer"}.\
        \nErros:\
        \n-401: Senha inválida.\
        \n-404: Cliente não cadastrado/encontrado.'''
    try:
        query = session.query(Usuario).filter_by(email = base.username, email_verificado = True).first()
        
        if query == None: raise NotUser
        
        if query.verificar_senha(base.password): _jwt = criar_token(query.id)
        else: raise SenhaInvalida

        return {
                "access_token": _jwt,
                "token_type": "bearer"
            }
    
    except NotUser:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há User Verificado com esse Email"
        )
    
    except SenhaInvalida:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha inválida."
        )
#!SECTION
