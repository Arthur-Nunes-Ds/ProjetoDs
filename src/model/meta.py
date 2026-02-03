from src.conection import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime

class Meta(Base):
    #nome da tabela
    __tablename__ = "META"

    id = Column(Integer, primary_key=True)
    tipo_consumo = Column(String(255), nullable=False)
    valor_meta = Column(Float, nullable=False)
    periodo = Column(DateTime, nullable=False)
    #Fk para o código de ralacionamento
    id_user = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), nullable=False)

    usuario = relationship(
        "Usuario",
        back_populates="metas"
    )

    def __init__(self, tipo_consumo: str,valor_meta: float, periodo: datetime, usario_id :int):
        self.tipo_consumo = tipo_consumo
        self.valor_meta = valor_meta
        self.periodo = periodo
        self.id_user = usario_id


#SECTION - Schema
class BaseMetaCadastro(BaseModel):
    tipo_de_consumo : str
    valor_meta : float
    periodo: datetime 
class BaseMetaEditar(BaseModel):
    valor_meta : float
    periodo: datetime
    id: int

#!SECTION
