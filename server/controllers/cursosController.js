const { query } = require('../config/db');

// Listar Cursos
const getCursos = async (req, res) => {
  try {
    const todos = await query("SELECT * FROM cad_cursos ORDER BY nome_curso ASC");
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor ao buscar cursos");
  }
};

// Criar Curso
const createCurso = async (req, res) => {
  try {
    // IMPORTANTE: Adicionado 'modalidade' para bater com o Schema
    const { nome_curso, eixo_curso, modalidade, observacoes } = req.body;

    const novo = await query(
      `INSERT INTO cad_cursos (nome_curso, eixo_curso, modalidade, observacoes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome_curso, eixo_curso, modalidade, observacoes]
    );
    res.json(novo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao cadastrar curso.");
  }
};

// Deletar Curso
const deleteCurso = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM cad_cursos WHERE id_curso = $1", [id]);
    res.json({ message: "Curso excluído!" });
  } catch (err) {
    console.error(err.message);
    // Tratamento específico para erro de Chave Estrangeira (Postgres code 23503)
    if (err.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir: Existem alunos matriculados neste curso." });
    }
    res.status(500).send("Erro ao deletar curso");
  }
};

// Atualizar Curso
const updateCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_curso, eixo_curso, modalidade, observacoes } = req.body;

    const updateOp = await query(
      `UPDATE cad_cursos
       SET nome_curso = $1, eixo_curso = $2, modalidade = $3, observacoes = $4, dt_atualizacao = CURRENT_TIMESTAMP
       WHERE id_curso = $5`,
      [nome_curso, eixo_curso, modalidade, observacoes, id]
    );

    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.json({ message: "Curso atualizado com sucesso!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao atualizar curso." });
  }
};

module.exports = { getCursos, createCurso, deleteCurso, updateCurso };