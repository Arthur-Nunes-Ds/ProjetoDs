from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model import Usuario
from .erros import DuplicationUser, RequestInvalida ,NoteUser, SenhaInvalida, ErroInesperado, DnsEmailNotExiste
from .jwt import criar_token
from .email import is_valido_dns

def criar_conta(Base: object, session : Session) -> dict:
    try:
        if is_valido_dns(Base.email) == False: raise DnsEmailNotExiste()  # type: ignore

        user = Usuario(Base.nome, Base.email ,Base.senha) # type: ignore

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
    
def logar_conta(Base: object, session: Session) -> dict :
    try:    
        query = session.query(Usuario).filter_by(_email = Base.username, _email_verificado = True).first()  # type: ignore


        if query is None: raise NoteUser(session)
            
        if query.verificarSenha(Base.password):  # type: ignore
            _jwt = criar_token(query.id)
        
        #elif query.verificarSenha(Base.password) and query.nome == USER_ADMIN: # type: ignore
        #    _jwt = criar_token(query.id, is_admin= True)

        else: raise SenhaInvalida(session)

        return {
                "access_token": _jwt,
                "token_type": "bearer"
            }

    except (NoteUser, SenhaInvalida): raise

    except Exception as e:
        raise ErroInesperado(e, session)

def del_acont(id: int, session: Session) -> dict:
    try:

        query = session.query(Usuario).filter_by(_id = id).delete() 

        if query:
            session.commit()
            return {"mensagem": "cliente removido."}
        else: raise NoteUser(session)

    except (NoteUser) : raise

    except Exception as e:
        raise ErroInesperado(e, session)

def alterar_dados(id: int, Base : object, session: Session) -> dict:
    try:
        query = session.query(Usuario).filter_by(_id = id).first()

        if query:
            if Base.senha != None :  # type: ignore
                query.novaSenha(Base.senha)  # type: ignore
                
            if Base.nome != None: # type: ignore
                query.nome = Base.nome # type: ignore

            if Base.nome is None and Base.senha is None: # type: ignore
                raise RequestInvalida(session)

        else: raise NoteUser(session)

        session.commit()
        return {'mensagem': 'cliente editado com sucesso.'}

    except (NoteUser, RequestInvalida) : raise

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
        else: raise NoteUser(session)
    
    except (NoteUser): raise

    except Exception as e:
        raise ErroInesperado(e, session)
    
    
