#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
MODEL_NAME="gemma2:2b"

log() {
	printf '[install_back] %s\n' "$*"
}

run_as_root() {
	if [ "$(id -u)" -eq 0 ]; then
		"$@"
	elif command -v sudo >/dev/null 2>&1; then
		sudo "$@"
	else
		log "Erro: este script precisa de root ou sudo para instalar dependências."
		exit 1
	fi
}

ensure_command() {
	if command -v "$1" >/dev/null 2>&1; then
		return 0
	fi

	return 1
}

install_docker_on_debian_like() {
	if ! ensure_command apt-get; then
		log "Gerenciador apt-get não encontrado. Instale o Docker manualmente nesta distribuição."
		exit 1
	fi

	log "Instalando dependências básicas do Docker..."
	run_as_root apt-get update
	run_as_root apt-get install -y ca-certificates curl gnupg lsb-release

	if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
		run_as_root install -m 0755 -d /etc/apt/keyrings
		curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | run_as_root gpg --dearmor -o /etc/apt/keyrings/docker.gpg
		run_as_root chmod a+r /etc/apt/keyrings/docker.gpg
	fi

	if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
		distribution_id="$(. /etc/os-release && echo "$ID")"
		distribution_codename="$(. /etc/os-release && echo "$VERSION_CODENAME")"
		echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${distribution_id} ${distribution_codename} stable" | run_as_root tee /etc/apt/sources.list.d/docker.list >/dev/null
	fi

	run_as_root apt-get update
	run_as_root apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

start_docker_service() {
	if ensure_command systemctl; then
		run_as_root systemctl enable --now docker
	elif ensure_command service; then
		run_as_root service docker start
	fi
}

docker_compose() {
	if docker compose version >/dev/null 2>&1; then
		docker compose "$@"
	elif ensure_command docker-compose; then
		docker-compose "$@"
	else
		log "Docker Compose não encontrado."
		exit 1
	fi
}

wait_for_ollama() {
	log "Aguardando o Ollama responder..."
	for _ in $(seq 1 60); do
		if docker_compose -f "$COMPOSE_FILE" exec -T ia ollama list >/dev/null 2>&1; then
			return 0
		fi
		sleep 2
	done

	log "Ollama não ficou pronto no tempo esperado."
	exit 1
}

ensure_docker() {
	if ensure_command docker && docker info >/dev/null 2>&1; then
		return 0
	fi

	log "Docker não está pronto; iniciando instalação..."
	if ensure_command apt-get; then
		install_docker_on_debian_like
		start_docker_service
	else
		log "Esta distribuição não foi tratada automaticamente. Instale Docker e Docker Compose manualmente."
		exit 1
	fi

	if ! (ensure_command docker && docker info >/dev/null 2>&1); then
		log "Docker ainda não está acessível após a instalação. Verifique o serviço Docker."
		exit 1
	fi
}

main() {
	cd "$PROJECT_DIR"

	ensure_docker

	if [ ! -f "$COMPOSE_FILE" ]; then
		log "Arquivo docker-compose.yml não encontrado em $PROJECT_DIR."
		exit 1
	fi

	log "Subindo banco, Redis e IA pela Docker Compose..."
	docker_compose -f "$COMPOSE_FILE" up -d db redis ia

	wait_for_ollama

	log "Baixando o modelo $MODEL_NAME..."
	docker_compose -f "$COMPOSE_FILE" exec -T ia ollama pull "$MODEL_NAME"

	log "Construindo e iniciando a API..."
	docker_compose -f "$COMPOSE_FILE" up -d --build backend_python

	log "Concluído. API em execução na porta 8080 e Ollama na porta 11434."
}

main "$@"
