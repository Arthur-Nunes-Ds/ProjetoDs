from ..conection import Base
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime

class Consumo(Base):
    __tablename__ = "CONSUMO"

    _id = Column(Integer, primary_key=True,name="id")
    _valor = Column(Float, nullable=False, name="valor")
    _data_registro = Column(DateTime, nullable=True,name="data_registro")
    _USUARIO_id = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), 
                         nullable=False, name="USUARIO_id")
    _TIPO_CONSUMO_id = Column(Integer, ForeignKey('TIPO_CONSUMO.id', ondelete="CASCADE")
                              , nullable=False, name="TIPO_CONSUMO_id")
        
    tipo_consumo = relationship(
        "TipoConsumo", 
        back_populates="consumo",
    )

    usuario = relationship(
        "Usuario",
        back_populates="consumo"
    )

    def __init__(self, valor: float, dt_perioto : datetime
                 ,TIPO_CONSUMO_id: int,USUARIO_id: int) -> None: 
        
        self._valor = valor
        self._data_registro = dt_perioto
        self._USUARIO_id = USUARIO_id
        self._TIPO_CONSUMO_id = TIPO_CONSUMO_id

    @property 
    def id(self) -> int: return self._id # type: ignore

    @property
    def tipoConsumoId(self) -> int: return self._TIPO_CONSUMO_id  # type: ignore

    @property
    def UsuarioID(self) -> int: return self._USUARIO_id # type: ignore 

    @property
    def valor(self) ->float: return self._valor # type: ignore
 
    @valor.setter
    def valor(self, new_valor: float) -> None: 
        self._valor = new_valor

    @property
    def dt_perioto(self) -> datetime: return self._data_registro # type: ignore

    @dt_perioto.setter
    def dt_perioto(self, new_dt: datetime) -> None: 
        self._data_registro = new_dt

