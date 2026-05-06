import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from email_validator import validate_email, EmailNotValidError
from ..model import Usuario
from .jwt import criar_token, verificar_jwt
from .erros import (NoteUserSenha, AutStmpServer,ErroInesperado,StmpIndisponivel, 
                    JwtNotEmail, JwtInvalido, RequestInvalida)
from ..config import (EMAIL_GOOGLE,SENHA_DE_APP, EMAIL_REDE, RESETAR_SENHA,VERIFICAR_EMAIL)
from ..db import redis_conection

def is_valido_dns(email: str) -> bool:
    try:  
        #validate_email -> já ver as estrutura
        #check_deliverability -> para ver se o dns de fato existe
        validate_email(email, check_deliverability=True)
        return True
    except EmailNotValidError:
        return False

async def enviar_email(email: str, session : Session, is_rest_senha: bool = False)-> dict :
    MSG = {
    "CONTEUDO_MSG" : ["confirmar seu email","resertar sua senha"],
    "SUBJECT" : ['Confirmação de Email', 'Resertar email'],
    "URL": [VERIFICAR_EMAIL, RESETAR_SENHA]
    }
    
    try:
        query = session.query(Usuario).filter_by(_email = email).first()

        if query is None : raise NoteUserSenha(session)

        jwt = criar_token(int(query.id), is_login = False, is_rest_senha=is_rest_senha)

        url = f"{MSG['URL'][is_rest_senha]}/{jwt}"

        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        #Assundo do email
        msg['Subject'] = MSG["SUBJECT"][is_rest_senha] 
        #que vai enviar
        if EMAIL_REDE is not None:
            msg['From'] = f"EchoDE <{EMAIL_REDE}>"
        else:
            msg["From"] = EMAIL_GOOGLE
        msg['To'] = query.email
        #html
        html =  f"""<!DOCTYPE html>  \n
        <head> \n
            <meta charset="UTF-8">\n
        </head>\n
        <!-- Arquivo Html só Para deixar o email mas bonito e com toque de proficonalismo -->\n
        <body style="font-family: Arial, sans-serif; padding: 20px; \n
            background: #ffffff,\n
            ; color: #3b82f6; width: 100%; height: 300px;">\n
            <h1>Olá, {query.nome} !</h1>\n
            <p>Aqui está o linck para {MSG["CONTEUDO_MSG"][is_rest_senha]}: </p>\n
            <div style="background-color: #ffffffa2; text-align: center; padding:1px ;border-radius: 5px;">\n
                <h3 style="color: #3b82f6; font-size: 24px;">\n
                    <a href="{url} ">click-me</a></h3>\n
            </div>\n
            <p>Esse email foi gerado altomaticamente. Não o responda.\n
                Atenciosamente,\n
            <br>Equipe da EchoDE Ecologic Tech</p>\n
        </body>\n
        </html>
        """
        #email mesagem, necesse caso um arquivo html
        msg.set_content(html, subtype='html')

        #aqui é para caso ocorra um erro .
            # conectar ao servidor SMTP do Gmail
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            #loga na conta
            smtp.login(str(EMAIL_GOOGLE), str(SENHA_DE_APP)) 
            #enviar e-mail
            smtp.send_message(msg) 
        
        return{'mensagem':"E-mail enviado"}
    
    except(NoteUserSenha): raise

    except smtplib.SMTPAuthenticationError:
        raise AutStmpServer(session, erro) # type: ignore

    except (smtplib.SMTPServerDisconnected,smtplib.SMTPConnectError):
        raise StmpIndisponivel(session, erro) # type: ignore
    
    except Exception as erro:
        raise ErroInesperado(session, erro) # type: ignore

def verificar_email(token: str, session: Session) -> dict:
    try:
        id, is_login, _ , is_rest_senha, jit = verificar_jwt(token)

        if redis_conection.exists(f"usado:{jit}"): raise JwtInvalido()
        redis_conection.setex(f"usado:{jit}", 900, "true")
            
        if is_login == True and is_rest_senha == False: raise JwtNotEmail(session)        
        query = session.query(Usuario).filter_by(_id = id).first()
        if query is None: raise NoteUserSenha(session)
        query.email_verificado = True       
        session.commit()   
        return {'mensagem':"Email convirmado com sucesso"}

    except (JwtNotEmail, NoteUserSenha, JwtInvalido): raise 

    except Exception as e: raise ErroInesperado(e, session)

async def verificar_email_senha(token: str,senha: str ,session: Session)-> dict:
    try:
        id, is_login, is_admin , is_rest_senha, jit = verificar_jwt(token)

        if is_login == True or is_admin == True or is_rest_senha == False: 
            raise JwtNotEmail(session)
        
        if redis_conection.exists(f"usado:{jit}"): raise JwtNotEmail(session)
        redis_conection.setex(f"usado:{jit}", 900, "true")
       
        query = session.query(Usuario).filter_by(_id = id).first()
        if query is None: raise NoteUserSenha(session)
        query.novaSenha(senha)       
        session.commit()   
        return {'mensagem':"Senha Alterada"}
    
    except (JwtNotEmail, NoteUserSenha, JwtInvalido, RequestInvalida): raise 

    except Exception as e: raise ErroInesperado(e, session)
