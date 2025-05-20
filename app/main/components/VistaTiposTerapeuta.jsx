'use client';

import { useEffect, useState } from 'react';

export default function VistaTiposTerapeuta() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/terapeuta`;
        console.log('[VistaTiposTerapeuta] GET', url);

        const res = await fetch(url);
        const data = await res.json();
        console.log('[VistaTiposTerapeuta] respuesta:', data);

        if (!res.ok) throw new Error('Error al obtener los tipos de terapeuta');
        setTipos(data);
      } catch (err) {
        console.error('[VistaTiposTerapeuta] Error:', err);
        setError('No se pudieron cargar los tipos de terapeuta');
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  if (loading) return <p className="p-4">Cargando tipos de terapeuta...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tipos de Terapeuta</h1>

      {tipos.length === 0 ? (
        <p>No hay tipos de terapeuta registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Nombre</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t._id}>
                  <td className="border border-gray-300 p-2">{t.nombre}</td>
                  <td className="border border-gray-300 p-2">{t.tipo}</td>
                  <td className="border border-gray-300 p-2">{t.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
