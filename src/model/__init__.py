from src.conection import Base, engine
from .email_Schemas import BaseEmailSend,BaseEmailToken
from .tokens import Token
from .consumo import Consumo
from .meta import Meta
from .dicas_su import Dica_Su
from .usuarios import (Usuario,BaseCriarUsuario,BaseEditarUsuario,
BaseLogarUsuario, BaseEsqueciSenha)
from .erros import (NotUser, SenhaInvalida, InvalidTokenEmail,TetaivasDeEmailFaill, 
                    IncompletePostRequest)

__all__ = ['BaseEmailSend',"Usuario","Token", "BaseCriarUsuario", 
           "BaseEditarUsuario", "NotUser", "BaseLogarUsuario", "SenhaInvalida",
           "InvalidTokenEmail","BaseEmailToken", "TetaivasDeEmailFaill", "IncompletePostRequest",
           "Consumo", "Meta", "Dica_Su", "BaseEsqueciSenha"]

#criar todas as tabelas
Base.metadata.create_all(bind=engine)