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
Antes de iniciar o AEchoDE, é necessário configurar as variáveis de ambiente. Você pode usar o arquivo "[.env.exemple](.env.exemple)" como modelo.Crie um arquivo `.env` e copie este arquivo para `.env` e ajuste os valores conforme necessário.
## Configuração do Banco de Dados
Servidores de banco de dados Suportados:
- MySQL/MariaDB/Percona Server.
- SQLite tem suporte, **mas não recomendado para produção.**

Criação do banco automaticamente:

   - Sem banco criado:
```bash
mysql -u <SEU_USUARIO> -p < db/init.sql
```
   - Com banco criado:
```bash
mysql -u <SEU_USUARIO> -p <NOME_DO_BANCO> < db/init.sql
```
Observações importantes:
 - O banco deve:
   - Remover tokens expirados a cada 5 minutos.
   - Remover usuários sem confirmação de e-mail a cada 24 horas.
Fuso horário padrão: **UTC+0**.

## Configuração de e-mail
   - Suporta apenas envio, usando **Gmail/Google Workspace.**
   - Se usar roteamento (ex.: Cloudflare Email Routing), preencha `EMAIL_REDE` com o e-mail profissional/pessoal.

# Para iniciar o AEchoDE  utilize o comando abaixo:
```bash
   python StartApi.py 
```

# Argumentos de inicialização disponíveis:
- `--debug`: Executa em modo debug com reload automático(casso o fastapi trava ele continua execuntado normalmente). <br>Ex.: `python StartApi.py --debug`
- `--sqlite`: Cria/usa o arquivo `banco.db` (SQLite) em vez do banco padrão. <br>
Ex.: `python StartApi.py --sqlite`
- `--https`: Habilita HTTPS usando `src/certs/cert.pem` e `src/certs/key.pem` se existirem. <br>
O certificado tem que der o nome de `cert.pem` e a chave `key.pem`. <br>
Ex.: `python StartApi.py --https`
- `--host <endereco_ip>`: IP onde o servidor escuta <br> (padrão: `localhost`). <br>
Ex.: `python StartApi.py --host 0.0.0.0`
- `--port <numero_porta>`: Porta onde o servidor escuta <br> (padrão: `8080`). <br>
Ex.: `python StartApi.py --port 8080`
- `--host-fronte <enderecos...>`: Lista de IPs/URLs permitidos para o frontend <br>
(padrão: `*`[qualquer um]) <br>
Ex.: `python StartApi.py --host-fronte http://localhost:3000 http://192.168.1.100:3000` <br>
**Atenção:** essa linha mal configurada pode dar erro de CORS no frontend.

# Documentação da API
A documentação da API está disponível em: `http://<host>:<port>/docs` ou `https://<host>:<port>/docs`(se HTTPS estiver habilitado).

# Licença
Este projeto utiliza uma **Licença Personalizada de Uso Não Comercial com Exceção Comercial**.

- Uso não comercial: permitido
- Uso comercial ou público: somente com autorização do autor. <br> [LICENSE](LICENSE) para mais detalhes.
