from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from jose import jwt, JWTError
from datetime import datetime, timezone
from .erros import ErroInesperado, JwtInvalido,AdminActionNotAllowed, JustAdmin
from ..config import SECRETES_KEY,ALG,timer

oauth_schema = OAuth2PasswordBearer('/public/Logar_Conta')

def criar_token(id_user: int, is_login : bool = True, 
                is_admin : bool= False) -> str:
    try:
        #Obtém o tempo atual e adiciona o tempo de expiração
        dt_expi = datetime.now(timezone.utc) + timer

        #O dic_info está configurado com base no padrão JWT: https://www.jwt.io/
        dic_info = {'sub': str(id_user),'exp': dt_expi, 
                    "is_login": is_login, "is_admin" : is_admin}
        #Cria o JWT
        jwt_codificado = jwt.encode(dic_info, SECRETES_KEY, ALG)#type: ignore
        return jwt_codificado
    
    except Exception as e:
        raise ErroInesperado(e)

def verificar_jwt(token: str) -> tuple[int, bool, bool]:
    try:
        dict_info = jwt.decode(token, str(SECRETES_KEY), str(ALG))
        id = int(dict_info['sub'])
        is_login = bool(dict_info['is_login'])
        is_admin = bool(dict_info["is_admin"])
        print(is_login)
        return id, is_login, is_admin
    
    except JWTError:
        raise JwtInvalido()
    
    except Exception as e:
        raise ErroInesperado(e)

def verificar_jwt_user(token = Depends(oauth_schema)) -> int:
    try:
        id, is_login, is_admin = verificar_jwt(token)
        
        if is_login == True: 

            if is_admin == True: raise AdminActionNotAllowed()
            else: return int(id)

        else: raise JwtInvalido()

    except (JwtInvalido, AdminActionNotAllowed): raise
    
    except Exception as e: raise ErroInesperado(e)

def verificar_jwt_admin(token = Depends(oauth_schema)) -> int:
    try:
        id, is_login, is_admin = verificar_jwt(token)
        
        if is_login == True: 

            if is_admin == True: return int(id)
            else: raise JustAdmin()
            
        else: raise JwtInvalido()
    
    except (JwtInvalido, JustAdmin): raise

    except Exception as e: raise ErroInesperado(e)


