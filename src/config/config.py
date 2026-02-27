import json
from pathlib import Path
from urllib.parse import quote_plus
from os import getenv
from dotenv import load_dotenv
from datetime import timedelta

#leitura das var de ambiente
load_dotenv()

#SECTION - db
IP_DB = getenv("IP_DB")
#Garante que a senha com caracteres especiais seja lida como senha,
    #não como parte do endereço. Sem o quote_plus, o SQLAlchemy pode interpretar
    #'@' como parte do endereço, e não da senha.
#Caso a var com esse nome no .env ele passa um str
SENHA_DB = quote_plus(str(getenv("SENHA_DB", 'None')))
USER_DB = getenv("USER_DB")
BANCO_DB = getenv("BANCO_DB")
try:
    #tratamento para o int já que as var de ambiente são tratas como string automaticamente
    PORTA_DB = int(getenv("PORTA_DB", '3306')) 
except ValueError:
    print('erro na hora de carrega a porta do banco o padrão dela vai ser 3306')
    PORTA_DB = 3306
#!SECTION

#SECTION - jwt 
SECRETES_KEY = getenv('SECRETES_KEY')
#Ver se a SECRETES_KEY existe no .env e se ela tem algum conteudo de fato
if not SECRETES_KEY or not SECRETES_KEY.strip():
    class SecretKeyError(Exception): pass
    raise SecretKeyError('O sistema precisa da SECRETES_KEY do JWT no .env com um valor válido')
    
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

#SECTION - agr 
#valores padrão
DEBUG = False
SQLITE = False
HOST_FRONT = ['*']
POSTGRE = False
HOST = 'localhost'
PORT = 8080
HTTPS = False

#tenta ler do arquivo temporário
config_file = Path('src/temp/.sgu_config.json')
if config_file.exists():
    with open(config_file, 'r') as f:
        dados = json.load(f)
        DEBUG = dados.get('DEBUG')
        SQLITE = dados.get('SQLITE')
        HOST_FRONT = dados.get('HOST_FRONT')
        POSTGRE = dados.get("POSTGRE")
        HOST = dados.get("HOST")
        PORT = dados.get("PORT")
        HTTPS = dados.get("HTTPS")


#!SECTION


#SECTION - google
EMAIL_GOOGLE = getenv("EMAIL_GOOGLE")
SENHA_DE_APP = getenv("SENHA_DE_APP")

if not SENHA_DE_APP or not SENHA_DE_APP.strip():
    class SenhaAPP(Exception): pass
    raise SenhaAPP('O sistema precisa da SENHA_DE_APP do Google no .env com um valor válido')

if not EMAIL_GOOGLE or not EMAIL_GOOGLE.strip():
    class EmailGoogle(Exception): pass
    raise EmailGoogle('O sistema precisa da EMAIL_GOOGLE do Google no .env com um valor válido')

EMAIL_REDE = getenv("EMAIL_REDE", None)
#!SECTION

#SECTION - toke_email
try:
    EXPIRATION_TIMER_MINUTES_EMAIL = int(getenv('EXPIRATION_TIMER_MINUTES_EMAIL', '5'))# type: ignore
except ValueError:
    print('erro na hora de carrega o tempo de exepiração do jwt o padrão dela vai ser 5 minutos')
    EXPIRATION_TIMER_MINUTES_EMAIL = 5
#!SECTION

#SECTION - admin
USER_ADMIN = getenv('USER_ADMIN')
SENHA_ADMIN = getenv('SENHA_ADMIN')
if (not USER_ADMIN or not USER_ADMIN.strip()) or (not SENHA_ADMIN or not SENHA_ADMIN.strip()):
    class AmindError(Exception): pass
    raise AmindError('O sistema precisa da SENHA_ADMIN e/ou USER_ADMIN do .env com um valor válido')
#!SECTION

