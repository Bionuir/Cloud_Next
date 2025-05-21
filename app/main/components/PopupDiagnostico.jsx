'use client';

import { useState } from 'react';

export default function PopupDiagnostico({ sessionId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nota_terapeuta: '',
    diagnostico: '',
    tratamiento_recomendado: '',
    estado_emocional_inicio: '',
    estado_emocional_final: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Crear diagnóstico y marcar sesión como completada en un solo endpoint
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, ...form })
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar el diagnóstico');
      }

      const { diagnostic, session } = await res.json();

      // Notificar éxito con el diagnóstico y la sesión actualizada
      onSuccess({ diagnostic, session });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">Formulario de Diagnóstico</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-medium">Nota del terapeuta</label>
            <textarea
              name="nota_terapeuta"
              value={form.nota_terapeuta}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Diagnóstico</label>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Tratamiento recomendado</label>
            <textarea
              name="tratamiento_recomendado"
              value={form.tratamiento_recomendado}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Estado emocional al inicio</label>
            <input
              type="text"
              name="estado_emocional_inicio"
              value={form.estado_emocional_inicio}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Estado emocional al final</label>
            <input
              type="text"
              name="estado_emocional_final"
              value={form.estado_emocional_final}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : 'Guardar diagnóstico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
