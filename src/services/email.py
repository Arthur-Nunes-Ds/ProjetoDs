from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pathlib import Path
from src.config import EMAIL_GOOGLE,SENHA_DE_APP
from src.conection import get_session
from src.model import Usuario,Token, NotUser, InvalidTokenEmail, BaseEmailSend, BaseEmailToken
from email.message import EmailMessage
from smtplib import SMTP_SSL
from secrets import token_urlsafe

Rota_Email = APIRouter()

@Rota_Email.post("/Enviar_Email")
async def Enviar_Email(base : BaseEmailSend, session: Session = Depends(get_session)):
    '''\nEnviar um Email para o User.\
        \nParâmetros:\
        \n-email : str \
        \nRetorno:\
        \n-{"E-mail enviado com sucesso!"}.\
        \nErros:\
        \n-400: Erro aou enviar email.\
        \n-404: Cliente não cadastrado/encontrado.'''
    try:
        query = session.query(Usuario).filter_by(email = base.email).first()
        _nome = query.nome # type: ignore
        id_user = query.id # type: ignore
        if type(_nome) == None or type(id_user) == None:
            raise NotUser()
        
        token = token_urlsafe(5)
        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        msg['Subject'] = 'Confirmação de Email'
        msg['From'] = EMAIL_GOOGLE
        msg['To'] = base.email

        html_path = Path('src/templates/email_send.html')
        
        with open(html_path, 'r', encoding='utf-8') as f:
            html_file = f.read()

        html = html_file.format(user = _nome, token = token)

        #email mesagem, necesse caso um arquivo html
        msg.set_content(html, subtype='html')
        
        _token = Token(token, id_user) # type: ignore
        session.add(_token)
        session.commit()

    #aqui é para caso ocorra um erro .
        # conectar ao servidor SMTP do Gmail
        with SMTP_SSL('smtp.gmail.com', 465) as smtp:
            #loga na conta
            smtp.login(str(EMAIL_GOOGLE), str(SENHA_DE_APP)) 
            #enviar e-mail
            smtp.send_message(msg) 
            return("E-mail enviado com sucesso!")
        #caso acontesa um erro ele informa o erro 
    except NotUser:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há User com esse Email"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro aou enviar email"
        )
    
@Rota_Email.post("/Comfirmar_Email")
async def Comfirmar_Email(base: BaseEmailToken, session: Session= Depends(get_session)):
    try:
        query = session.query(Token).filter_by(token = base.token).first()

        if query is None: raise InvalidTokenEmail

        query.usuario.email_verificado = True
        query.usuario.qnt_tentativas = 0

        session.commit()
        return {"email confirmado com sucesso"}
    
    except InvalidTokenEmail:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="token invalido"
        )

    