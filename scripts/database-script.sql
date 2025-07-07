-- Criação do banco de dados oficina2
CREATE DATABASE oficina2
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       LC_COLLATE = 'Portuguese_Brazil.1252'
       LC_CTYPE = 'Portuguese_Brazil.1252'
       TEMPLATE = template0;

-- Conectar ao banco oficina2
\c oficina2;

-- Criação da tabela usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Criação da tabela jogos
CREATE TABLE jogos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Criação da tabela estatisticas_jogos
CREATE TABLE estatisticas_jogos (
    id SERIAL PRIMARY KEY,
    jogo_id INT NOT NULL,
    pontos INT DEFAULT 0,
    partidas INT DEFAULT 0,
    FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE
);

-- Criação da tabela registros_jogos
CREATE TABLE registros_jogos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    jogo_id INT NOT NULL,
    data_jogo TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE
);

-- Criação da tabela eventos
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT
);

-- Índices adicionais
CREATE UNIQUE INDEX idx_usuario_email ON usuarios(email);
