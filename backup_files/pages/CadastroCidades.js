import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Se estiver usando Sidebar global no Layout, pode remover daqui
import { FaTrash, FaEdit, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const LISTA_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function CadastroCidades() {
  const [cidades, setCidades] = useState([]);
  const [formData, setFormData] = useState({ cidade: '', uf: '', observacoes: '' });
  const [editandoId, setEditandoId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Formata data para exibir bonitinho na tabela
  const formatData = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const carregarCidades = async () => {
    try {
      const res = await fetch('/api/cidades', { headers: { 'Authorization': getToken() } });
      const data = await res.json();
      setCidades(data);
    } catch (error) {
      console.error("Erro ao carregar cidades", error);
    }
  };

  useEffect(() => {
    carregarCidades();
  }, []);

  const iniciarEdicao = (c) => {
    setFormData({ 
      cidade: c.cidade, 
      uf: c.uf, 
      observacoes: c.observacoes || '' 
    });
    setEditandoId(c.id_cidade);
  };

  const cancelarEdicao = () => {
    setFormData({ cidade: '', uf: '', observacoes: '' });
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.cidade || !formData.uf) {
      alert("Preencha Cidade e UF.");
      return;
    }

    const url = editandoId ? `/api/cidades/${editandoId}` : '/api/cidades';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken()
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(editandoId ? 'Cidade atualizada!' : 'Cidade cadastrada!');
        cancelarEdicao();
        carregarCidades();
      } else {
        alert('Erro ao salvar.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  const deletarCidade = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta cidade?')) return;
    try {
      const res = await fetch(`/api/cidades/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': getToken() }
      });
      if (res.ok) carregarCidades();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 p-8"> {/* Se usar Layout no App.js, o padding já resolve */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" /> Gerenciar Cidades
      </h2>

      {/* --- FORMULÁRIO --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 transition-colors ${editandoId ? 'bg-blue-50 border border-blue-200' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-700">
                {editandoId ? '✏️ Editando Cidade' : '➕ Nova Cidade'}
            </h3>
            {editandoId && (
                <button onClick={cancelarEdicao} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
                    <FaTimes /> Cancelar
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap items-end">
          
          <div className="flex-[2] min-w-[250px]">
            <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Cidade *</label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => setFormData({...formData, cidade: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
              placeholder="Ex: São Paulo"
              required
            />
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label className="block text-sm font-bold text-gray-700 mb-1">UF *</label>
            <select
              value={formData.uf}
              onChange={(e) => setFormData({...formData, uf: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
              required
            >
              <option value="">Selecione</option>
              {LISTA_UFS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          <div className="flex-[3] min-w-[300px]">
            <label className="block text-sm font-bold text-gray-700 mb-1">Observações</label>
            <input
              type="text"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
              placeholder="Opcional..."
            />
          </div>

          <button 
            type="submit" 
            className={`px-6 py-2 rounded text-white font-bold h-[42px] transition ${editandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {editandoId ? 'Salvar' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* --- TABELA --- */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-gray-600 font-semibold w-16">ID</th>
              <th className="p-4 text-gray-600 font-semibold">Cidade / UF</th>
              <th className="p-4 text-gray-600 font-semibold">Observações</th>
              <th className="p-4 text-gray-600 font-semibold text-sm">Atualizado em</th>
              <th className="p-4 text-center text-gray-600 font-semibold w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cidades.map((c) => (
              <tr key={c.id_cidade} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{c.id_cidade}</td>
                <td className="p-4 font-bold text-gray-800">
                  {c.cidade} <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded ml-2">{c.uf}</span>
                </td>
                <td className="p-4 text-gray-600 text-sm italic">{c.observacoes || '-'}</td>
                <td className="p-4 text-gray-500 text-xs">
                    {formatData(c.dt_atualizacao)}
                </td>
                <td className="p-4 text-center flex justify-center gap-3">
                  <button onClick={() => iniciarEdicao(c)} className="text-blue-500 hover:text-blue-700" title="Editar">
                    <FaEdit size={18} />
                  </button>
                  <button onClick={() => deletarCidade(c.id_cidade)} className="text-red-500 hover:text-red-700" title="Excluir">
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {cidades.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhuma cidade cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CadastroCidades;
