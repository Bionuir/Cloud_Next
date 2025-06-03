'use client';

import { useEffect, useState } from 'react';

export default function VistaDiagnostico({ user, datosUsuario }) {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!datosUsuario?.rol || datosUsuario.rol !== 6) {
      setMsg('Solo los pacientes pueden ver diagnósticos.');
      setLoading(false);
      return;
    }
    const obtenerDiagnosticos = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic?paciente_id=${user.uid}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener diagnósticos');
        setDiagnosticos(data);
      } catch (error) {
        console.error('[VistaDiagnostico] Error:', error);
        setMsg('Hubo un error al cargar tus diagnósticos.');
      } finally {
        setLoading(false);
      }
    };
    obtenerDiagnosticos();
  }, [user, datosUsuario]);

  if (loading) return <p className="diagnostico-loading">Cargando diagnósticos...</p>;
  if (msg) return <p className="diagnostico-error">{msg}</p>;
  if (diagnosticos.length === 0) return <p className="diagnostico-empty">No hay diagnósticos registrados aún.</p>;

  return (
    <div className="diagnostico-container">
      <h1 className="diagnostico-heading">Historial de Diagnósticos</h1>
      <div className="diagnostico-list">
        {diagnosticos.map(({ session, diagnostic }, index) => (
          <div key={index} className="diagnostico-card">
            <p className="diagnostico-text">
              <strong>Fecha de sesión:</strong> {new Date(session.fecha).toLocaleDateString()}
            </p>
            <p className="diagnostico-text">
              <strong>Duración:</strong> {session.duracion} minutos
            </p>
            <p className="diagnostico-text">
              <strong>Estado:</strong> {session.estado}
            </p>
            <p className="diagnostico-text">
              <strong>Motivo:</strong> {session.motivo || 'No especificado'}
            </p>
            {diagnostic ? (
              <div className="diagnostico-details">
                <p className="diagnostico-text">
                  <strong>Diagnóstico:</strong> {diagnostic.diagnostico}
                </p>
                <p className="diagnostico-text">
                  <strong>Nota del terapeuta:</strong> {diagnostic.nota_terapeuta}
                </p>
                <p className="diagnostico-text">
                  <strong>Tratamiento recomendado:</strong> {diagnostic.tratamiento_recomendado}
                </p>
                <p className="diagnostico-text">
                  <strong>Estado emocional al inicio:</strong> {diagnostic.estado_emocional_inicio}
                </p>
                <p className="diagnostico-text">
                  <strong>Estado emocional al final:</strong> {diagnostic.estado_emocional_final}
                </p>
              </div>
            ) : (
              <p className="diagnostico-no-data">Aún no se ha registrado un diagnóstico para esta sesión.</p>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .diagnostico-container {
          max-width: 96rem;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .diagnostico-heading {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .diagnostico-loading,
        .diagnostico-error,
        .diagnostico-empty {
          padding: 1rem;
          text-align: center;
          font-size: 1rem;
        }
        .diagnostico-error {
          color: #dc2626;
        }
        .diagnostico-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .diagnostico-card {
          background-color: #F5EFFF;
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 1rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .diagnostico-text {
          margin: 0.25rem 0;
          font-size: 0.95rem;
          color: #333;
        }
        .diagnostico-details {
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid #ccc;
        }
        .diagnostico-no-data {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          color: #555;
        }
      `}</style>
    </div>
  );
}
