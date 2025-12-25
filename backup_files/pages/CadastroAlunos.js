import React, { useState, useEffect } from 'react';

function CadastroAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // Estado com SEUS novos campos
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cpf: '',
    nasc: '',
    email: '',
    curso: '',
    telefone: '',
    id_cidade: '1' // Fixo em 1 como no seu back-end
  });

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const res = await fetch('/api/alunos');
      const data = await res.json();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao buscar alunos", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Preencher formulário para edição
  const handleEditClick = (aluno) => {
    setEditandoId(aluno.id_aluno);
    setFormData({
      matricula: aluno.matricula,
      nome: aluno.nome,
      cpf: aluno.cpf || '',
      // Formata data para yyyy-MM-dd
      nasc: aluno.nasc ? aluno.nasc.split('T')[0] : '',
      email: aluno.email || '',
      curso: aluno.curso || '',
      telefone: aluno.telefone || '',
      id_cidade: aluno.id_cidade || '1'
    });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setFormData({ matricula: '', nome: '', cpf: '', nasc: '', email: '', curso: '', telefone: '', id_cidade: '1' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = '/api/alunos';
      let method = 'POST';

      if (editandoId) {
        url = `/api/alunos/${editandoId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editandoId ? "Aluno atualizado!" : "Aluno cadastrado!");
        handleCancelEdit();
        fetchAlunos();
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao salvar.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
      fetchAlunos();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Alunos</h1>

      {/* Formulário Completo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editandoId ? "✏️ Editando Aluno" : "➕ Novo Aluno"}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Matrícula" className="p-2 border rounded" required />
          
          <div className="md:col-span-2">
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" className="w-full p-2 border rounded" required />
          </div>

          <input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF" className="p-2 border rounded" />
          
          <input name="nasc" type="date" value={formData.nasc} onChange={handleChange} className="p-2 border rounded" required />
          
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" />
          
          <input name="curso" value={formData.curso} onChange={handleChange} placeholder="Curso" className="p-2 border rounded" />
          
          <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded" />
          
          <div className="md:col-span-4 flex gap-2 mt-4 justify-end">
            {editandoId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
                Cancelar
              </button>
            )}
            <button type="submit" className={`text-white px-6 py-2 rounded font-bold ${editandoId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editandoId ? "Salvar Alterações" : "Cadastrar Aluno"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Curso</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id_aluno} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">{aluno.matricula}</td>
                <td className="p-4 font-medium">{aluno.nome}</td>
                <td className="p-4 text-gray-500">{aluno.curso}</td>
                <td className="p-4 text-gray-500 text-sm">{aluno.email}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEditClick(aluno)} className="text-blue-500 hover:text-blue-700 font-medium px-2">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(aluno.id_aluno)} className="text-red-500 hover:text-red-700 font-medium px-2">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CadastroAlunos;
