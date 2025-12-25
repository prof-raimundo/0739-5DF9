-- SEGECS Database Schema
-- Sistema Escolar de Gestão do Estágio Curricular Supervisionado

-- Create database (execute this separately if needed)
-- CREATE DATABASE segecs_db;

-- Connect to database
-- \c segecs_db;

-- =====================================================
-- 1. Módulo de Segurança (Controle de Acesso)
-- =====================================================

-- Tabela de Níveis de Acesso
CREATE TABLE sys_niveis_acesso (
    id_nivel SERIAL PRIMARY KEY,
    nome_nivel VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE sys_usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_nivel INT NOT NULL,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nivel) REFERENCES sys_niveis_acesso(id_nivel)
);

-- =====================================================
-- 2. Módulo de Cadastros Gerais
-- =====================================================

-- Tabela de Cidades
CREATE TABLE cad_cidades (
    id_cidade SERIAL PRIMARY KEY,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cursos
CREATE TABLE cad_cursos (
    id_curso INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    nome_curso CHARACTER VARYING(100) COLLATE pg_catalog."default" NOT NULL,
    eixo_curso CHARACTER VARYING(100) COLLATE pg_catalog."default" NOT NULL,
    observacoes TEXT COLLATE pg_catalog."default",
    dt_cadastro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_cursos_pkey PRIMARY KEY (id_curso)
);

-- Tabela de Escolas
CREATE TABLE cad_escolas (
    id_escola SERIAL PRIMARY KEY,
    id_cidade INT NOT NULL,
    inep VARCHAR(10) NOT NULL,
    nome_escola VARCHAR(100) NOT NULL,
    endereco_escola VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos
CREATE TABLE cad_alunos (
    id_aluno SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    nasc DATE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    id_cidade INT NOT NULL,
    bairro VARCHAR(100),
    zona VARCHAR(20),
    id_curso INT,
    turma VARCHAR(100),
    observacoes TEXT,
    inform_egressa TEXT,
    facebook VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade),
    FOREIGN KEY (id_curso) REFERENCES cad_cursos(id_curso)
);

-- Tabela de Responsáveis
CREATE TABLE cad_responsaveis (
    id_responsavel SERIAL PRIMARY KEY,
    id_aluno INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    parentesco VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14),
    telefone VARCHAR(20) NOT NULL,
    id_cidade INT,
    bairro VARCHAR(100),
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_aluno) REFERENCES cad_alunos(id_aluno) ON DELETE CASCADE,
    FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade)
);

-- Tabela de Concedentes (Empresas)
CREATE TABLE cad_concedentes (
    id_concedente SERIAL PRIMARY KEY,
    id_sice INT,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    nome_fantasia VARCHAR(100) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    id_cidade INT NOT NULL,
    nome_titular VARCHAR(100),
    telefone_com VARCHAR(20),
    telefone_tit VARCHAR(20),
    email_tit VARCHAR(100),
    supervisor VARCHAR(100),
    telefone_sup VARCHAR(20),
    email_sup VARCHAR(100),
    horario_fun VARCHAR(100),
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade)
);

-- Tabela de Estágios
CREATE TABLE cad_estagios (
    id_estagio SERIAL PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_concedente INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim_previsto DATE NOT NULL,
    data_rescisao DATE,
    carga_horaria_semanal INT,
    valor_bolsa DECIMAL(10,2),
    valor_transporte DECIMAL(10,2),
    tipo_estagio VARCHAR(20) NOT NULL,
    apolice_seguro VARCHAR(50),
    seguradora VARCHAR(100),
    situacao VARCHAR(20) DEFAULT 'Ativo',
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_aluno) REFERENCES cad_alunos(id_aluno),
    FOREIGN KEY (id_concedente) REFERENCES cad_concedentes(id_concedente)
);

CREATE INDEX idx_situacao ON cad_estagios(situacao);

-- =====================================================
-- 3. Inserção de Dados Iniciais (Seed)
-- =====================================================

INSERT INTO sys_niveis_acesso (nome_nivel, descricao) VALUES 
('Administrador', 'Acesso total ao sistema'),
('Secretaria', 'Gestão de alunos e concedentes'),
('Leitura', 'Apenas visualização de relatórios');

-- Senha padrão (admin123)
INSERT INTO sys_usuarios (id_nivel, nome_completo, email, senha_hash) VALUES
(1, 'Administrador do Sistema', 'admin@estagio.com', '$2y$10$ExemploDeHashDeSenhaSegura...');

-- =====================================================
-- 4. Funções e Triggers (Integridade)
-- =====================================================

-- Função para validar datas e status do estágio
CREATE OR REPLACE FUNCTION fn_valida_status_estagio()
RETURNS TRIGGER AS $$
BEGIN
    -- Se tentar inserir 'Ativo' com data passada, muda para Concluído
    IF NEW.situacao = 'Ativo' AND NEW.data_fim_previsto < CURRENT_DATE THEN
        NEW.situacao := 'Concluído';
    END IF;

    -- Validação de datas
    IF NEW.data_inicio > NEW.data_fim_previsto THEN
        RAISE EXCEPTION 'Erro: A data de início não pode ser posterior à data de término.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gatilho
CREATE TRIGGER trg_valida_status_estagio
BEFORE INSERT ON cad_estagios
FOR EACH ROW
EXECUTE FUNCTION fn_valida_status_estagio();

-- =====================================================
-- 5. Views (Relatórios Prontos)
-- =====================================================

CREATE OR REPLACE VIEW vw_detalhes_estagio AS
SELECT 
    e.id_estagio,
    e.situacao,
    e.tipo_estagio,
    e.data_inicio,
    e.data_fim_previsto,
    a.id_aluno,
    a.nome AS aluno_nome,
    a.matricula,
    a.cpf AS aluno_cpf,
    a.telefone AS aluno_telefone,
    a.email AS aluno_email,
    c.id_concedente,
    c.nome_fantasia AS empresa_nome,
    c.cnpj AS empresa_cnpj,
    c.supervisor AS nome_supervisor,
    c.email_sup AS email_supervisor,
    c.telefone_sup AS telefone_supervisor,
    cid.cidade AS cidade_estagio,
    cid.uf AS uf_estagio
FROM 
    cad_estagios e
INNER JOIN 
    cad_alunos a ON e.id_aluno = a.id_aluno
INNER JOIN 
    cad_concedentes c ON e.id_concedente = c.id_concedente
INNER JOIN 
    cad_cidades cid ON c.id_cidade = cid.id_cidade;
