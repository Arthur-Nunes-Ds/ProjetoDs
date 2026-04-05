import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from email_validator import validate_email, EmailNotValidError
from ..model import Usuario
from .jwt import criar_token, verificar_jwt
from .erros import (NoteUser, AutStmpServer,ErroInesperado,StmpIndisponivel, 
                    JwtNotEmail, JwtInvalido)
from ..config import (EMAIL_GOOGLE,SENHA_DE_APP, EMAIL_REDE, HOST_FRONT)

def is_valido_dns(email: str) -> bool:
    try:  
        #validate_email -> já ver as estrutura
        #check_deliverability -> para ver se o dns de fato existe
        validate_email(email, check_deliverability=True)
        return True
    except EmailNotValidError:
        return False

async def enviar_email(base: object, session : Session)-> dict :
    try:
        query = session.query(Usuario).filter_by(_email = base.email).first()  # type: ignore

        if query is None : raise NoteUser(session)

        jwt = criar_token(int(query.id), is_login = False)

        #ANCHOR - para efeitos de test isso aqui sera encaminhado para api(objetiov e para front)
        url = f"http://0.0.0.0:8080/public/Verificar_Email/{jwt}"

        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        #Assundo do email
        msg['Subject'] = 'Confirmação de Email'
        #que vai enviar
        if EMAIL_REDE is not None:
            msg['From'] = f"EchoDE <{EMAIL_REDE}>"
        else:
            msg["From"] = EMAIL_GOOGLE
        msg['To'] = query.email
        #htmll
        html =  f"""<!DOCTYPE html>  \n
        <head> \n
            <meta charset="UTF-8">\n
        </head>\n
        <!-- Arquivo Html só Para deixar o email mas bonito e com toque de proficonalismo -->\n
        <body style="font-family: Arial, sans-serif; padding: 20px; \n
            background: linear-gradient(118deg,rgba(125, 0, 251, 1) 17%,\n
            rgba(0, 0, 0, 1) 89%); color: azure; width: 100%; height: 300px;">\n
            <h1>Olá, {query.nome} !</h1>\n
            <p>Aqui está o linck para confirma seu email:</p>\n
            <div style="background-color: #ffffffa2; text-align: center; padding:1px ;border-radius: 5px;">\n
                <h3 style="color: #4CAF50; font-size: 24px;">\n
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
    
    except(NoteUser): raise

    except smtplib.SMTPAuthenticationError:
        raise AutStmpServer(session, erro) # type: ignore

    except (smtplib.SMTPServerDisconnected,smtplib.SMTPConnectError):
        raise StmpIndisponivel(session, erro) # type: ignore
    
    except Exception as erro:
        raise ErroInesperado(session, erro) # type: ignore

def verificar_email(token: str, session: Session) -> dict:
    try:
       id, is_login, _ = verificar_jwt(token)

       if is_login == True : raise JwtNotEmail(session)

       query = session.query(Usuario).filter_by(_id = id).first()
        
       if query is None: raise NoteUser(session)
     
       query.email_verificado = True

       session.commit()

       return {'mensagem':"Email convirmado com sucesso"}

    except (JwtNotEmail, NoteUser, JwtInvalido): raise 

    except Exception as e:
        raise ErroInesperado(e, session)

