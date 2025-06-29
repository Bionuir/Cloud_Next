'use client';

import { useEffect, useState } from 'react';

export default function VistaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        const data = await res.json();
        setUsuarios(data);
        console.log('Usuarios cargados:', data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsuarios();
  }, []);

  const actualizarRol = async (googleId, nuevoRol) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/rol/${googleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoRol }),
      });

      const data = await res.json();
      console.log('Rol actualizado:', data);

      setUsuarios(prev =>
        prev.map(user => user.googleId === googleId ? { ...user, rol: nuevoRol } : user)
      );
    } catch (error) {
      console.error('Error al actualizar rol:', error);
    }
  };

  // Filtrar usuarios por búsqueda y rol
  const usuariosFiltrados = usuarios.filter(user => {
    // Filtro por rol
    let rolMatch = true;
    if (filtroRol === 'admin') rolMatch = user.rol === 1;
    else if (filtroRol === 'terapeuta') rolMatch = user.rol === 4;
    else if (filtroRol === 'paciente') rolMatch = user.rol === 6;

    // Filtro por búsqueda (nombre, apellido o correo)
    const texto = `${user.nombre} ${user.apellido} ${user.correo}`.toLowerCase();
    const busquedaMatch = texto.includes(busqueda.toLowerCase());

    return rolMatch && busquedaMatch;
  });

  return (
    <div>
      <h1 className="title">👥 Lista de Usuarios</h1>
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="inputBusqueda"
        />
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          className="selectFiltro"
        >
          <option value="todos">Todos</option>
          <option value="admin">Admins</option>
          <option value="terapeuta">Terapeutas</option>
          <option value="paciente">Pacientes</option>
        </select>
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
          {usuariosFiltrados.map((user) => (
            <tr key={user._id} className="tableRow">
              <td className="tableCell">{user.nombre} {user.apellido}</td>
              <td className="tableCell">{user.correo}</td>
              <td className="tableCell">
                <select
                  className="selectRol"
                  value={user.rol}
                  onChange={(e) => actualizarRol(user.googleId, parseInt(e.target.value))}
                  disabled={user.rol === 1} // Deshabilita si es admin
                >
                  {user.rol === 1 ? (
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
        @media (max-width: 768px) {
          .userTable, .tableCell {
            font-size: 0.9rem;
          }
          .filtros {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
