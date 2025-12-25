import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import InputMask from 'react-input-mask';
import { FaSave, FaTimes, FaEdit, FaTrash, FaUserGraduate } from 'react-icons/fa';

Modal.setAppElement('#root');

function CadastroAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Estado com todos os campos
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    rg: '',
    cpf: '',
    nasc: '',
    telefone: '',
    email: '',
    id_cidade: '',
    bairro: '',
    zona: '',
    curso: '',
    turma: '',
    observacoes: '',
    inform_egressa: '',
    facebook: '',
    linkedin: '',
    github: ''
  });

  const getToken = () => localStorage.getItem('token');

  // Helper function to safely convert values to strings for rendering
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const fetchAlunos = async () => {
    try {
      const response = await fetch('/api/alunos', { headers: { 'Authorization': getToken() } });
      const data = await response.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      setAlunos([]);
    }
  };

  useEffect(() => {
    // Função para buscar todos os dados
    const loadData = async () => {
      try {
        const [alunosRes, cidadesRes] = await Promise.all([
          fetch('/api/alunos', { headers: { 'Authorization': getToken() } }),
          fetch('/api/cidades', { headers: { 'Authorization': getToken() } })
        ]);
        
        const [alunosData, cidadesData] = await Promise.all([
          alunosRes.json(),
          cidadesRes.json()
        ]);
        
        setAlunos(Array.isArray(alunosData) ? alunosData : []);
        setCidades(Array.isArray(cidadesData) ? cidadesData : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setAlunos([]);
        setCidades([]);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Preencher formulário para edição
  const handleEditClick = (aluno) => {
    setEditandoId(aluno.id_aluno);
    setFormData({
      matricula: aluno.matricula || '',
      nome: aluno.nome || '',
      rg: aluno.rg || '',
      cpf: aluno.cpf || '',
      nasc: aluno.nasc ? aluno.nasc.split('T')[0] : '',
      telefone: aluno.telefone || '',
      email: aluno.email || '',
      id_cidade: aluno.id_cidade || '',
      bairro: aluno.bairro || '',
      zona: aluno.zona || '',
      curso: aluno.curso || '',
      turma: aluno.turma || '',
      observacoes: aluno.observacoes || '',
      inform_egressa: aluno.inform_egressa || '',
      facebook: aluno.facebook || '',
      linkedin: aluno.linkedin || '',
      github: aluno.github || ''
    });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setFormData({
      matricula: '',
      nome: '',
      rg: '',
      cpf: '',
      nasc: '',
      telefone: '',
      email: '',
      id_cidade: '',
      bairro: '',
      zona: '',
      curso: '',
      turma: '',
      observacoes: '',
      inform_egressa: '',
      facebook: '',
      linkedin: '',
      github: ''
    });
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

      const data = await response.json();

      if (response.ok) {
        setModalMessage(editandoId ? "✅ Aluno atualizado com sucesso!" : "✅ Aluno cadastrado com sucesso!");
        setIsSuccess(true);
        setIsModalOpen(true);
        handleCancelEdit();
        fetchAlunos();
      } else {
        setModalMessage(`❌ Erro: ${data.error || "Erro desconhecido"}`);
        setIsSuccess(false);
        setIsModalOpen(true);
      }
    } catch (error) {
      setModalMessage('❌ Erro de conexão.');
      setIsSuccess(false);
      setIsModalOpen(true);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);

  const handleDeleteClick = (aluno) => {
    setAlunoToDelete(aluno);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (alunoToDelete) {
      try {
        const response = await fetch(`/api/alunos/${alunoToDelete.id_aluno}`, { method: 'DELETE' });
        if (response.ok) {
          fetchAlunos();
        } else {
          alert("Erro ao excluir");
        }
      } catch (error) {
        console.error(error);
      }
    }
    setIsDeleteModalOpen(false);
    setAlunoToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAlunoToDelete(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Alunos</h1>

      {/* Formulário Completo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
          {editandoId ? (
            <>
              <FaEdit />
              <span>Editando Aluno</span>
            </>
          ) : (
            <>
              <FaUserGraduate />
              <span>Novo Aluno</span>
            </>
          )}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" className="mt-1 w-full p-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Matrícula</label>
            <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Matrícula" className="mt-1 w-full p-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RG</label>
            <input name="rg" value={formData.rg} onChange={handleChange} placeholder="RG" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <InputMask
              mask="999.999.999-99"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="mt-1 w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data Nascimento</label>
            <input name="nasc" type="date" value={formData.nasc} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <InputMask
              mask="(99)99999-9999"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00)00000-0000"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook</label>
            <input name="facebook" type="url" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/usuario" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/usuario" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub</label>
            <input name="github" type="url" value={formData.github} onChange={handleChange} placeholder="https://github.com/usuario" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cidade</label>
            <select name="id_cidade" value={formData.id_cidade} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required>
              <option value="">Selecione uma cidade</option>
              {cidades.map((cidade, index) => (
                <option key={cidade.id_cidade ? String(cidade.id_cidade) : `cidade-${index}`} value={cidade.id_cidade}>
                  {safeString(cidade.cidade)} - {safeString(cidade.uf)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <input name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bairro" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zona</label>
            <select name="zona" value={formData.zona} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
              <option value="">Selecione</option>
              <option value="Urbana">Urbana</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Curso</label>
            <input 
              name="curso" 
              value={formData.curso} 
              onChange={handleChange} 
              placeholder="Nome do curso" 
              className="mt-1 w-full p-2 border rounded" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Turma</label>
            <input name="turma" value={formData.turma} onChange={handleChange} placeholder="Turma" className="mt-1 w-full p-2 border rounded" />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Observações" className="mt-1 w-full p-2 border rounded" rows="3" />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Informações de Egressa</label>
            <textarea name="inform_egressa" value={formData.inform_egressa} onChange={handleChange} placeholder="Informações de Egressa" className="mt-1 w-full p-2 border rounded" rows="3" />
          </div>
          
          <div className="md:col-span-3 flex gap-2 mt-4 justify-end">
            {editandoId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
                <FaTimes />
                <span>Cancelar</span>
              </button>
            )}
            <button type="submit" className={`text-white px-6 py-2 rounded font-bold flex items-center gap-2 ${editandoId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <FaSave />
              <span>{editandoId ? "Salvar Alterações" : "Cadastrar Aluno"}</span>
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
              <th className="p-4">CPF</th>
              <th className="p-4">Curso</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno, index) => (
              <tr key={aluno.id_aluno ? String(aluno.id_aluno) : `aluno-${index}`} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">{safeString(aluno.matricula)}</td>
                <td className="p-4 font-medium">{safeString(aluno.nome)}</td>
                <td className="p-4 text-gray-500">{safeString(aluno.cpf)}</td>
                <td className="p-4 text-gray-500">{safeString(aluno.curso)}</td>
                <td className="p-4 text-gray-500 text-sm">{safeString(aluno.email)}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEditClick(aluno)} className="text-blue-500 hover:text-blue-700 font-medium px-2">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(aluno)} className="text-red-500 hover:text-red-700 font-medium px-2">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Mensagem"
      >
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-4">{isSuccess ? 'Sucesso' : 'Erro'}</h3>
          <p className="mb-4">{modalMessage}</p>
          <button onClick={() => setIsModalOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            OK
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={cancelDelete}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Confirmar Exclusão"
      >
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaTrash className="text-red-500 text-2xl" />
            <h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3>
          </div>
          <p className="mb-4 text-gray-600">
            Tem certeza que deseja excluir o aluno <strong>{alunoToDelete?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={cancelDelete} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancelar
            </button>
            <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default CadastroAlunos;
