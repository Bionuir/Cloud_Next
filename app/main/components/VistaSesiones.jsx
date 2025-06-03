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
    <div key={s.session_id} className="sesiones-card">
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
        <div className="button-group">
          <button
            onClick={() => updateEstado(s.session_id, 'confirmada')}
            className="btn-confirm"
          >
            Confirmar
          </button>
          <button
            onClick={() => updateEstado(s.session_id, 'rechazada')}
            className="btn-reject"
          >
            Rechazar
          </button>
        </div>
      )}

      {s.estado === 'confirmada' && datosUsuario.rol === 4 && (
        <div className="button-group">
          <button
            onClick={() => openDiagnostico(s.session_id)}
            className="btn-diagnose"
          >
            Diagnosticar
          </button>
        </div>
      )}

      {datosUsuario.rol === 1 && (
        <div className="button-group">
          <button
            onClick={() => eliminarSesion(s.session_id)}
            className="btn-delete"
          >
            Eliminar sesión
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="sesiones-container">
      <h2 className="sesiones-heading">Sesiones</h2>
      {sesiones.map(renderItem)}
      {showPopup && (
        <PopupDiagnostico
          sessionId={selectedSession}
          onClose={() => setShowPopup(false)}
          onSuccess={onDiagnosticSuccess}
        />
      )}
      {/* Se usa style jsx global para aplicar los estilos de forma global,
          igual que en VistaTerapeutas */}
      <style jsx global>{`
        .sesiones-container {
          padding: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .sesiones-heading {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
        }
        .sesiones-card {
          background-color: #fff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #ccc;
          margin-bottom: 1rem;
        }
        .button-group {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
        }
        .btn-confirm,
        .btn-reject,
        .btn-diagnose,
        .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-confirm {
          background-color: #A294F9;
        }
        .btn-confirm:hover {
          background-color: #8A80E2;
        }
        .btn-reject {
          background-color: #f56565;
        }
        .btn-reject:hover {
          background-color: #e53e3e;
        }
        .btn-diagnose {
          background-color: #A294F9;
        }
        .btn-diagnose:hover {
          background-color: #8A80E2;
        }
        .btn-delete {
          background-color: #f56565;
        }
        .btn-delete:hover {
          background-color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
