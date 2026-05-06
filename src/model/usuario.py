from ..db import Base
from sqlalchemy import Column, Integer, String,Boolean, DateTime
from sqlalchemy.orm import relationship
from passlib.hash import sha256_crypt as sha256
from datetime import datetime, timezone

class Usuario(Base):
    #nome da tabela
    __tablename__ = "USUARIO"

    _id = Column(Integer, primary_key=True, name="id")
    _nome = Column(String(200), nullable=False, name="nome")
    _email = Column(String(200), unique=True, nullable=False, name="email")
    #name => nomeia o nome da tabela dentro da db   
    _hash_senha = Column(String(255), nullable=False, name="senha")
    _email_verificado = Column(Boolean, default=False, name="email_verificado")
    _criado_em = Column(DateTime, default=datetime.now(timezone.utc),name="criado_em")
    #_google_id = Column(String, unique=True)

    consumo = relationship(
        "Consumo", 
        back_populates="usuario",
        #cascade ="all, delete" => Se o user sumir todos os tokens dele somem automaticamente(isso quem vai fazer é o banco)
        cascade="all, delete",
        #fala para o banco cuidar de deletar os token caso o user suma
        passive_deletes=True
    )

    meta = relationship(
        "Meta", 
        back_populates="usuario",
        cascade="all, delete",
        passive_deletes=True
    )

    iot = relationship(
        "Iot", 
        back_populates="usuario",
        cascade="all, delete",
        passive_deletes=True
    )

    def __init__(self, nome: str, email: str, senha: str, email_verificado : bool = False) -> None:
        self._nome = nome
        self._email = email
        self._hash_senha = sha256.encrypt(senha)

        self._email_verificado = email_verificado
        self._criado_em = datetime.now(timezone.utc)

    #NOTE - propriedades que não podem ser edida
    @property
    def id(self) -> int: return self._id  # type: ignore
    
    @property
    def email(self) -> str: return self._email # type: ignore

    @property
    def criado_em(self) -> DateTime: return self._criado_em # type: ignore

    #NOTE - propriedades que podem ser edida
    @property
    def nome(self) -> str: return self._nome # type: ignore
    
    @nome.setter
    def nome(self, NovoNome: str) -> None: self._nome = NovoNome
    
    @property
    def email_verificado(self) -> bool: return bool(self._email_verificado)
    
    @email_verificado.setter
    def email_verificado(self, status : bool = True) -> None: 
        self._email_verificado = status

    ''' 
    @property
    def google_id(self) -> str: return self.google_id

    @google_id.setter
    def google_id(self, _str: str) -> None: self.google_id = _str 
    '''
    
    #NOTE - Como não há utilidade de usar o hash da senha fora da class
    def novaSenha(self, senha) -> None: 
        self._hash_senha= sha256.encrypt(senha)

    def verificarSenha(self, senha) -> bool: 
        return sha256.verify(senha, self._hash_senha)  # type: ignore
    
    def idAdmin(self) -> None: self._id = -1
    


