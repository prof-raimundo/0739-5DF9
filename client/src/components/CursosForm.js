import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaSave, FaTimes, FaEdit } from 'react-icons/fa';

Modal.setAppElement('#root');

function CursosForm({ onSuccess, cursoParaEditar, onCancel }) {
  const initialData = {
    nome_curso: '',
    eixo_curso: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (cursoParaEditar) {
      setFormData({
        ...cursoParaEditar
      });
    } else {
      setFormData(initialData);
    }
  }, [cursoParaEditar, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (cursoParaEditar) {
        const token = localStorage.getItem('token');
        response = await fetch(`/api/cursos/${cursoParaEditar.id_curso}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        const token = localStorage.getItem('token');
        response = await fetch('/api/cursos', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();

      if (response.ok) {
        setModalMessage(cursoParaEditar ? '✅ Curso atualizado com sucesso!' : '✅ Curso cadastrado com sucesso!');
        setIsSuccess(true);
        setIsModalOpen(true);
        if (!cursoParaEditar) setFormData(initialData);
        if (onSuccess) onSuccess();
      } else {
        setModalMessage(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        setIsSuccess(false);
        setIsModalOpen(true);
      }
    } catch (error) {
      setModalMessage('❌ Erro de conexão.');
      setIsSuccess(false);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (isSuccess && !cursoParaEditar) {
      // Se foi sucesso e criação, limpa o formulário
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md mb-6 transition-colors ${cursoParaEditar ? 'bg-yellow-50 border border-yellow-200' : 'bg-white'}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {cursoParaEditar ? <><FaEdit /> Editando: {cursoParaEditar.nome_curso}</> : 'Novo Curso'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nome do Curso</label>
          <input type="text" name="nome_curso" value={formData.nome_curso} onChange={handleChange} required
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Eixo do Curso</label>
          <input type="text" name="eixo_curso" value={formData.eixo_curso} onChange={handleChange} required
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea name="observacoes" value={formData.observacoes} onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" rows="3" />
        </div>

        <div className="md:col-span-2 mt-2 flex gap-3">
          <button type="submit"
            className={`flex-1 flex items-center justify-center gap-2 text-white p-2 rounded transition font-bold shadow-lg ${cursoParaEditar ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <FaSave /> {cursoParaEditar ? 'Atualizar Curso' : 'Salvar Curso'}
          </button>

          {cursoParaEditar && (
            <button type="button" onClick={onCancel}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 font-bold shadow-lg px-6 flex items-center gap-2">
              <FaTimes /> Cancelar
            </button>
          )}
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Mensagem"
      >
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-4">{isSuccess ? 'Sucesso' : 'Erro'}</h3>
          <p className="mb-4">{modalMessage}</p>
          <button onClick={closeModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            OK
          </button>
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

export default CursosForm;