from src.conection import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Meta(Base):
    #nome da tabela
    __tablename__ = "META"

    id = Column(Integer, primary_key=True)
    tipo_consumo = Column(String(255), nullable=True)
    valor_meta = Column(Integer, nullable=True)
    periodo = Column(DateTime, nullable=True)
    #Fk para o código de ralacionamento
    id_user = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), nullable=False)

    usuario = relationship(
        "Usuario",
        back_populates="metas"
    )

    def __init__(self, tipo_consumo: str,valor_meta: int, periodo: DateTime, usario_id :int):
        self.tipo_consumo = tipo_consumo
        self.valor_meta = valor_meta
        self.periodo = periodo
        self.id_user = usario_id


    

