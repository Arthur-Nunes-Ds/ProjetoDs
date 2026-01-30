from secrets import token_urlsafe
from fastapi import APIRouter, HTTPException, status, Depends
from email.message import EmailMessage
from src.config import EMAIL_GOOGLE, SENHA_DE_APP
from pathlib import Path
from src.model import EmailSend
from smtplib import SMTP_SSL

Rota_Email = APIRouter()

@Rota_Email.post("/Enviar_Email")
async def Enviar_Email(dados : EmailSend):
    #FIXME - add doc string esplicando as coisa

    #FIXME - add token data de expiração no banco
    token = token_urlsafe(5)
    #montar o e-mail, estrutura basica
    msg = EmailMessage()
    msg['Subject'] = 'Confirmação de Email'
    msg['From'] = EMAIL_GOOGLE
    msg['To'] = dados.email

    html_path = Path('src/templates/email_send.html')
    
    with open(html_path, 'r', encoding='utf-8') as f:
        html_file = f.read()

    html = html_file.format(user = dados.user, token = token)

    #email mesagem, necesse caso um arquivo html
    msg.set_content(html, subtype='html')
    #aqui é para caso ocorra um erro  
    try:
        # conectar ao servidor SMTP do Gmail
        with SMTP_SSL('smtp.gmail.com', 465) as smtp:
            #loga na conta
            smtp.login(str(EMAIL_GOOGLE), str(SENHA_DE_APP)) 
            #enviar e-mail
            smtp.send_message(msg) 
        return("E-mail enviado com sucesso!")
     #caso acontesa um erro ele informa o erro   
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro aou enviar email"
        )
    

