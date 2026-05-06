#Verção da Imagem do Python
FROM python:3.13-slim

#cira a pasta app dentro do os do docker

WORKDIR /app

#var de ambiente já setados
#PYTHONDONTWRITEBYTECODE -> fala se os arquivos .pyc tem que ser recompilado toda hora
#PYTHONUNBUFFERED -> não faz amarzena as coisa na memoria antes de mostra no terminal e sim mostra direto
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

#Copia apenas os requisitos e instala (Aproveita o Cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

#Copia o resto do projeto (incluindo a pasta src) para dentro do /app
COPY . .

#porta da rede interna do docker
EXPOSE 8080

#comando de inicialização do servidor uvicorn
CMD ["uvicorn" ,"src.main:app", "--host", "0.0.0.0", "--port", "8080"]
