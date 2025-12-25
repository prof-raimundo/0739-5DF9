-- =====================================================
-- Script de Criação do Banco de Dados SEGECS
-- Database: segecs_db
-- =====================================================

-- Criar banco de dados
CREATE DATABASE segecs_db 
WITH TEMPLATE = template0 
ENCODING = 'UTF8' 
LOCALE_PROVIDER = libc 
LOCALE = 'Portuguese_Brazil.1252';

-- =====================================================
-- FUNÇÕES
-- =====================================================

-- Função para validar status do estágio
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

-- =====================================================
-- TABELAS
-- =====================================================

-- Tabela: cad_cidades
CREATE TABLE cad_cidades (
    id_cidade INTEGER PRIMARY KEY,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE cad_cidades_id_cidade_seq AS INTEGER;
ALTER TABLE cad_cidades ALTER COLUMN id_cidade SET DEFAULT nextval('cad_cidades_id_cidade_seq');
ALTER SEQUENCE cad_cidades_id_cidade_seq OWNED BY cad_cidades.id_cidade;

-- Tabela: cad_alunos
CREATE TABLE cad_alunos (
    id_aluno INTEGER PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    nasc DATE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    id_cidade INTEGER NOT NULL,
    bairro VARCHAR(100),
    zona VARCHAR(20),
    curso VARCHAR(100),
    turma VARCHAR(100),
    observacoes TEXT,
    inform_egressa TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_alunos_id_cidade_fkey 
        FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade)
);

CREATE SEQUENCE cad_alunos_id_aluno_seq AS INTEGER;
ALTER TABLE cad_alunos ALTER COLUMN id_aluno SET DEFAULT nextval('cad_alunos_id_aluno_seq');
ALTER SEQUENCE cad_alunos_id_aluno_seq OWNED BY cad_alunos.id_aluno;

-- Tabela: cad_concedentes
CREATE TABLE cad_concedentes (
    id_concedente INTEGER PRIMARY KEY,
    id_sice INTEGER,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    nome_fantasia VARCHAR(100) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    id_cidade INTEGER NOT NULL,
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
    CONSTRAINT cad_concedentes_id_cidade_fkey 
        FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade)
);

CREATE SEQUENCE cad_concedentes_id_concedente_seq AS INTEGER;
ALTER TABLE cad_concedentes ALTER COLUMN id_concedente SET DEFAULT nextval('cad_concedentes_id_concedente_seq');
ALTER SEQUENCE cad_concedentes_id_concedente_seq OWNED BY cad_concedentes.id_concedente;

-- Tabela: cad_escolas
CREATE TABLE cad_escolas (
    id_escola INTEGER PRIMARY KEY,
    id_cidade INTEGER NOT NULL,
    inep VARCHAR(10) NOT NULL,
    nome_escola VARCHAR(100) NOT NULL,
    endereco_escola VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE cad_escolas_id_escola_seq AS INTEGER;
ALTER TABLE cad_escolas ALTER COLUMN id_escola SET DEFAULT nextval('cad_escolas_id_escola_seq');
ALTER SEQUENCE cad_escolas_id_escola_seq OWNED BY cad_escolas.id_escola;

-- Tabela: cad_estagios
CREATE TABLE cad_estagios (
    id_estagio INTEGER PRIMARY KEY,
    id_aluno INTEGER NOT NULL,
    id_concedente INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim_previsto DATE NOT NULL,
    data_rescisao DATE,
    carga_horaria_semanal INTEGER,
    valor_bolsa NUMERIC(10,2),
    valor_transporte NUMERIC(10,2),
    tipo_estagio VARCHAR(20) NOT NULL,
    apolice_seguro VARCHAR(50),
    seguradora VARCHAR(100),
    situacao VARCHAR(20) DEFAULT 'Ativo',
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_estagios_id_aluno_fkey 
        FOREIGN KEY (id_aluno) REFERENCES cad_alunos(id_aluno),
    CONSTRAINT cad_estagios_id_concedente_fkey 
        FOREIGN KEY (id_concedente) REFERENCES cad_concedentes(id_concedente)
);

CREATE SEQUENCE cad_estagios_id_estagio_seq AS INTEGER;
ALTER TABLE cad_estagios ALTER COLUMN id_estagio SET DEFAULT nextval('cad_estagios_id_estagio_seq');
ALTER SEQUENCE cad_estagios_id_estagio_seq OWNED BY cad_estagios.id_estagio;

-- Índice para otimizar consultas por situação
CREATE INDEX idx_situacao ON cad_estagios(situacao);

-- Tabela: cad_responsaveis
CREATE TABLE cad_responsaveis (
    id_responsavel INTEGER PRIMARY KEY,
    id_aluno INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    parentesco VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14),
    telefone VARCHAR(20) NOT NULL,
    id_cidade INTEGER,
    bairro VARCHAR(100),
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_responsaveis_id_aluno_fkey 
        FOREIGN KEY (id_aluno) REFERENCES cad_alunos(id_aluno) ON DELETE CASCADE,
    CONSTRAINT cad_responsaveis_id_cidade_fkey 
        FOREIGN KEY (id_cidade) REFERENCES cad_cidades(id_cidade)
);

CREATE SEQUENCE cad_responsaveis_id_responsavel_seq AS INTEGER;
ALTER TABLE cad_responsaveis ALTER COLUMN id_responsavel SET DEFAULT nextval('cad_responsaveis_id_responsavel_seq');
ALTER SEQUENCE cad_responsaveis_id_responsavel_seq OWNED BY cad_responsaveis.id_responsavel;

-- Tabela: sys_niveis_acesso
CREATE TABLE sys_niveis_acesso (
    id_nivel INTEGER PRIMARY KEY,
    nivel VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE sys_niveis_acesso_id_nivel_seq AS INTEGER;
ALTER TABLE sys_niveis_acesso ALTER COLUMN id_nivel SET DEFAULT nextval('sys_niveis_acesso_id_nivel_seq');
ALTER SEQUENCE sys_niveis_acesso_id_nivel_seq OWNED BY sys_niveis_acesso.id_nivel;

-- Tabela: sys_usuarios
CREATE TABLE sys_usuarios (
    id_usuario INTEGER PRIMARY KEY,
    id_nivel INTEGER NOT NULL,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sys_usuarios_id_nivel_fkey 
        FOREIGN KEY (id_nivel) REFERENCES sys_niveis_acesso(id_nivel)
);

CREATE SEQUENCE sys_usuarios_id_usuario_seq AS INTEGER;
ALTER TABLE sys_usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('sys_usuarios_id_usuario_seq');
ALTER SEQUENCE sys_usuarios_id_usuario_seq OWNED BY sys_usuarios.id_usuario;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: vw_detalhes_estagio
CREATE VIEW vw_detalhes_estagio AS
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
FROM cad_estagios e
JOIN cad_alunos a ON e.id_aluno = a.id_aluno
JOIN cad_concedentes c ON e.id_concedente = c.id_concedente
JOIN cad_cidades cid ON c.id_cidade = cid.id_cidade;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Validar status do estágio antes de inserir
CREATE TRIGGER trg_valida_status_estagio 
BEFORE INSERT ON cad_estagios 
FOR EACH ROW 
EXECUTE FUNCTION fn_valida_status_estagio();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================