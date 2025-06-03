'use client';

import { useEffect, useState } from 'react';

export default function VistaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

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

  return (
    <div>
      <h1 className="title">👥 Lista de Usuarios</h1>
      <table className="userTable">
        <thead>
          <tr>
            <th className="tableCell">Nombre</th>
            <th className="tableCell">Correo</th>
            <th className="tableCell">Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
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
        }
      `}</style>
    </div>
  );
}
