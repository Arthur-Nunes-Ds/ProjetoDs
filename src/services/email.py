from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pathlib import Path
from src.config import EMAIL_GOOGLE,SENHA_DE_APP
from src.conection import get_session
from src.model import (Usuario,Token, NotUser, InvalidTokenEmail, 
                       BaseEmailSend, BaseEmailToken,TetaivasDeEmailFaill)
from email.message import EmailMessage
from smtplib import SMTP_SSL
from secrets import token_urlsafe
from datetime import datetime, timezone

Rota_Email = APIRouter()

#SECTION - enviar email
@Rota_Email.post("/Enviar_Email")
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

        if query.qnt_tentativas > 4: # type: ignore
            #isso já deleta os token atribuido ao user
            session.delete(query)
            session.commit()
            raise TetaivasDeEmailFaill 
        else:
            query.qnt_tentativas += 1 # type: ignore

        token = token_urlsafe(5)
        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        msg['Subject'] = 'Confirmação de Email'
        msg['From'] = EMAIL_GOOGLE
        msg['To'] = base.email

        html_path = Path('src/templates/email_send.html')
        
        with open(html_path, 'r', encoding='utf-8') as f: html_file = f.read()

        html = html_file.format(user = query.nome, token = token)

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
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro aou enviar email"
        )
#!SECTION

#SECTION - confirma email
@Rota_Email.post("/Comfirmar_Email")
async def Comfirmar_Email(base: BaseEmailToken, session: Session= Depends(get_session)):
    '''\nEnviar um Email para o User.\
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
        if data_expire < agora_time_utc : raise InvalidTokenEmail

        #alteras os dados nessario no banco
        query.usuario.email_verificado = True
        query.usuario.qnt_tentativas = 0
        
        #deletar todos os tokens do user
        session.query(Token).filter_by(id_user = query.id_user).delete()

        #commita no banco
        session.commit()

        return {'mensagem':"email confirmado com sucesso"}
    except InvalidTokenEmail:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="token invalido"
        )
#!SECTION
 