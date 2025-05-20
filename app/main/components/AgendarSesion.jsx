// components/AgendarSesion.jsx
'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export default function AgendarSesion({ terapeuta, onClose }) {
  const [ids, setIds] = useState(null);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1) Obtener googleId de terapeuta y paciente
  useEffect(() => {
    async function fetchIds() {
      const auth = getAuth();
      const pacienteEmail = auth.currentUser.email;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sesion?terapeutaEmail=${terapeuta.correo}&pacienteEmail=${pacienteEmail}`
      );
      if (res.ok) {
        setIds(await res.json());
      } else {
        console.error('No se pudieron obtener IDs');
      }
    }
    fetchIds();
  }, [terapeuta]);

  const canSubmit = fecha && horaInicio && horaFinal && motivo && ids && !submitting;

  // 2) Enviar POST
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        terapeuta_id: ids.terapeuta_id,
        paciente_id: ids.paciente_id,
        fecha,
        hora_inicio: `${fecha}T${horaInicio}`,
        hora_final: `${fecha}T${horaFinal}`,
        motivo
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Sesión agendada con éxito');
        onClose();
      } else {
        alert('Error al agendar sesión');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Agendar sesión con {terapeuta.nombre} {terapeuta.apellido}
        </h2>
        <label className="block mb-2">
          Fecha
          <input
            type="date"
            className="mt-1 block w-full border rounded px-2 py-1"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label className="block mb-2 grid grid-cols-2 gap-2">
          <div>
            <span>Hora inicio</span>
            <input
              type="time"
              className="mt-1 block w-full border rounded px-2 py-1"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
          <div>
            <span>Hora fin</span>
            <input
              type="time"
              className="mt-1 block w-full border rounded px-2 py-1"
              value={horaFinal}
              onChange={(e) => setHoraFinal(e.target.value)}
            />
          </div>
        </label>
        <label className="block mb-4">
          Motivo
          <textarea
            className="mt-1 block w-full border rounded px-2 py-1"
            rows="3"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? 'Agendando...' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
}
