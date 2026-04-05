<h1 align="center">Api do Aplicativo de Monitoramento de Consumo Sustentável da EchoDE</h1>

# Descrição

O AEchoDE (Api de Aplicativo de Monitoramento de Consumo Sustentável da EchoDE) é uma API desenvolvida em Python utilizando o framework FastAPI. Ele oferece funcionalidades para monitorar e gerenciar o consumo sustentável de recursos, permitindo a integração com aplicativo EchoDE.

# Instalação

Para instalar o AEchoDE, siga os passos abaixo:

1. Clone o repositório:
   ```bash
   git clone -b back_end https://github.com/NunesDevelloper/ProjetoDs.git AEchoDE
   ```
2. Navegue até o diretório do projeto:
   ```bash
    cd AEchoDE
   ```
3. Criar o Docker:
   ```bash
    docker compose up --build
   ```

# Configuração

## Configuração de Variáveis de Ambiente

Antes de iniciar o AEchoDE, é necessário configurar as variáveis de ambiente. Você pode usar o arquivo "[.env.exemple](.env.exemple)" como modelo.Crie um arquivo `.env` e copie este arquivo para `.env` e ajuste os valores conforme necessário.

## Configuração de e-mail

- Suporta apenas envio, usando **Gmail/Google Workspace.**
- Se usar roteamento (ex.: Cloudflare Email Routing), preencha `EMAIL_REDE` com o e-mail profissional/pessoal.

# Para iniciar o AEchoDE  utilize o comando abaixo:

```bash
   docker-compose up
```

# Documentação da API

A documentação da API(O Docker deve estár rodando) está disponível em: `http://localhost:8080/docs`
Caso não esteja com a API rodando, acesse a documentação em: [Docs EndPointPdf](https://github.com/NunesDevelloper/ProjetoDs/blob/main/docs/EndPoitn.pdf)

# Autor

- **Arthur Nunes Carvalho** - [NunesDevelloper](https://nunesdevelloper.github.io/NunesDevelloper/)
