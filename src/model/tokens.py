from src.conection import Base, engine
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from passlib.hash import sha256_crypt as sha256
from datetime import datetime, timezone, timedelta
from src.config import EXPIRATION_TIMER_MINUTES

class Token(Base):
     #nome da tabela
    __tablename__ = "TOKEN"

    id = Column(Integer, primary_key=True)
    token = Column(String(255), nullable=False, unique=True)
    data_expire = Column(DateTime, nullable=False)
    #Fk para o código de ralacionamento
    """ondelete fala caso o pai(usuario) seja deletado o que ele deve fazer 
        CASCADE => deleta o atributo filho(token) tambe"""
    id_user = Column(Integer, ForeignKey('USUARIO.id', ondelete="CASCADE"), nullable=False)

    #aponta para o sqlalchemy que o Token e o Usuario estão elacionando faciliando as query
    usuario = relationship(
        "Usuario",
        back_populates="tokens"
    )

    def __init__(self, token: str, usario_id :int):
        self.token = token
        self.id_user = usario_id
        #já add tempo para o token ser deletado
            #o token tem quer ser cadastrtado no fuso utc pois assim tá apra altera no banco para o mesmo fusso utc
        self.data_expire = (datetime.now(timezone.utc)+timedelta(minutes=EXPIRATION_TIMER_MINUTES))

    def verificar_token(self, token: str):
        if token == self.token: return True
        else: return False
    
Base.metadata.create_all(bind=engine)