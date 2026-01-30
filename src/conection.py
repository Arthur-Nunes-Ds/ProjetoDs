from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from src.config import DEBUG, SQLITE, USER_DB,SENHA_DB,IP_DB,PORTA_DB,BANCO_DB

endereco_db = None

if DEBUG == True and SQLITE == True:
    endereco_db = "sqlite:///src/temp/banco.db"
else:  
        endereco_db = f"mysql+pymysql://{USER_DB}:{SENHA_DB}@{IP_DB}:{PORTA_DB}/{BANCO_DB}"
    
try:
    #Cria a engine para conectar o python ao mysql
    engine = create_engine(endereco_db) 
    #Cria uma conxeção e depois fecha a mesma conexeção
    engine.connect().close()
    #Esse erro acontece quando o SQLalchemy não consegue se conectar com a DB
except OperationalError:
    print('Servidor não consigui se conectar com o MysQLL.\n \
           Iniciando o o sqlite.')
    engine = create_engine("sqlite:///src/temp/banco.db")

#Classe base para os modelos
Base = declarative_base()

#Cria a sessão para manipular a db
Session = sessionmaker(bind=engine)

#Garante que, ao usar a ORM como dependência, a sessão será fechada automaticamente
def get_session():
    session = Session()
    try:
        yield session
    finally:
        session.close()
