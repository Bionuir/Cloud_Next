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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic?paciente_id=${user.uid}`);
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

  if (loading) return <p>Cargando diagnósticos...</p>;
  if (msg) return <p className="text-red-600">{msg}</p>;
  if (diagnosticos.length === 0) return <p>No hay diagnósticos registrados aún.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Historial de Diagnósticos</h1>
      <div className="space-y-4">
        {diagnosticos.map(({ session, diagnostic }, index) => (
          <div key={index} className="bg-gray-50 border p-4 rounded-xl">
            <p><strong>Fecha de sesión:</strong> {new Date(session.fecha).toLocaleDateString()}</p>
            <p><strong>Duración:</strong> {session.duracion} minutos</p>
            <p><strong>Estado:</strong> {session.estado}</p>
            <p><strong>Motivo:</strong> {session.motivo || 'No especificado'}</p>

            {diagnostic ? (
              <div className="mt-3 space-y-1">
                <p><strong>Diagnóstico:</strong> {diagnostic.diagnostico}</p>
                <p><strong>Nota del terapeuta:</strong> {diagnostic.nota_terapeuta}</p>
                <p><strong>Tratamiento recomendado:</strong> {diagnostic.tratamiento_recomendado}</p>
                <p><strong>Estado emocional al inicio:</strong> {diagnostic.estado_emocional_inicio}</p>
                <p><strong>Estado emocional al final:</strong> {diagnostic.estado_emocional_final}</p>
              </div>
            ) : (
              <p className="text-gray-500 mt-2">Aún no se ha registrado un diagnóstico para esta sesión.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
