'use client';

import { useEffect, useState } from 'react';
import PopupDiagnostico from './PopupDiagnostico';

export default function VistaSesiones({ user, datosUsuario }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (!user?.uid || !datosUsuario) {
      setError('Datos de usuario no disponibles');
      setLoading(false);
      return;
    }

    const rol = datosUsuario.rol;
    const params = new URLSearchParams();
    if (rol === 6) params.append('paciente_id', user.uid);
    else if (rol === 4) params.append('terapeuta_id', user.uid);

    const url = rol === 1
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/sesion/listall`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/sesion/list?${params.toString()}`;

    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => setSesiones(data))
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false));
  }, [user, datosUsuario]);

  const updateEstado = async (session_id, nuevoEstado) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sesion/${session_id}/estado`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );
      if (!res.ok) throw new Error('Error actualizando sesión');
      const updated = await res.json();
      setSesiones(s => s.map(x => x.session_id === updated.session_id ? updated : x));
    } catch (err) {
      console.error(err);
      alert('No fue posible cambiar el estado');
    }
  };

  const eliminarSesion = async (session_id) => {
    if (!confirm('¿Seguro que quieres eliminar esta sesión?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sesion/${session_id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error eliminando sesión');
      setSesiones(s => s.filter(x => x.session_id !== session_id));
    } catch (err) {
      console.error(err);
      alert('No fue posible eliminar la sesión');
    }
  };

  const openDiagnostico = (session_id) => {
    setSelectedSession(session_id);
    setShowPopup(true);
  };

  const onDiagnosticSuccess = () => {
    setShowPopup(false);
    alert('Diagnóstico guardado correctamente');
  };

  if (loading) return <p>Cargando sesiones...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (sesiones.length === 0) return <p>No hay sesiones.</p>;

  const renderItem = (s) => (
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

      {s.estado === 'pendiente' && datosUsuario.rol === 4 && (
        <div className="mt-3 space-x-2">
          <button
            onClick={() => updateEstado(s.session_id, 'confirmada')}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Confirmar
          </button>
          <button
            onClick={() => updateEstado(s.session_id, 'rechazada')}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Rechazar
          </button>
        </div>
      )}

      {s.estado === 'confirmada' && datosUsuario.rol === 4 && (
        <div className="mt-3">
          <button
            onClick={() => openDiagnostico(s.session_id)}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Diagnosticar
          </button>
        </div>
      )}

      {datosUsuario.rol === 1 && (
        <div className="mt-3">
          <button
            onClick={() => eliminarSesion(s.session_id)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar sesión
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Sesiones</h2>
      {sesiones.map(renderItem)}
      {showPopup && (
        <PopupDiagnostico
          sessionId={selectedSession}
          onClose={() => setShowPopup(false)}
          onSuccess={onDiagnosticSuccess}
        />
      )}
    </div>
  );
}
