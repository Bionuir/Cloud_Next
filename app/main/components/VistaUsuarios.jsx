'use client';

import { useState, useEffect, useCallback } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function UserList() {
  const [users, setUsers]       = useState([]);
  const [page, setPage]         = useState(1);
  const [limit]                 = useState(10);
  const [totalPages, setTotal]  = useState(1);
  const [filter, setFilter]     = useState('todos');
  const [searchTerm, setSearch] = useState('');
  const [input, setInput]       = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/users';

  // Actualizar rol del usuario
  const actualizarRol = async (googleId, nuevoRol) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/rol/${googleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoRol }),
      });
      await res.json();
      setUsers(prev =>
        prev.map(user => user.googleId === googleId ? { ...user, rol: nuevoRol } : user)
      );
    } catch (error) {
      // Opcional: manejo de error
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page, limit,
        filter,
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`${apiUrl}?${params}`);
      if (!res.ok) throw new Error('Fetch error');

      const { data, pages } = await res.json();
      setUsers(data);
      setTotal(pages);
    } catch {
      setUsers([]);
    }
  }, [page, limit, filter, searchTerm]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const onSearch = () => {
    setSearch(input.trim());
    setPage(1);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  // Traducción del filtro para el backend (opcional, si tu backend lo requiere)
  // const getBackendFilter = (filtro) => {
  //   switch (filtro) {
  //     case 'admin': return 'admins';
  //     case 'terapeuta': return 'terapeutas';
  //     case 'paciente': return 'pacientes';
  //     default: return 'todos';
  //   }
  // };

  return (
    <div>
      <h1 className="title">Lista de Usuarios</h1>
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="inputBusqueda"
        />
        <button className="buscarBtn" onClick={onSearch}>Buscar</button>
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="selectFiltro"
        >
          <option value="todos">Todos</option>
          <option value="admins">Admins</option>
          <option value="terapeutas">Terapeutas</option>
          <option value="pacientes">Pacientes</option>
        </select>
        <div className="paginacion">
          <button
            className="paginacionBtn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <ArrowBackIosNewIcon />
          </button>
          <span className="paginacionNum">{page} / {totalPages}</span>
          <button
            className="paginacionBtn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Página siguiente"
          >
            <ArrowForwardIosIcon />
          </button>
        </div>
      </div>
      <table className="userTable">
        <thead>
          <tr>
            <th className="tableCell">Nombre</th>
            <th className="tableCell">Correo</th>
            <th className="tableCell">Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="tableRow">
              <td className="tableCell">{u.nombre} {u.apellido}</td>
              <td className="tableCell">{u.correo}</td>
              <td className="tableCell">
                <select
                  className="selectRol"
                  value={u.rol}
                  onChange={e => actualizarRol(u.googleId, parseInt(e.target.value))}
                  disabled={u.rol === 1}
                >
                  {u.rol === 1 ? (
                    <option value={1}>Admin</option>
                  ) : (
                    <>
                      <option value={4}>Terapeuta</option>
                      <option value={6}>Paciente</option>
                    </>
                  )}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        .filtros {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
        }
        .inputBusqueda {
          flex: 1;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .selectFiltro {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .userTable {
          width: 100%;
          border-radius: 30px;
          background-color: #F5EFFF;
          border-collapse: collapse;
          transition: all 0.3s ease;
        }
        .tableCell {
          padding: 1.0rem;
          text-align: center;
        }
        .tableRow {
          transition: background-color 0.3s ease;
        }
        .tableRow:hover {
          background-color: #E8DFF5;
        }
        .selectRol {
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          background-color: #fff;
        }
        .selectRol:disabled {
          background-color: #e0e0e0;
          color: #555;
        }
        .paginacion {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .paginacionBtn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
        }
        .paginacionBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .paginacionNum {
          font-weight: bold;
          font-size: 1.1rem;
          min-width: 2rem;
          text-align: center;
        }
        .buscarBtn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: 1px solid #7c3aed;
          background: #7c3aed;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .buscarBtn:hover {
          background: #5b21b6;
        }
        @media (max-width: 768px) {
          .userTable, .tableCell {
            font-size: 0.9rem;
          }
          .filtros {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }
          .paginacion {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}