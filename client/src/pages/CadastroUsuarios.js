import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa'; // <--- CORREÇÃO 1: Importando ícones

function CadastroUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const location = useLocation();

  // Função auxiliar para pegar o token
  const getToken = () => localStorage.getItem('token');

  // Função para carregar usuários
  const carregarUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios', {
        headers: { 'Authorization': getToken() }
      });
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  };

  // Função para carregar níveis
  const carregarNiveis = async () => {
    try {
      const res = await fetch('/api/niveis', {
        headers: { 'Authorization': getToken() }
      });
      if (res.ok) {
        const data = await res.json();
        setNiveis(data);
      }
    } catch (error) {
      console.error("Erro niveis", error);
    }
  };

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    id_nivel: ''
  });

  useEffect(() => {
    carregarUsuarios();
    carregarNiveis();
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_nivel) return alert("Selecione um nível de acesso!");

    try {
      const response = await fetch('/api/usuarios', { // Ajuste a rota se necessário
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': getToken()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Usuário criado com sucesso!");
        setFormData({ nome_completo: '', email: '', senha: '', id_nivel: '' }); 
        carregarUsuarios(); 
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao criar usuário");
      }
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': getToken() }
      });
      if (res.ok) carregarUsuarios();
      else alert("Erro ao excluir");
    } catch (error) {
      alert("Erro ao excluir");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Usuários</h1>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Novo Usuário</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input name="nome_completo" value={formData.nome_completo} onChange={handleChange} required className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Login)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" name="senha" value={formData.senha} onChange={handleChange} required className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
            <select
              name="id_nivel"
              value={formData.id_nivel}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-white"
            >
              <option value="">Selecione...</option>
              {/* Se não tiver niveis carregados, mostra opções fixas pra não travar */}
              {niveis.length > 0 ? (
                niveis.map(n => (
                  <option key={n.id_nivel} value={n.id_nivel}>{n.nivel}</option>
                ))
              ) : (
                <>
                  <option value="1">Administrador</option>
                  <option value="2">Orientador</option>
                  <option value="3">Aluno</option>
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">
              Salvar Usuário
            </button>
          </div>

        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Nível</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* CORREÇÃO 2: Mudei (u) para (user) para bater com o código de baixo */}
            {usuarios.map((user) => (
              <tr key={user.id_usuario} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.nome_completo}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    {/* Exibe o nome do nível ou o ID se o nome não vier */}
                    {user.nome_nivel || user.id_nivel}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-end"> {/* Ajustei justify */}

                    {/* Botão de Editar */}
                    <Link 
                      to={`/usuarios/editar/${user.id_usuario}`} 
                      className="w-4 mr-4 transform hover:text-purple-500 hover:scale-110"
                    >
                      <FaEdit />
                    </Link>

                    {/* Botão de Excluir */}
                    <div 
                      onClick={() => handleDelete(user.id_usuario)}
                      className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                    >
                      <FaTrash />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CadastroUsuarios;
