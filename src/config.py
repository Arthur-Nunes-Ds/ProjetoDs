from urllib.parse import quote_plus
from os import getenv
from datetime import timedelta

#SECTION - db
#Garante que a senha com caracteres especiais seja lida como senha,
    #não como parte do endereço. Sem o quote_plus, o SQLAlchemy pode interpretar
    #'@' como parte do endereço, e não da senha.
SENHA_DB = quote_plus(str(getenv("SENHA_DB")))
USER_DB = getenv("USER_DB")
BANCO_DB = getenv("BANCO_DB")
#!SECTION

#SECTION - Admin
USER_ADMIN = getenv("USER_ADMIN")
if not USER_ADMIN or not USER_ADMIN.strip():
    class UserAdminErro(Exception): pass
    raise UserAdminErro("O sitema precisa do USER_ADMIN nas var de abiente/ .env")

SENHA_ADMIN = getenv("SENHA_ADMIN")
if not SENHA_ADMIN or not SENHA_ADMIN.strip():
    class UserSenhaAdminErro(Exception): pass
    raise UserSenhaAdminErro("O sitema precisa do SENHA_ADMIN nas var de abiente/ .env")

#!SECTION

#SECTION - jwt 
SECRETES_KEY = getenv('SECRETES_KEY')
#Ver se a SECRETES_KEY existe nas var de abiente/ .env e se ela tem algum conteudo de fato
if not SECRETES_KEY or not SECRETES_KEY.strip():
    class SecretKeyError(Exception): pass
    raise SecretKeyError('O sistema precisa da SECRETES_KEY do JWT nas var de abiente/ .env com um valor válido')
    
ALG = getenv('ALG')
if ALG == None:
    print('erro na hora de carrega o algorismo do jwt o padrão dele vair ser o \'HS256\'')
    ALG = 'HS256'

try:
    EXPIRATION_TIMER_JWT = int(getenv('EXPIRATION_TIMER_JWT'))# type: ignore
except ValueError:
    print('erro na hora de carrega o tempo de exepiração do jwt o padrão dela vai ser 5 minutos')
    EXPIRATION_TIMER_JWT = 5

timer = None

def tipo_de_timer(escolha: str):
    #M -> mês | A -> Anos | D -> dias
    #MM -> minutos | HH -> horas | SS -> segundos
    match escolha:
        case "M":
            return timedelta(days=EXPIRATION_TIMER_JWT * 30)
        case "A":
            return timedelta(days=EXPIRATION_TIMER_JWT * 365)
        case "D":
            return timedelta(days=EXPIRATION_TIMER_JWT)
        case "MM":
            return timedelta(minutes=EXPIRATION_TIMER_JWT)
        case "HH":
            return timedelta(hours=EXPIRATION_TIMER_JWT)
        case "SS":
            return timedelta(seconds=EXPIRATION_TIMER_JWT)
        case _:
            raise ValueError("Você não passou o tipo do jwt")

EXPIRATION_TIMER_JWT_TIPO = getenv("EXPIRATION_TIMER_JWT_TIPO")
if EXPIRATION_TIMER_JWT_TIPO == None:
    print("erro na hora de pega o tipode duração o padrão sera MM(minutos)")
    EXPIRATION_TIMER_JWT_TIPO = "MM"
else:
    timer = tipo_de_timer(EXPIRATION_TIMER_JWT_TIPO)

#!SECTION

#SECTION - front
VERIFICAR_EMAIL = getenv('VERIFICAR_EMAIL')

if not VERIFICAR_EMAIL or not VERIFICAR_EMAIL.strip():
    class VerificarEmail(Exception): pass
    raise VerificarEmail("O sitema precisa do RESETAR_SENHA nas var de abiente/ .env")

RESETAR_SENHA = getenv('RESETAR_SENHA')

if not RESETAR_SENHA or not RESETAR_SENHA.strip():
    class RestarEmail(Exception): pass
    raise RestarEmail("O sitema precisa do RESETAR_SENHA nas var de abiente/ .env")


ALLOW_ORIGINS = getenv('ALLOW_ORIGINS', ['*'])
if ALLOW_ORIGINS is str:
    ALLOW_ORIGINS = list(ALLOW_ORIGINS.split(","))

#!SECTION


#SECTION - google
EMAIL_GOOGLE = getenv("EMAIL_GOOGLE")
SENHA_DE_APP = getenv("SENHA_DE_APP")

if not SENHA_DE_APP or not SENHA_DE_APP.strip():
    class SenhaAPP(Exception): pass
    raise SenhaAPP('O sistema precisa da SENHA_DE_APP do Google nas var de abiente/ .env com um valor válido')

if not EMAIL_GOOGLE or not EMAIL_GOOGLE.strip():
    class EmailGoogle(Exception): pass
    raise EmailGoogle('O sistema precisa da EMAIL_GOOGLE do Google nas var de abiente/ .env com um valor válido')

EMAIL_REDE = getenv("EMAIL_REDE", None)
#!SECTION

#SECTION - toke_email
try:
    EXPIRATION_TIMER_MINUTES_EMAIL = int(getenv('EXPIRATION_TIMER_MINUTES_EMAIL', '5'))# type: ignore
except ValueError:
    print('erro na hora de carrega o tempo de exepiração do jwt o padrão dela vai ser 5 minutos')
    EXPIRATION_TIMER_MINUTES_EMAIL = 5
#!SECTION

REDIS_PASSWORD = getenv("REDIS_PASSWORD")
if not REDIS_PASSWORD or not REDIS_PASSWORD.strip():
    class RedisPassword(Exception): pass
    raise RedisPassword("O sitema precisa do REDIS_PASSWORD nas var de abiente/ .env")

