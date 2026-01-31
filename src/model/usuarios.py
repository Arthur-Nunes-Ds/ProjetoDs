from src.conection import Base, engine
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String,Boolean
from sqlalchemy.orm import relationship
from passlib.hash import sha256_crypt as sha256

class Usuario(Base):
    #nome da tabela
    __tablename__ = "USUARIO"

    id = Column(Integer, primary_key=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    #name => nomeia o nome da tabela dentro da db   
    hash_senha = Column(String(255), nullable=True, name="senha")
    qnt_tentativas = Column(Integer, default=0)
    email_verificado = Column(Boolean, default=False)
    
    #aponta para o sqlalchemy que o Token e o Usuario estão elacionando faciliando as query
    tokens = relationship(
        "Token",
        back_populates="usuario",
        #cascade ="all, delete" => Se o user sumir todos os tokens dele somem automaticamente(isso quem vai fazer é o banco)
        cascade="all, delete",
        #fala para o banco cuidar de deletar os token caso o user suma
        passive_deletes=True
    )

    def __init__(self, nome: str, email: str, senha: str):
        self.nome = nome
        self.email = email
        self.hash_senha = sha256.encrypt(senha)

    def nova_senha(self, senha):
        self.hash_senha= sha256.encrypt(senha)

    def verificar_senha(self, senha):
        return sha256.verify(senha, self.hash_senha) # type: ignore

Base.metadata.create_all(bind=engine)

#SECTION - Schemas User
#Parâmetros de como tem que ser enviado. Qualquer coisa contrária já será rejeitada automaticamente.
class BaseCriarUsuario(BaseModel):
    nome: str
    senha: str
    email: str

class BaseLogarUsuario(BaseModel):
    email: str
    senha: str

class BaseEditarUsuario(BaseModel):
    #Igualar a None gera um campo opcional, ou seja, se ele não for passado, o código continua
    nome: str | None = None
    senha: str | None = None
#!SECTION