const { query } = require('../config/db'); // Usamos o 'query' que já configuramos

// Listar (Mantemos o simples, mas lembre de garantir que o SELECT traga tudo)
const getAlunos = async (req, res) => {
  try {
    const todos = await query("SELECT * FROM cad_alunos ORDER BY id_aluno ASC");
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

// Criar (Atualizado para seus novos campos)
const createAluno = async (req, res) => {
  try {
    const { matricula, nome, cpf, nasc, email, curso, telefone, id_cidade } = req.body;
    
    const novo = await query(
      `INSERT INTO cad_alunos (matricula, nome, cpf, nasc, email, curso, telefone, id_cidade) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [matricula, nome, cpf, nasc, email, curso, telefone, id_cidade || 1]
    );
    res.json(novo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao cadastrar");
  }
};

// Deletar
const deleteAluno = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM cad_alunos WHERE id_aluno = $1", [id]);
    res.json({ message: "Aluno excluído!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao deletar");
  }
};

// --- SUA FUNÇÃO DE UPDATE (Adaptada para usar 'query') ---
const updateAluno = async (req, res) => {
  try {
    const { id } = req.params; // ID vem da URL
    const { matricula, nome, cpf, nasc, email, curso, telefone, id_cidade } = req.body; 

    const updateOp = await query(
      `UPDATE cad_alunos 
       SET matricula = $1, nome = $2, cpf = $3, nasc = $4, email = $5, curso = $6, telefone = $7, id_cidade = $8
       WHERE id_aluno = $9`,
      [matricula, nome, cpf, nasc, email, curso, telefone, id_cidade || 1, id]
    );

    // No 'pg' (node-postgres), updateOp.rowCount diz quantas linhas foram afetadas
    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    res.json({ message: "Aluno atualizado com sucesso!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao atualizar aluno." });
  }
};

module.exports = { getAlunos, createAluno, deleteAluno, updateAluno };
