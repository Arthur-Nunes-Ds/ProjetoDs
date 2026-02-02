from fastapi import HTTPException,status, Depends
from fastapi.security import OAuth2PasswordBearer
from src.config import SECRETES_KEY, ALG
from jose import jwt, JWTError

#Base para trancar rota
oauth_schema = OAuth2PasswordBearer('/public/Logar_Conta')

def verificar_jwt(token: str = Depends(oauth_schema)):
    try:
        #Decodifica o token para um dicionário
        dic_info_u = jwt.decode(token, str(SECRETES_KEY), ALG)
        
        return int(dic_info_u["sub"])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='acesso negado'
        )
    
