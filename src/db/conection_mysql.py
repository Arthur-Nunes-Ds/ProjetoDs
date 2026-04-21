from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..config import BANCO_DB, SENHA_DB, USER_DB

endereco_db = f"mysql+pymysql://{USER_DB}:{SENHA_DB}@db:3306/{BANCO_DB}"

engine = create_engine(endereco_db) 

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

