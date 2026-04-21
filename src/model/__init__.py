from ..db import Base, engine
from .usuario import Usuario
from .tipo_consumo import TipoConsumo
from .dica_sustentavel import DicaSustentavel
from .meta import Meta
from .consumo import Consumo

__all__ = ["Usuario", "TipoConsumo", "DicaSustentavel",
           "Meta", "Consumo"]

#criar todas as tabelas
Base.metadata.create_all(bind=engine)