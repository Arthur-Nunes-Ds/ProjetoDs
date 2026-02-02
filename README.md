<h1 align="center">Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE</h1>

# Descrição
O AEchoDE (Api de Aplicativo de Monitoramento de Consumo Sustentável da EchoDE) é uma API desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar o consumo sustentável de recursos, permitindo a integração com aplicativo EchoDE.

# Instalação
Para instalar o AEchoDE, siga os passos abaixo:
1. Clone o repositório:
   ```bash
   git clone -b nunes https://github.com/NunesDevelloper/ProjetoDs.git AEchoDE
   ```
2. Navegue até o diretório do projeto:
   ```bash  
    cd AEchoDE
    ```
3. Crie um ambiente virtual (opcional, mas recomendado):
   - No Linux/MacOS use:
   ```bash
    python3 -m venv .venv
    source .venv/bin/activate
   ```
   - No Windows use:
   ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

4. Instale as dependências:
   ```bash
    pip install -r requirements.txt
   ```

# Configuração
## Configuração de Variáveis de Ambiente
Antes de iniciar o AEchoDE, é necessário configurar as variáveis de ambiente. Você pode usar o arquivo `.env.example` como modelo. Copie este arquivo para `.env` e ajuste os valores conforme necessário.
## Configuração do Banco de Dados
O AEchoDE suporta banco de dados MySQL,MariDB e Percone Server; além do SQLite(Onde não pode ser configurando). Certifique-se de que o banco de dados esteja configurado corretamente e que as credenciais estejam definidas nas variáveis de ambiente, Caso esteja utilizando o SQLite(não remendado em modo de produção), não é necessário configurar o banco de dados.
O banco deve der um timer de em 5 minutos deletar tokens expirados e a cada 24 horas deletar os user sem confirmação de email; O banco de esatá rodando em utc+0.
## Configuração de e-mail
Anteção: o AEchoDE suporta apenas o envio de e-mails, não o recebimento e apenas da google( Gmail e Google Workspace ) ná hora do envio certifiquese que o email usando seja do gmail.com.
Se você usar o serviço de Encaminhamento de emails como da cloudflare(https://developers.cloudflare.com/email-routing/?preferred-color-scheme=dark) ou semelhandes , certifique-se de preencher a varivel de ambiente `EMAIL_REDE` com email com o dns cunston proficional/pessoal.

# Para iniciar o AEchoDE e nesario que todas variaveis de ambiente estejam configuradas com base no arquivo .env.example, utilize o comando abaixo para iniciar a API:
```bash
   python StartApi.py 
```

# Argumentos de inicialização disponíveis:
- `--debug`: Executa em modo debug com reload automático. <br>Ex.: `python StartApi.py --debug`
- `--sqlite`: Cria/usa o arquivo `banco.db` (SQLite) em vez do banco padrão. <br>Ex.: `python StartApi.py --sqlite`
- `--https`: Habilita HTTPS usando `src/certs/cert.pem` e `src/certs/key.pem` se existirem. 
O certificado tem que der o nome de `cert.pem` e a chave `key.pem`. <br>Ex.: `python StartApi.py --https`
- `--host <endereco_ip>`: IP onde o servidor escuta (padrão: `localhost`). <br>Ex.: `python StartApi.py --host 0.0.0.0`
- `--port <numero_porta>`: Porta onde o servidor escuta (padrão: `8080`). <br>Ex.: `python StartApi.py --port 8080`
- `--host-fronte <enderecos...>`: Lista de IPs/URLs permitidos para o frontend (padrão: `*`[qualquer um]). <br>Ex.: `python StartApi.py --host-fronte http://localhost:3000 http://192.168.1.100:3000`

# Documentação da API
A documentação da API está disponível em: `http://<host>:<port>/docs` ou `https://<host>:<port>/docs` se HTTPS estiver habilitado.

Substitua `<host>` e `<port>` pelos valores usados na inicialização do AEchoDE.

