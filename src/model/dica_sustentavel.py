from ..conection import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class DicaSustentavel(Base):
    __tablename__ = "DICA_SUSTENTAVEL"

    _id = Column(Integer, primary_key=True, name="id")
    _descricao = Column(String(255), nullable=False, name="descricao")
    _nome = Column(String(50), unique=True, nullable=False, name="nome")
    _TIPO_CONSUMO_id = Column(Integer, 
                              ForeignKey('TIPO_CONSUMO.id', ondelete="CASCADE"), 
                              nullable=False, name="TIPO_CONSUMO_id")

    tipo_consumo = relationship(
        "TipoConsumo", 
        back_populates="dica_sustentavel",
    )

    def __init__(self, nome: str, descricao: str, TIPO_CONSUMO_id: int) -> None: # pyright: ignore[reportUndefinedVariable]
        self._nome = nome
        self._descricao = descricao

        self._TIPO_CONSUMO_id = TIPO_CONSUMO_id

    @property 
    def id(self) -> int: return self._id # type: ignore

    @property
    def TIPO_CONSUMO_id(self) -> int: return self._TIPO_CONSUMO_id # type: ignore

    @property
    def descricao(self) -> str: return str(self._descricao)

    @descricao.setter
    def descricao(self, nova_desc:str) -> None: self._descricao = nova_desc

    @property
    def nome(self) -> str: return str(self._nome)

    @nome.setter
    def nome(self, novo_nome:str) -> None: self._nome = novo_nome
