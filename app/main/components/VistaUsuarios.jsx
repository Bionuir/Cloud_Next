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

  const ROLES = {
    1: 'Admin',
    4: 'Terapeuta',
    6: 'Paciente'
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 Lista de Usuarios</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="p-2 border">{user.nombre} {user.apellido}</td>
              <td className="p-2 border">{user.correo}</td>
              <td className="p-2 border">
                <select
                  className="border rounded px-2 py-1 bg-white disabled:bg-gray-100 disabled:text-gray-500"
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
    </div>
  );
}
