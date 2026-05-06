from ..db import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

class Iot(Base):
    __tablename__ = "IOT"

    _id = Column(Integer, primary_key=True,name="id")
    _id_iot = Column(Integer, nullable=False)
    _USUARIO_id = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), 
                        nullable=False, name="USUARIO_id")

    usuario = relationship(
        "Usuario",
        back_populates="iot"
    )

    def __init__(self, id_iot: int, id_user: int):
        self._id_iot = id_iot
        self._USUARIO_id = id_user

    @property
    def id(self) -> int: return int(self._id) # type: ignore

    @property
    def usario_id(self) -> int: return int(self._USUARIO_id) # type: ignore 

    @usario_id.setter
    def usario_id(self, id_user: int) -> None: self._USUARIO_id = id_user

    @property
    def id_iot(self) -> int: return int(self._id_iot) # type: ignore

    @id_iot.setter
    def id_iot(self, id_iot: int) -> None: self._id_iot = id_iot




