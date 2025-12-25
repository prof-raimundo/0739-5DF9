import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaTimes } from 'react-icons/fa'; // Ícones para ficar bonito

function CadastroNiveis() {
  const [niveis, setNiveis] = useState([]);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nivel: '',
    descricao: ''
  });

  // Estado para controlar Edição (null = criando, número = editando ID tal)
  const [editandoId, setEditandoId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Carregar dados
  const fetchNiveis = async () => {
    try {
      const response = await fetch('/api/niveis', {
        headers: { 'Authorization': getToken() }
      });
      const data = await response.json();
      setNiveis(data);
    } catch (error) {
      console.error("Erro ao buscar níveis", error);
    }
  };

  useEffect(() => {
    fetchNiveis();
  }, []);

  // --- FUNÇÕES DE AÇÃO ---

  // Prepara o formulário para editar
  const handleEditClick = (item) => {
    setFormData({ 
      nivel: item.nivel, 
      descricao: item.descricao || '' 
    });
    setEditandoId(item.id_nivel); // Liga o modo edição
  };

  // Cancela a edição
  const handleCancelEdit = () => {
    setFormData({ nivel: '', descricao: '' });
    setEditandoId(null); // Volta para modo criação
  };

  // Enviar (Salvar ou Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nivel) return;

    // Define se é POST (criar) ou PUT (editar)
    const method = editandoId ? 'PUT' : 'POST';
    const url = editandoId ? `/api/niveis/${editandoId}` : '/api/niveis';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': getToken() 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editandoId ? 'Nível atualizado!' : 'Nível criado!');
        handleCancelEdit(); // Limpa tudo
        fetchNiveis();      // Atualiza a lista
      } else {
        const data = await response.json();
        alert(data.error || "Erro na operação");
      }
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  // Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir?")) return;

    try {
      const response = await fetch(`/api/niveis/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': getToken() }
      });
      
      if (response.ok) {
        fetchNiveis();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch (error) {
      alert("Erro ao excluir");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Níveis de Acesso</h1>

      {/* --- FORMULÁRIO (DUPLA FUNÇÃO) --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 transition-colors ${editandoId ? 'bg-orange-50 border border-orange-200' : 'bg-white'}`}>
        
        <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold text-lg ${editandoId ? 'text-orange-600' : 'text-gray-700'}`}>
                {editandoId ? '✏️ Editando Nível' : '➕ Novo Nível'}
            </h3>
            {editandoId && (
                <button onClick={handleCancelEdit} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <FaTimes /> Cancelar Edição
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          
          {/* Campo Nome */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Nível *</label>
            <input 
              type="text" 
              value={formData.nivel}
              onChange={(e) => setFormData({...formData, nivel: e.target.value})}
              placeholder="Ex: Supervisor" 
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Campo Descrição */}
          <div className="flex-[2] min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input 
              type="text" 
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Tem acesso aos relatórios e cadastro de empresas..." 
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Botão de Ação */}
          <button 
            type="submit"
            className={`px-6 py-2 rounded text-white font-bold h-[42px] transition shadow-sm
                ${editandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {editandoId ? 'Salvar Alterações' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* --- TABELA --- */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-gray-600 font-semibold w-20">ID</th>
              <th className="p-4 text-gray-600 font-semibold">Nível</th>
              <th className="p-4 text-gray-600 font-semibold">Descrição</th>
              <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {niveis.map((item) => (
              <tr key={item.id_nivel} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{item.id_nivel}</td>
                <td className="p-4 font-bold text-gray-800">{item.nivel}</td>
                <td className="p-4 text-gray-600 text-sm italic">
                    {item.descricao || <span className="text-gray-300">Sem descrição</span>}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    
                    {/* Botão Editar */}
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded transition"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>

                    {/* Botão Excluir */}
                    <button 
                      onClick={() => handleDelete(item.id_nivel)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                      title="Excluir"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {niveis.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CadastroNiveis;
