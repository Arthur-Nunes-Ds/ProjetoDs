from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..model import Usuario
from .erros import DuplicationUser, RequestInvalida ,NoteUserSenha, ErroInesperado, DnsEmailNotExiste
from .jwt import criar_token
from .email import is_valido_dns

def criar_conta(nome: str, senha: str, email: str, session : Session) -> dict:
    try:
        if is_valido_dns(email) == False: raise DnsEmailNotExiste() 
        
        user : Usuario 

        user = Usuario(nome, email ,senha) 
    
        session.add(user)
        session.commit()
        return {'mensagem': 'cliente criado com sucesso'}
    
    except (DnsEmailNotExiste):
        # Re-lança as exceções customizadas sem modificar
        raise

    except IntegrityError:
        raise DuplicationUser(session)
    
    except Exception as e:
        raise ErroInesperado(e, session)
    
def logar_conta(email: str, senha: str, session: Session) -> dict :
    try:    
        query = session.query(Usuario).filter_by(_email = email, _email_verificado = True).first()  # type: ignore


        if query is None: raise NoteUserSenha(session)

        if query.verificarSenha(senha) and query.id == -1:  
            _jwt = criar_token(query.id, is_admin= True)
        
        elif query.verificarSenha(senha): 
            _jwt = criar_token(query.id)

        else: raise NoteUserSenha(session)

        return {
                "access_token": _jwt,
                "token_type": "bearer"
            }

    except (NoteUserSenha): raise

    except Exception as e:
        raise ErroInesperado(e, session)

def del_acont(id: int, session: Session) -> dict:
    try:

        query = session.query(Usuario).filter_by(_id = id).delete() 

        if query:
            session.commit()
            return {"mensagem": "cliente removido."}
        else: raise NoteUserSenha(session)

    except (NoteUserSenha) : raise

    except Exception as e:
        raise ErroInesperado(e, session)

def alterar_dados(id: int, senha: str  | None, nome: str | None, session: Session) -> dict:
    try:
        query = session.query(Usuario).filter_by(_id = id).first()

        if query:
            if senha != None :  query.novaSenha(senha)  
             
            if nome != None: query.nome = nome 

            if nome is None and senha is None: raise RequestInvalida(session)

        else: raise NoteUserSenha(session)

        session.commit()
        return {'mensagem': 'cliente editado com sucesso.'}

    except (NoteUserSenha, RequestInvalida) : raise

    except Exception as e:
        raise ErroInesperado(e, session)

def dados_user(id: int, session: Session):
    try:
        query = session.query(Usuario).filter_by(_id = id).first()

        if query is not None:
            return {
                'mensagem':{
                    'nome' : query.nome,
                    'email' : query.email,
                    "criado_em" : query.criado_em
                }
            }
        else: raise NoteUserSenha(session)
    
    except (NoteUserSenha): raise

    except Exception as e:
        raise ErroInesperado(e, session)   
