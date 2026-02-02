from src.conection import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Consumo(Base):
    #nome da tabela
    __tablename__ = "CONSUMO"

    id = Column(Integer, primary_key=True)
    tipo_consumo = Column(String(255), nullable=True, unique=True)
    valor = Column(Integer, nullable=True)
    data_registro = Column(DateTime, nullable=True)
    und_mediada =  Column(String(50), nullable=True, name="unidade_medida")
    #Fk para o código de ralacionamento
    id_user = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), nullable=False)

    usuario = relationship(
        "Usuario",
        back_populates="consumo"
    )

    def __init__(self, tipo_consumo: str,valor: int, 
                 data_registro: DateTime, usario_id :int, und_mediada: str):
        self.tipo_consumo = tipo_consumo
        self.valor = valor
        self.und_mediada = und_mediada
        self.data_registro = data_registro
        self.id_user = usario_id



    

