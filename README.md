<h1 align="center">AAMCS</h1>

# Descrição
O AAMCS (Api de Aplicativo de Monitoramento de Consumo Sustentável) é uma API desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar o consumo sustentável de recursos, permitindo a integração com aplicativos frontend.

# Instalação
Para instalar o AAMCS, siga os passos abaixo:
1. Clone o repositório:
   ```bash
   git clone -b nunes https://github.com/NunesDevelloper/ProjetoDs.git AAMCS
   ```
2. Navegue até o diretório do projeto:
   ```bash  
    cd AAMCS
    ```
3. Crie um ambiente virtual (opcional, mas recomendado):
   ```bash
    python -m venv .venv
    source .venv/bin/activate
    ```
    No Windows use:
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

4. Instale as dependências:
   ```bash
    pip install -r requirements.txt
   ```

# Para iniciar o AAMCS e nesario que todas variaveis de ambiente estejam configuradas com base no arquivo .env.example, utilize o comando abaixo:
Atenção: deve escutar o comando:  ```python StartApi.py``` dentro do diretório raiz do projeto.

# Argumentos de inicialização disponíveis:
- `--debug`: Executa em modo debug com reload automático. <br>Ex.: `python StartApi.py --debug`
- `--sqlite`: Cria/usa o arquivo `banco.db` (SQLite) em vez do banco padrão. <br>Ex.: `python StartApi.py --sqlite`
- `--https`: Habilita HTTPS usando `src/certs/cert.pem` e `src/certs/key.pem` se existirem. 
O certificado tem que der o nome de `cert.pem` e a chave `key.pem`. <br>Ex.: `python StartApi.py --https`
- `--host <endereco_ip>`: IP onde o servidor escuta (padrão: `localhost`). <br>Ex.: `python StartApi.py --host 0.0.0.0`
- `--port <numero_porta>`: Porta onde o servidor escuta (padrão: `8000`). <br>Ex.: `python StartApi.py --port 8080`
- `--host-fronte <enderecos...>`: Lista de IPs/URLs permitidos para o frontend (padrão: `*`[qualquer um]). <br>Ex.: `python StartApi.py --host-fronte http://localhost:3000 http://192.168.1.100:3000`

# Documentação da API
A documentação da API está disponível em: `http://<host>:<port>/docs` ou `https://<host>:<port>/docs` se HTTPS estiver habilitado.

Substitua `<host>` e `<port>` pelos valores usados na inicialização do AAMCS.

