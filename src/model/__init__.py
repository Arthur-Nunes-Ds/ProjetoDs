from src.conection import Base, engine
from .email_Schemas import BaseEmailSend,BaseEmailToken
from .tokens import Token
from .consumo import Consumo
from .meta import Meta,BaseMetaCadastro
from .dicas_su import Dica_Su
from .usuarios import (Usuario,BaseCriarUsuario,BaseEditarUsuario,
BaseLogarUsuario, BaseEsqueciSenha)
from .erros import (NotUser, SenhaInvalida, InvalidTokenEmail,TetaivasDeEmailFaill, 
                    IncompletePostRequest,DataInvalida,InvalidePost, InvalideGet)

__all__ = ['BaseEmailSend',"Usuario","Token", "BaseCriarUsuario", 
           "BaseEditarUsuario", "NotUser", "BaseLogarUsuario", "SenhaInvalida",
           "InvalidTokenEmail","BaseEmailToken", "TetaivasDeEmailFaill", "IncompletePostRequest",
           "Consumo", "Meta", "Dica_Su", "BaseEsqueciSenha", "BaseMetaCadastro",
           "DataInvalida", "InvalidePost", "InvalideGet"]

#criar todas as tabelas
Base.metadata.create_all(bind=engine)