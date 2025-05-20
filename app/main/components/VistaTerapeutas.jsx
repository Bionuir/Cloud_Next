// VistaTerapeutas.jsx
'use client';

import { useEffect, useState } from 'react';
import AgendarSesion from './AgendarSesion'; // Ajusta el path si es necesario

export default function VistaTerapeutas() {
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);

  useEffect(() => {
    const fetchTerapeutas = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        const data = await res.json();
        const filtrados = data.filter((usuario) => usuario.rol === 4);
        setTerapeutas(filtrados);
      } catch (error) {
        console.error('Error al obtener terapeutas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerapeutas();
  }, []);

  if (loading) return <p>Cargando terapeutas...</p>;
  if (terapeutas.length === 0) return <p>No hay terapeutas registrados.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lista de Terapeutas</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {terapeutas.map((t) => (
          <div key={t._id} className="bg-white shadow p-4 rounded-xl border">
            <h3 className="text-lg font-semibold">{t.nombre} {t.apellido}</h3>
            <p className="text-sm text-gray-600">{t.correo}</p>
            <p className="text-sm mt-1">📞 {t.telefono || 'No registrado'}</p>
            <p className="text-sm mt-1">🧩 Tipo: {t.tipo_terapeuta || 'No asignado'}</p>
            <button
              onClick={() => {
                setTerapeutaSeleccionado(t);
                setShowModal(true);
              }}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Agendar sesión
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && terapeutaSeleccionado && (
        <AgendarSesion
          terapeuta={terapeutaSeleccionado}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
