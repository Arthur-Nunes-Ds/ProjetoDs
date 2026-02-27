from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from src.config import DEBUG, SQLITE, USER_DB,SENHA_DB,IP_DB,PORTA_DB,BANCO_DB,POSTGRE

endereco_db = None

if DEBUG == True and SQLITE == True:
    endereco_db = "sqlite:///src/temp/banco.db"
elif POSTGRE == False:  
    endereco_db = f"mysql+pymysql://{USER_DB}:{SENHA_DB}@{IP_DB}:{PORTA_DB}/{BANCO_DB}"
else:
    endereco_db = DATABASE_URL = f"postgresql+psycopg2://{USER_DB}:{SENHA_DB}@{IP_DB}:{PORTA_DB}/{BANCO_DB}"

try:
    #Cria a engine para conectar o python ao mysql
        #assim ele jpá pega o fuso do banco 
    engine = create_engine(endereco_db) 
    #Cria uma conxeção e depois fecha a mesma conexeção
    engine.connect().close()
    #Esse erro acontece quando o SQLalchemy não consegue se conectar com a DB
    print("Server -> Conectado ao Banco MySQL" if POSTGRE == False else 
          "Server -> Conectado ao Banco PostgreSQL")
except OperationalError as e:
    print(e)
    print('Server -> não foi possivel conectar com o MysQLL\\PostgerSQL\n \
           Iniciando o o sqlite.')
    engine = create_engine("sqlite:///src/temp/banco.db")

#Classe base para os modelos
Base = declarative_base()

#Cria a sessão para manipular a db
Session = sessionmaker(bind=engine)

#Garante que, ao usar a ORM como dependência, a sessão será fechada automaticamente
def get_sesion():
    session = Session()
    try:
        yield session
    finally:
        session.close()

