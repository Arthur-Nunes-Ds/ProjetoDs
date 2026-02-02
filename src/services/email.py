from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.config import EMAIL_GOOGLE,SENHA_DE_APP, EMAIL_REDE
from src.conection import get_session
from src.model import (Usuario,Token, NotUser, InvalidTokenEmail, 
                       BaseEmailSend, BaseEmailToken,TetaivasDeEmailFaill, IncompletePostRequest)
from email.message import EmailMessage
from smtplib import SMTP_SSL
from secrets import token_urlsafe
from datetime import datetime, timezone

Rota_Email = APIRouter()

#SECTION - enviar email
@Rota_Email.post("/Enviar_Email", tags=["Public"])
async def Enviar_Email(base : BaseEmailSend, session: Session = Depends(get_session)):
    '''\nEnviar um Email para o User.\
        \nParâmetros:\
        \n-email : str \
        \nRetorno:\
        \n-{'mensagem':"E-mail enviado com sucesso!"}.\
        \nErros:\
        \n-400: Erro aou enviar email.\
        \n-404: Cliente não cadastrado/encontrado.\
        \n-423: Envio de email exdido'''
    try:
        query = session.query(Usuario).filter_by(email = base.email).first() 

        if query is None: raise NotUser()

        if bool(query.email_verificado) == False:
            if query.qnt_tentativas > 4 : # type: ignore
                #isso já deleta os token atribuido ao user
                session.delete(query)
                session.commit()
                raise TetaivasDeEmailFaill 
            else:
                query.qnt_tentativas += 1 # type: ignore

        token = token_urlsafe(5)
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
        html =  f"""<!DOCTYPE html> \n 
                        <html>\n 
                        <head>\n 
                            <meta charset="UTF-8">\n
                        </head>\n
                        <!-- Arquivo Html só Para deixar o email mas bonito e com toque de proficonalismo -->\n
                        <body style="font-family: Arial, sans-serif; padding: 20px; \n
                        background: linear-gradient(118deg,rgba(125, 0, 251, 1) 17%,\n
                        rgba(0, 0, 0, 1) 89%); color: azure; width: 100%; height: 300px;">\n
                            <h1>Olá, {query.nome} !</h1>\n
                            <p>Aqui está o código para confirma seu email:</p>\n
                            <div style="background-color: #ffffffa2; text-align: center; padding:1px ;border-radius: 5px;">\n
                                <h3 style="color: #4CAF50; font-size: 24px;">{token}</h3>\n
                            </div>\n
                            <p>Esse email foi gerado altomaticamente. Não o responda.\n
                            Atenciosamente,\n
                            <br>Equipe da EchoDE Ecologic Tech</p>\n
                        </body>\n
                        </html>"""

        #email mesagem, necesse caso um arquivo html
        msg.set_content(html, subtype='html')
        
        query_token = Token(token, query.id)  # type: ignore
        session.add(query_token)
        session.commit()

    #aqui é para caso ocorra um erro .
        # conectar ao servidor SMTP do Gmail
        with SMTP_SSL('smtp.gmail.com', 465) as smtp:
            #loga na conta
            smtp.login(str(EMAIL_GOOGLE), str(SENHA_DE_APP)) 
            #enviar e-mail
            smtp.send_message(msg) 

        return{'mensagem':"E-mail enviado com sucesso!"}
        #caso acontesa um erro ele informa o erro 
    except NotUser:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há User com esse Email"
        )
    except TetaivasDeEmailFaill:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Limite de Email atigindo. Refaça o cadastro"
        )
    except IncompletePostRequest:
        session.rollback()
        raise HTTPException(
            status_code= status.HTTP_424_FAILED_DEPENDENCY,
            detail="Não foi passado nem o email nem o jwt"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro aou enviar email"
        )
#!SECTION

#SECTION - 1° confirma email
@Rota_Email.post("/Comfirmar_Email", tags=["Public"])
async def Comfirmar_Email(base: BaseEmailToken, session: Session= Depends(get_session)):
    '''\nRecebe o código do email para o user confirma a conta.\
        \nParâmetros:\
        \n-token : str \
        \nRetorno:\
        \n-{'mensagem':"email confirmado com sucesso"}.\
        \nErros:\
        \n-406: token invalido'''
    try:
        query = session.query(Token).filter_by(token = base.token).first()

        if query is None: raise InvalidTokenEmail
        
        agora_time_utc = datetime.now(timezone.utc)
        #converte o tempo do mysql para o tempo do python
        data_expire = query.data_expire.replace(tzinfo=timezone.utc)

        #se o data_expire estiver no passado faça ...
        if data_expire < agora_time_utc : 
            try:
                session.delete(query)
                session.commit()
            finally:  
                raise InvalidTokenEmail

        #alteras os dados nessario no banco
        query.usuario.email_verificado = True
        query.usuario.qnt_tentativas = 0
        
        #deletar todos os tokens do user
        session.query(Token).filter_by(id_user = query.id_user).delete()

        #commita no banco
        session.commit()

        return {'mensagem':"email confirmado com sucesso"}
    except InvalidTokenEmail:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="token invalido"
        )
#!SECTION

