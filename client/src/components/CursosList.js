import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaTrash, FaEdit, FaExclamationTriangle } from 'react-icons/fa';

Modal.setAppElement('#root');

function CursosList({ refresh, onEditClick }) {
  const [cursos, setCursos] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState(null);

  const fetchCursos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cursos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const handleDeleteClick = (curso) => {
    setCursoToDelete(curso);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cursoToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cursos/${cursoToDelete.id_curso}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCursos(cursos.filter(curso => curso.id_curso !== cursoToDelete.id_curso));
        } else {
          alert("Erro ao excluir");
        }
      } catch (error) {
        console.error(error);
      }
    }
    setIsDeleteModalOpen(false);
    setCursoToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCursoToDelete(null);
  };

  useEffect(() => {
    fetchCursos();
  }, [refresh]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-bold text-gray-700">Cursos Cadastrados</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Nome do Curso</th>
              <th className="p-4 border-b">Eixo</th>
              <th className="p-4 border-b">Observações</th>
              <th className="p-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">Nenhum curso encontrado.</td>
              </tr>
            ) : (
              cursos.map((curso) => (
                <tr key={curso.id_curso} className="hover:bg-blue-50 border-b last:border-0 transition">
                  <td className="p-4 font-mono text-sm">{curso.id_curso}</td>
                  <td className="p-4 font-semibold text-gray-800">{curso.nome_curso}</td>
                  <td className="p-4 text-sm text-gray-600">{curso.eixo_curso}</td>
                  <td className="p-4 text-sm text-gray-600">{curso.observacoes || '-'}</td>
                  <td className="p-4">
                    <button onClick={() => onEditClick(curso)}
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm mr-2 flex items-center gap-1">
                      <FaEdit /> Editar
                    </button>
                    <button onClick={() => handleDeleteClick(curso)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1">
                      <FaTrash /> Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={cancelDelete}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Confirmar Exclusão"
      >
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
            <h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3>
          </div>
          <p className="mb-4 text-gray-600">
            Tem certeza que deseja excluir o curso <strong>{cursoToDelete?.nome_curso}</strong>?
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

export default CursosList;