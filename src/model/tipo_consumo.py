from src.conection import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class TipoConsumo(Base):
    __tablename__ = "TIPO_CONSUMO"

    _id = Column(Integer, primary_key=True, name="id")
    _nome = Column(String(50), nullable=False, name="nome")
    _unidade_medida = Column(String(200), nullable=False, 
                    name="unidade_medida")

    meta = relationship(
        "Meta", 
        back_populates="tipo_consumo",
        cascade="all, delete",
        passive_deletes=True
    )

    dica_sustentavel = relationship(
        "DicaSustentavel", 
        back_populates="tipo_consumo",
        cascade="all, delete",
        passive_deletes=True
    )

    consumo = relationship(
        "Consumo", 
        back_populates="tipo_consumo",
        #cascade ="all, delete" => Se o user sumir todos os tokens dele somem automaticamente(isso quem vai fazer é o banco)
        cascade="all, delete",
        #fala para o banco cuidar de deletar os token caso o user suma
        passive_deletes=True
    )

    def __init__(self, nome: str, unidade_medida: str) -> None:
        self._nome = nome
        self._unidade_medida = unidade_medida

    @property
    def id(self) -> int: return self._id  # pyright: ignore[reportUndefinedVariable]

    @property 
    def nome(self) -> str: return str(self._nome)

    @nome.setter 
    def nome(self,novo_nome: str) -> None: self._nome = novo_nome

    @property 
    def unidadeMedida(self) -> str: return str(self._unidade_medida)

    @unidadeMedida.setter 
    def unidadeMedida(self,nova_unidade_medida: str) -> None: 
        self._unidade_medida = nova_unidade_medida

