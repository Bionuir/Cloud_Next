// components/VistaSesiones.jsx
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function VistaSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      // Asumimos rol=6 para pacientes; si tienes un claim o 
      // endpoint para obtener rol, aquí deberías comprobarlo.
      // Para simplificar, asumo que este usuario es paciente (rol 6).
      const pacienteId = user.uid;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sesion/list?paciente_id=${pacienteId}`
        );
        if (!res.ok) {
          throw new Error('Error al obtener sesiones');
        }
        const data = await res.json();
        setSesiones(data);
      } catch (err) {
        console.error(err);
        setError('No fue posible cargar tus sesiones');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando sesiones...</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (sesiones.length === 0) return <p>No tienes sesiones pendientes o confirmadas.</p>;

  // Agrupar por estado
  const pendientes  = sesiones.filter(s => s.estado === 'pendiente');
  const confirmadas = sesiones.filter(s => s.estado === 'confirmada');

  const renderList = (list) =>
    list.map((s) => (
      <div key={s.session_id} className="border rounded-lg p-4 mb-3 bg-white shadow">
        <p><strong>Fecha:</strong> {new Date(s.fecha).toLocaleDateString()}</p>
        <p>
          <strong>Hora:</strong>{' '}
          {new Date(s.hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
          {new Date(s.hora_final).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p><strong>Duración:</strong> {s.duracion} min</p>
        <p><strong>Motivo:</strong> {s.motivo || '—'}</p>
        <p><strong>Estado:</strong> {s.estado}</p>
      </div>
    ));

  return (
    <div className="max-w-xl mx-auto p-4">
      {confirmadas.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Confirmadas</h2>
          {renderList(confirmadas)}
        </>
      )}
      {pendientes.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-2">Pendientes</h2>
          {renderList(pendientes)}
        </>
      )}
    </div>
  );
}
