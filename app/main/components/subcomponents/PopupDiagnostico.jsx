'use client';

import { useState } from 'react';
import * as yup from 'yup';

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
    const { name, value } = e.target;
    const sanitizedValue = yup.string().trim().cast(value);
    setForm(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  // Nueva variable para validar que todas las casillas tengan contenido
  const isFormValid = Object.values(form).every(value => value.trim() !== '');

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
    <div className="agendar-sesion-container">
      <div className="agendar-sesion-box">
        <h2 className="agendar-sesion-heading">Formulario de Diagnóstico</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="two-columns">
            <div className="left-column">
              <div className="form-group">
                <label className="agendar-sesion-label">Estado emocional al inicio</label>
                <input
                  type="text"
                  name="estado_emocional_inicio"
                  value={form.estado_emocional_inicio}
                  onChange={handleChange}
                  className="agendar-sesion-input"
                />
              </div>
              <div className="form-group">
                <label className="agendar-sesion-label">Nota del terapeuta</label>
                <textarea
                  name="nota_terapeuta"
                  value={form.nota_terapeuta}
                  onChange={handleChange}
                  className="agendar-sesion-textarea"
                  required
                />
              </div>
              <div className="form-group">
                <label className="agendar-sesion-label">Estado emocional al final</label>
                <input
                  type="text"
                  name="estado_emocional_final"
                  value={form.estado_emocional_final}
                  onChange={handleChange}
                  className="agendar-sesion-input"
                />
              </div>
            </div>
            <div className="right-column">
              <div className="form-group">
                <label className="agendar-sesion-label">Diagnóstico</label>
                <textarea
                  name="diagnostico"
                  value={form.diagnostico}
                  onChange={handleChange}
                  className="agendar-sesion-textarea"
                  required
                />
              </div>
              <div className="form-group">
                <label className="agendar-sesion-label">Tratamiento recomendado</label>
                <textarea
                  name="tratamiento_recomendado"
                  value={form.tratamiento_recomendado}
                  onChange={handleChange}
                  className="agendar-sesion-textarea"
                />
              </div>
            </div>
          </div>
          <div className="button-group">
            <button
              type="button"
              onClick={onClose}
              className="agendar-sesion-button cancel-btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="agendar-sesion-button submit-btn"
            >
              {loading ? 'Subiendo...' : 'Subir diagnóstico'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .agendar-sesion-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .agendar-sesion-box {
          background-color: #F5EFFF;
          padding: 1.5rem;
          border-radius: 0.75rem;
          width: 90%;
          max-width: 60rem; /* modificado de 28rem a 40rem para columnas más anchas */
        }
        .agendar-sesion-heading {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
        .agendar-sesion-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .agendar-sesion-input {
          background-color: #E5D9F2;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.25rem;
          box-sizing: border-box;
          margin-bottom: 0.5rem;
          min-height: 78px; /* Nuevo: altura predeterminada para textfields */
        }
        .agendar-sesion-textarea {
          background-color: #E5D9F2;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.25rem;
          box-sizing: border-box;
          margin-bottom: 0.5rem;
          resize: vertical;
          min-height: 200px; /* Nuevo: altura predeterminada para textareas */
        }
        .form-group {
          margin-bottom: 0.5rem; /* Reduced spacing between groups */
        }
        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .agendar-sesion-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          background-color: #fff;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .cancel-btn {
          background-color: #fff;
          color: #000;
        }
        .cancel-btn:hover {
          background-color: #ffd8d8;
        }
        .submit-btn {
          background-color: #A294F9;
          color: #fff;
          border: none;
          transition: opacity 0.3s ease; /* added fade transition */
        }
        .submit-btn:hover {
          background-color: #8A80E2;
          color: #fff;
        }
        /* Nueva regla para mostrar el botón como desactivado */
        .submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          transition: opacity 0.3s ease; /* ensure fade effect on state change */
        }
        .error-text {
          color: red;
          margin-bottom: 1rem;
        }
        .two-columns {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .left-column,
        .right-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0rem;
        }
      `}</style>
    </div>
  );
}
