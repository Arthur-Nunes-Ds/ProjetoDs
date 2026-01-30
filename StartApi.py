if __name__ == "__main__":
    from json import dump
    from pathlib import Path
    from argparse import ArgumentParser
    from src.conection import engine
    from time import sleep as delay
    import atexit

    #para deletar o json_sqlite apos ser o servidor se encerado
    def dell_json_sqlite():
        json = Path('src/temp/.sgu_config.json')
        slqlite = Path('src/temp/banco.db')
        try:
            #finaliza todas conexação com o banco
            engine.dispose()
            #espere para garantir que fechou todas conexeção do banco
            delay(0.5)

            if json.exists():
                #unlink deleta o arvivo <- isso fica mas versatios para os
                json.unlink()

            if slqlite.exists():
                slqlite.unlink()

        except Exception as e:
            print(f"Erro ao deletar: {e}")
            #se de algo errado ele para tentar refazer o processo
            dell_json_sqlite()   

        print("\nServidor encerrado. Arquivo de config/temporario removido.")

    #Registra para quando o programa fechar (qualquer motivo) ele támbe já fecha o programa
    atexit.register(dell_json_sqlite)

    #Cria uma pase para o main.py aceitar comando de incialicação como --debug, --port, etc.
    paremtro = ArgumentParser(description='Inicia o servidor SGU')
    #Passo o argumento de inicilização, se o paremetro for passado ele e lido como true, e um help para que ele server
    paremtro.add_argument('--debug', action='store_true', help='Executa em modo debug')
    paremtro.add_argument('--sqlite', action='store_true', help='Cria um sqlite "banco.db"')
    paremtro.add_argument('--https', action='store_true', help='Ativa o htpps do servido. necessario os certificados ficarem em: /cert')
    #o type -> é o tipo que precisar ser pasado e o Default é o falo padrão caso não passado
    paremtro.add_argument('--port', type=int, default= 8000, help='Porta do SGU, o padrão: 8000')
    paremtro.add_argument('--host', type=str, default= "localhost", help='IP do SGU, o padrão: localhost')
    #nargs -> me fala que eu posso varios paremtros como por exempl-> pip install pandas fastapi flet
        #assim tuddo isso vai ser baixodo pelo pip 
    paremtro.add_argument('--host-fronte', nargs='*', type=str, default=['*'] ,help='Lista de IP do fronte')

    #Analisa os argumentos
    args = paremtro.parse_args()
    
    #add um json temp só para no modo de reload ele não fica redefinindo toda hora
    with open('src/temp/.sgu_config.json', 'w') as f:
        dump({'DEBUG': args.debug, 'SQLITE': args.sqlite, 'HOST_FRONT': args.host_fronte}, f)

    _ssl_certfile = None
    _ssl_keyfile = None
    if args.https == True: 
       path_ssl_certfile =Path('src/certs/cert.pem')
       path_ssl_keyfile = Path('src/certs/key.pem')
       if path_ssl_certfile.exists() and path_ssl_keyfile.exists():
            _ssl_certfile = 'src/certs/cert.pem' 
            _ssl_keyfile = 'src/certs/key.pem' 
       else:
           print('não foi possivel achar os certificados verifica o nomes deles')

    #o unicorvn tem que se puxado antes para que de tempo das var DEBUG e SQLITE serem alterada
    import uvicorn
    
    #Só executa se --debug foi passado
    if args.debug == True:
        uvicorn.run("src.main:app", host=args.host ,port=args.port, reload=True, ssl_certfile=_ssl_certfile, ssl_keyfile=_ssl_keyfile)
    elif args.debug == False and args.sqlite == False:
        #Modo produção (sem reload)
        uvicorn.run("src.main:app", host=args.host, port=args.port, reload=False,ssl_certfile=_ssl_certfile, ssl_keyfile=_ssl_keyfile)
    else:
        print('por motivos de seguranção o código não sera executado em modo de produção')
        uvicorn.run("src.main:app", host=args.host ,port=args.port, reload=True, ssl_certfile=_ssl_certfile, ssl_keyfile=_ssl_keyfile)

