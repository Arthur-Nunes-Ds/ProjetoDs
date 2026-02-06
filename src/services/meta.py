from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.conection import get_session
from src.model import(Meta, BaseMetaCadastro, DataInvalida, InvalidePost)
from .depeds import verificar_jwt
from datetime import date

Rotas_Metas = APIRouter()

#FIXME - melhora o jeito que define a meta -
#FIXME - finalizar a editar e get_meta mea_finalizada

#SECTION - definer a meta
@Rotas_Metas.post("/Cadastrar")
async def Cadastrar_meta(base: BaseMetaCadastro, id_user: int = Depends(verificar_jwt),session: Session = Depends(get_session)):
    '''perido tem que ser no formado YYYY-MM-DDTHH:MM:SSZ 
    \n o horario tem que ser em utc +0 \n
    YYYY => ANO | MM => MêS | DD => DIA | HH => HORA | MM => MINUTO \n
    SS => SEGUNDO
    [YYYY, MeM, DD, HH, MM, SS]
    '''
    try:
        if base.valor_meta <= 0: raise InvalidePost

        hj = date.today()
        #passado
        #pega só o dia mes e ano
        if base.periodo.date() < hj: raise DataInvalida
        if base.periodo.date() != hj: raise DataInvalida

        _meta = Meta(base.tipo_de_consumo, base.valor_meta, base.periodo, id_user)
        session.add(_meta)
        session.commit()
        return {"mesagem":"meta definada com sucesso"}
    except DataInvalida:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="o tempo está no pasado ou no presente o tempo tem que está no futuro"
        )
#!SECTION

@Rotas_Metas.get("/Get_Metas")
#Depends(verificar_jwt)
async def Get_Metas(tipo: str | None = None, id_user: int = Depends(verificar_jwt),session: Session = Depends(get_session)):
    '''
        \nAltera a senha do user.\
        \nParâmetros:\
        \n-token: str \
        \n-email : str\
        \n-nova_senha : str\
        \nRetorno:\
        \n-{"mensagem": "senha alterada com sucesso"}.\
        \nErros:\
        \n-406: token invalido
    '''
    query = session.query(Meta).filter_by(id_user = id_user).all()
    if tipo is not None:
        query = session.query(Meta).filter_by(id_user = id_user,tipo_consumo = tipo).all()
    
    dados = {'mensagem': []}
    #Percorre cada produto e o formata para uma lista melhor
    for i in query:
        dados['mensagem'].append({'id': i.id,
                                'tipo_consumo': i.tipo_consumo,
                                'valor_meta': i.valor_meta,
                                'periodo': i.periodo})
    return dados


@Rotas_Metas.post("/Editar")
async def Editar_Meta(id_user: int = Depends(verificar_jwt),session: Session = Depends(get_session)):
    '''
    '''


@Rotas_Metas.delete("/Dell_Meta/{id_meta}")
async def Dell_Meta(id_meta: int, id_user: int = Depends(verificar_jwt),session: Session = Depends(get_session)):
    '''

    '''
    session.query(Meta).filter_by(id = id_meta, id_user= id_user).delete()
    return {"mesagem": "meta finalizada"}


