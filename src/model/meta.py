from ..db import Base
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime

class Meta(Base):
    __tablename__ = "META"

    _id = Column(Integer, primary_key=True, name="id")
    _valor_meta = Column(Float, nullable=False, name="valor_meta")
    _periodo = Column(DateTime, nullable=True, name="periodo")
    _USUARIO_id = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), 
                         nullable=False, name="USUARIO_id")
    _TIPO_CONSUMO_id = Column(Integer, ForeignKey('TIPO_CONSUMO.id', ondelete="CASCADE"), 
                        nullable=False, name="TIPO_CONSUMO_id")
        
    tipo_consumo = relationship(
        "TipoConsumo", 
        back_populates="meta",
    )

    usuario = relationship(
        "Usuario",
        back_populates="meta"
    )

    def __init__(self, valor_meta: float, periodo : datetime
                 ,TIPO_CONSUMO_id: int,USUARIO_id: int) -> None: 
        self._valor_meta = valor_meta
        self._periodo = periodo
        self._USUARIO_id = USUARIO_id
        self._TIPO_CONSUMO_id = TIPO_CONSUMO_id

    @property 
    def id(self) -> int: return self._id  # type: ignore

    @property
    def tipoConsumoId(self) -> int: return self._TIPO_CONSUMO_id  # type: ignore
    @property
    def UsuarioID(self) -> int: return self._USUARIO_id  # type: ignore

    @property
    def valorMeta(self) ->float: return self._valor_meta # type: ignore

    @valorMeta.setter
    def valorMeta(self, new_valor: float) -> None: 
        self._valor_meta = new_valor

    @property
    def periodo(self) -> datetime: return self._periodo # type: ignore

    @periodo.setter
    def periodo(self, new_dt: datetime) -> None: self._periodo = new_dt

