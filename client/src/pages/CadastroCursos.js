import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaBook, FaSave, FaTimes, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

Modal.setAppElement('#root');

function CadastroCursos() {
  // --- ESTADOS ---
  const [cursos, setCursos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nome_curso: '',
    eixo_curso: '',
    modalidade: '', // Novo campo obrigatório
    observacoes: ''
  });

  // Estados de Modais
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState(null);

  // --- FUNÇÕES AUXILIARES ---
  const getToken = () => localStorage.getItem('token');
  
  const safeString = (val) => (val === null || val === undefined) ? '' : String(val);

  // --- CARREGAMENTO DE DADOS ---
  const fetchCursos = async () => {
    try {
      const response = await fetch('/api/cursos', { 
        headers: { 'Authorization': `Bearer ${getToken()}` } 
      });
      const data = await response.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  // --- MANIPULAÇÃO DO FORMULÁRIO ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (curso) => {
    setEditandoId(curso.id_curso);
    setFormData({
      nome_curso: curso.nome_curso || '',
      eixo_curso: curso.eixo_curso || '',
      modalidade: curso.modalidade || '',
      observacoes: curso.observacoes || ''
    });
    // Rola a página para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setFormData({ nome_curso: '', eixo_curso: '', modalidade: '', observacoes: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editandoId ? `/api/cursos/${editandoId}` : '/api/cursos';
      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setModalMessage(editandoId ? "✅ Curso atualizado!" : "✅ Curso cadastrado!");
        setIsSuccess(true);
        handleCancelEdit(); // Limpa form
        fetchCursos();      // Atualiza lista
      } else {
        setModalMessage(`❌ Erro: ${data.error || "Falha na operação"}`);
        setIsSuccess(false);
      }
      setIsMsgModalOpen(true);
    } catch (error) {
      setModalMessage('❌ Erro de conexão com o servidor.');
      setIsSuccess(false);
      setIsMsgModalOpen(true);
    }
  };

  // --- EXCLUSÃO ---
  const handleDeleteRequest = (curso) => {
    setCursoToDelete(curso);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cursoToDelete) return;
    try {
      const response = await fetch(`/api/cursos/${cursoToDelete.id_curso}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        fetchCursos();
        setIsDeleteModalOpen(false);
        setCursoToDelete(null);
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || "Não foi possível excluir"}`);
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaBook className="text-blue-600" />
        Gestão de Cursos
      </h1>

      {/* --- FORMULÁRIO --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 border-t-4 transition-colors ${editandoId ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-blue-600'}`}>
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            {editandoId ? <><FaEdit /> Editando Curso</> : <><FaBook /> Novo Curso</>}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome do Curso</label>
            <input name="nome_curso" value={formData.nome_curso} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required placeholder="Ex: Técnico em Informática" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Eixo Tecnológico</label>
            <input name="eixo_curso" value={formData.eixo_curso} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required placeholder="Ex: Informação e Comunicação" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modalidade</label>
            <select name="modalidade" value={formData.modalidade} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required>
              <option value="">Selecione...</option>
              <option value="Técnico Integrado">Técnico Integrado</option>
              <option value="Subsequente">Subsequente</option>
              <option value="Superior">Superior</option>
              <option value="Pós-Graduação">Pós-Graduação</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className="mt-1 w-full p-2 border rounded" rows="2" />
          </div>

          <div className="md:col-span-2 flex gap-2 justify-end mt-2">
            {editandoId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600">
                <FaTimes /> Cancelar
              </button>
            )}
            <button type="submit" className={`text-white px-6 py-2 rounded font-bold flex items-center gap-2 ${editandoId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <FaSave /> {editandoId ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>

      {/* --- LISTA (TABELA) --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Curso</th>
              <th className="p-4">Eixo</th>
              <th className="p-4">Modalidade</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length > 0 ? (
              cursos.map((curso) => (
                <tr key={curso.id_curso} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{safeString(curso.nome_curso)}</td>
                  <td className="p-4 text-gray-600">{safeString(curso.eixo_curso)}</td>
                  <td className="p-4 text-gray-600">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {safeString(curso.modalidade)}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEditClick(curso)} className="text-blue-500 hover:text-blue-700 mx-2" title="Editar">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDeleteRequest(curso)} className="text-red-500 hover:text-red-700 mx-2" title="Excluir">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">Nenhum curso cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE MENSAGEM --- */}
      <Modal isOpen={isMsgModalOpen} onRequestClose={() => setIsMsgModalOpen(false)} className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto mt-40 outline-none" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start">
        <h3 className={`text-lg font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{isSuccess ? 'Sucesso!' : 'Atenção'}</h3>
        <p className="mb-4 text-gray-700">{modalMessage}</p>
        <button onClick={() => setIsMsgModalOpen(false)} className="bg-gray-800 text-white px-4 py-2 rounded w-full hover:bg-gray-900">Fechar</button>
      </Modal>

      {/* --- MODAL DE EXCLUSÃO --- */}
      <Modal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto mt-40 outline-none" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start">
        <div className="flex items-center gap-3 mb-4 text-red-600"><FaExclamationTriangle size={24} /><h3 className="text-lg font-bold">Confirmar Exclusão</h3></div>
        <p className="mb-6 text-gray-700">Deseja realmente excluir <strong>{cursoToDelete?.nome_curso}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
          <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Excluir</button>
        </div>
      </Modal>
    </div>
  );
}

export default CadastroCursos;