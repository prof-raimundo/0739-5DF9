const { query } = require('../config/db');

// Listar Níveis
const getNiveis = async (req, res) => {
  try {
    const result = await query('SELECT * FROM sys_niveis_acesso ORDER BY id_nivel ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar níveis" });
  }
};

// Criar Nível (Agora salvando descrição)
const createNivel = async (req, res) => {
  const { nivel, descricao } = req.body;
  try {
    const sql = 'INSERT INTO sys_niveis_acesso (nivel, descricao) VALUES ($1, $2) RETURNING *';
    const result = await query(sql, [nivel, descricao]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Erro de duplicidade (código 23505 no Postgres)
    if (err.code === '23505') {
        return res.status(400).json({ error: "Este nível já existe." });
    }
    res.status(500).json({ error: "Erro ao criar nível" });
  }
};

// Atualizar Nível (NOVO!)
const updateNivel = async (req, res) => {
  const { id } = req.params;
  const { nivel, descricao } = req.body;
  
  try {
    // Atualiza nome, descrição e a data de atualização
    const sql = `
        UPDATE sys_niveis_acesso 
        SET nivel = $1, descricao = $2, dt_atualizacao = CURRENT_TIMESTAMP 
        WHERE id_nivel = $3
    `;
    await query(sql, [nivel, descricao, id]);
    res.json({ message: "Nível atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
        return res.status(400).json({ error: "Já existe outro nível com este nome." });
    }
    res.status(500).json({ error: "Erro ao atualizar nível" });
  }
};

// Deletar Nível
const deleteNivel = async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se tem usuário usando este nível antes de apagar
    const checkUsers = await query('SELECT count(*) FROM sys_usuarios WHERE id_nivel = $1', [id]);
    if (checkUsers.rows[0].count > 0) {
      return res.status(400).json({ error: "Proibido excluir: Existem usuários vinculados a este nível." });
    }

    await query('DELETE FROM sys_niveis_acesso WHERE id_nivel = $1', [id]);
    res.json({ message: "Nível removido" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar nível" });
  }
};

module.exports = { getNiveis, createNivel, updateNivel, deleteNivel };
