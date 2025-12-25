import React, { useEffect, useState } from 'react';

// Aceitamos uma prop 'refresh' para saber quando recarregar a lista
function AlunoList({ refresh, onEditClick }) {
  const [alunos, setAlunos] = useState([]);

  // Função que busca os dados
  const fetchAlunos = async () => {
    try {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const handleDelete = async (id) => {
    // Pergunta se o usuário tem certeza
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        const response = await fetch(`/api/alunos/${id}`, {
          method: "DELETE"
        });

        if (response.ok) {
          // Se deu certo, atualiza a lista na hora removendo o item visualmente
          setAlunos(alunos.filter(aluno => aluno.id_aluno !== id));
        } else {
          alert("Erro ao excluir");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Roda ao carregar a página e sempre que a prop 'refresh' mudar
  useEffect(() => {
    fetchAlunos();
  }, [refresh]);

  


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-bold text-gray-700">Alunos Cadastrados</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">Matrícula</th>
              <th className="p-4 border-b">Nome</th>
              <th className="p-4 border-b">Curso</th>
              <th className="p-4 border-b">Email</th>
              <th className="p-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">Nenhum aluno encontrado.</td>
              </tr>
            ) : (
              alunos.map((aluno) => (
                <tr key={aluno.id_aluno} className="hover:bg-blue-50 border-b last:border-0 transition">
                  <td className="p-4 font-mono text-sm">{aluno.matricula}</td>
                  <td className="p-4 font-semibold text-gray-800">{aluno.nome}</td>
                  <td className="p-4 text-sm text-gray-600">{aluno.curso}</td>
                  <td className="p-4 text-sm text-blue-600">{aluno.email}</td>
                  <td className="p-4">
                    <button onClick={() => onEditClick(aluno)} 
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm mr-2">Editar</button>
                    <button onClick={() => handleDelete(aluno.id_aluno)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlunoList;
