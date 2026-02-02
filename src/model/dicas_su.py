from src.conection import Base
from sqlalchemy import Column, Integer, String

class Dica_Su(Base):
    #nome da tabela
    __tablename__ = "DICA_SUSTENTAVEL"

    id = Column(Integer, primary_key=True)
    tipo_consumo = Column(String(255))
    descricao = Column(String(255))

    def __init__(self, tipo_consumo: str, descricao: str):
        self.tipo_consumo = tipo_consumo
        self.descricao = descricao

