import json
from pathlib import Path
from urllib.parse import quote_plus
from os import getenv
from dotenv import load_dotenv

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
    EXPIRATION_TIMER_MINUTES = int(getenv('EXPIRATION_TIMER_MINUTES', '5'))# type: ignore
except ValueError:
    print('erro na hora de carrega o tempo de exepiração do jwt o padrão dela vai ser 5 minutos')
    EXPIRATION_TIMER_MINUTES = 5
#!SECTION

#SECTION - agr 
#valores padrão
DEBUG = False
SQLITE = False
HOST_FRONT = ['*']

#tenta ler do arquivo temporário
config_file = Path('src/temp/.sgu_config.json')
if config_file.exists():
    with open(config_file, 'r') as f:
        dados = json.load(f)
        DEBUG = dados.get('DEBUG')
        SQLITE = dados.get('SQLITE')
        HOST_FRONT = dados.get('HOST_FRONT')
#!SECTION