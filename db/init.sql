-- usuarios --
CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha VARCHAR(200) NOT NULL,
    qnt_tentativas INT DEFAULT 0,
    -- TINYINT(1) -> verdadeiro e falso, sendo 0 false --
    email_verificado TINYINT(1) DEFAULT 0,
    criado_em DATETIME
);

-- meta--
CREATE TABLE META (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_consumo VARCHAR(255) NOT NULL,
    valor_meta INT NOT NULL,
    periodo DATETIME NOT NULL,
    USUARIO_id INT NOT NULL,
    -- fala onde é a fk--
    CONSTRAINT fk_meta_usuario
        FOREIGN KEY (USUARIO_id)
        REFERENCES USUARIO(id)
        -- caso o atriputo pai seja deletado ele sera deletado em tadas as outras tabelas(aqui tmb)--
        ON DELETE CASCADE
);

-- token--
CREATE TABLE TOKEN (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    data_expire DATETIME,
    criado_em DATETIME NOT NULL,
    USUARIO_id INT NOT NULL,

    CONSTRAINT fk_token_usuario
        FOREIGN KEY (USUARIO_id)
        REFERENCES USUARIO(id)
        ON DELETE CASCADE
);

-- dica_sustentavel--
CREATE TABLE DICA_SUSTENTAVEL (
    id_dicas INT AUTO_INCREMENT PRIMARY KEY,
    tipo_consumo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL
);

-- consumo--
CREATE TABLE CONSUMO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_consumo VARCHAR(255) NOT NULL,
    valor INT NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    USUARIO_id INT NOT NULL,
    DICA_SUSTENTAVEL_id_dicas INT,

    CONSTRAINT fk_consumo_usuario
        FOREIGN KEY (USUARIO_id)
        REFERENCES USUARIO(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_consumo_dica
        FOREIGN KEY (DICA_SUSTENTAVEL_id_dicas)
        REFERENCES DICA_SUSTENTAVEL(id_dicas)
        ON DELETE CASCADE
);


-- Ativa eventos dentro do banco--
SET GLOBAL event_scheduler = ON;

-- Muda o delimitador padrão (;) para $$--
DELIMITER $$
-- Cria um evento agendado no MySQL--
CREATE EVENT clear_email
-- Define quando o evento será executado, nesse caso a cada 24 horas--
ON SCHEDULE EVERY 24 HOUR
-- Início do bloco de comando--
DO
BEGIN
    /*Força o timezone da execução do EVENT para UTC+0,
    independente do timezone do servidor ou da sessão */
    /*Não posso usar o delimitador padrão, senão o MySQL quebra o banco.
    Mas não pode deixá-lo vazio, senão o servidor vai pensar que o DELETE
    é continuação do MySQL*/
    SET time_zone = '+00:00';
    -- Remove registros da tabela USUARIO--
    DELETE FROM `USUARIO`
    WHERE
        -- Deleta todos os emails que foram criados há mais de 24 horas e não foram verificados--
        email_verificado = 0
        AND criado_em < UTC_TIMESTAMP() - INTERVAL 24 HOUR;
END$$

CREATE EVENT clear_token
-- Define quando o evento será executado, nesse caso a cada 5 minutos--
ON SCHEDULE EVERY 5 MINUTE
-- Início do bloco de \comando--
DO
BEGIN
/*Força o timezone da execução do EVENT para UTC+0,
    independente do timezone do servidor ou da sessão */
    SET time_zone = '+00:00';
    -- Remove registros da tabela TOKEN--
    DELETE FROM `TOKEN`
    WHERE
        -- Deleta todos os tokens que já estão expirados--
        expires_at < UTC_TIMESTAMP()
        -- Ou deleta todos que foram criados há mais de 5 minutos--
        OR criado_em < UTC_TIMESTAMP() - INTERVAL 5 MINUTE;
END$$

-- Volta o delimitador de bloco para: ;
DELIMITER ;

-- Força a execução dos eventos--
ALTER EVENT clear_email ENABLE;
ALTER EVENT clear_token ENABLE;
