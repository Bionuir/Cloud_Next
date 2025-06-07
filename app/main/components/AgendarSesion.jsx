'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export default function AgendarSesion({ terapeuta, onClose }) {
  const daysOfWeek = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const daysOfWeekLower = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const [ids, setIds] = useState(null);
  const [horario, setHorario] = useState(null);
  const [listed, setListed] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // construye fecha y selectedDay automáticamente
  const handleFechaChange = (value) => {
    setFecha(value);
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const wd = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
      setSelectedDay(daysOfWeekLower[wd]);
    } else {
      setSelectedDay(null);
    }
  };

  // formatea una fecha a "YYYY-MM-DD"
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // obtiene el lunes de la semana de una fecha dada
  const getMonday = (date) => {
    const diff = (date.getDay() + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    monday.setHours(0,0,0,0);
    return monday;
  };

  // obtiene la fecha para el botón del día (0: lunes, ...6: domingo)
  const getDateForDay = (i) => {
    let base;
    if (fecha) {
      const [y, m, d] = fecha.split('-').map(Number);
      base = new Date(y, m - 1, d);
    } else {
      base = new Date();
    }
    const monday = getMonday(base);
    const target = new Date(monday);
    target.setDate(monday.getDate() + i);
    return target;
  };

  // 1) IDs
  useEffect(() => {
    async function fetchIds() {
      const auth = getAuth();
      const pacienteEmail = auth.currentUser.email;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sesion?terapeutaEmail=${terapeuta.correo}&pacienteEmail=${pacienteEmail}`
      );
      if (res.ok) setIds(await res.json());
      else console.error('No se pudieron obtener IDs');
    }
    fetchIds();
  }, [terapeuta]);

  // 2) GET Horario
  useEffect(() => {
    if (!ids) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horario/${ids.terapeuta_id}`)
      .then(r => r.json())
      .then(data => setHorario(data.dias))
      .catch(console.error);
  }, [ids]);

  // 3) GET Listed por fecha cada vez que cambie `ids` o `fecha`
  useEffect(() => {
    if (!ids || !fecha) {
      setListed([]);
      return;
    }
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listed/${ids.terapeuta_id}?fecha=${fecha}`
    )
      .then(r => r.json())
      .then(data => setListed(data.listed))
      .catch(console.error);
  }, [ids, fecha]);

  // 4) recalcula bloques disponibles
  useEffect(() => {
    if (!selectedDay || !horario) {
      setAvailableBlocks([]);
      return;
    }
    const activos = horario[selectedDay]
      .filter(b => b.activado)
      .map(b => b.bloque);
    const ocupados = listed
      .filter(l => l.dia === selectedDay)
      .map(l => l.bloque);
    setAvailableBlocks(activos.filter(b => !ocupados.includes(b)));
    setSelectedBlock(null);
  }, [selectedDay, horario, listed]);

  const getTimeRange = (block) => {
    const start = 7 + block;
    const end = start + 1;
    return `${String(start).padStart(2,'0')}:00 - ${String(end).padStart(2,'0')}:00`;
  };

  // NEW: Split available blocks into morning and afternoon sections
  const morningBlocks = availableBlocks.filter(bn => bn < 5);
  const afternoonBlocks = availableBlocks.filter(bn => bn >= 5);

  const canSubmit = ids && selectedDay && selectedBlock && fecha && motivo && !submitting;
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        terapeuta_id: ids.terapeuta_id,
        paciente_id: ids.paciente_id,
        fecha,
        hora_inicio: `${fecha}T${String(7 + selectedBlock).padStart(2,'0')}:00`,
        hora_final: `${fecha}T${String(8 + selectedBlock).padStart(2,'0')}:00`,
        motivo,
        dia: selectedDay,
        bloque: selectedBlock
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (res.ok) {
        alert('Sesión agendada con éxito');
        onClose();
      } else {
        console.error(await res.text());
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
    <div className="agendar-sesion-container">
      <div className="agendar-sesion-box">
        <h2 className="agendar-sesion-heading">
          Agendar con {terapeuta.nombre} {terapeuta.apellido}
        </h2>
        <div className="agendar-sesion-main">
          <div className="agendar-sesion-left">
            {/* Fecha */}
            <label className="agendar-sesion-label">
              Fecha
              <input
                type="date"
                className="agendar-sesion-input"
                value={fecha}
                onChange={e => handleFechaChange(e.target.value)}
              />
            </label>

            {/* Día (botones) */}
            <div className="agendar-sesion-day-group">
              <span className="agendar-sesion-label">Día de la semana</span>
              <div className="agendar-sesion-day-container">
                {daysOfWeekLower.map((dl, i) => {
                  const target = getDateForDay(i);
                  return (
                    <button
                      key={dl}
                      onClick={() => {
                        setSelectedDay(dl);
                        setFecha(formatDate(target));
                      }}
                      className={`agendar-sesion-day-btn ${selectedDay === dl ? 'selected' : ''}`}
                      disabled={!horario?.[dl]?.some(b => b.activado)}
                    >
                      {daysOfWeek[i]} ({target.getDate()})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="agendar-sesion-right">
            {selectedDay && (
              <div className="agendar-sesion-block-group">
                {morningBlocks.length > 0 && (
                  <div className="morning-blocks">
                    <span className="agendar-sesion-label">Disponibles por la Mañana</span>
                    <div className="agendar-sesion-blocks-container">
                      {morningBlocks.map(bn => (
                        <div 
                          key={bn} 
                          className={`agendar-sesion-block-row ${selectedBlock === bn ? 'selected' : ''}`}
                          onClick={() => setSelectedBlock(bn)}
                        >
                          <div className="agendar-sesion-block-btn">
                            {bn}
                          </div>
                          <div className="block-time">
                            {getTimeRange(bn)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {afternoonBlocks.length > 0 && (
                  <div className="afternoon-blocks">
                    <span className="agendar-sesion-label">Disponibles por la Tarde</span>
                    <div className="agendar-sesion-blocks-container">
                      {afternoonBlocks.map(bn => (
                        <div 
                          key={bn} 
                          className={`agendar-sesion-block-row ${selectedBlock === bn ? 'selected' : ''}`}
                          onClick={() => setSelectedBlock(bn)}
                        >
                          <div className="agendar-sesion-block-btn">
                            {bn}
                          </div>
                          <div className="block-time">
                            {getTimeRange(bn)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Motivo en el centro abajo */}
        <div className="agendar-sesion-motivo-container">
          <label className="agendar-sesion-label">
            Motivo
            <textarea
              className="agendar-sesion-textarea"
              rows="3"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Escriba aqui su motivo de su Agenda"
            />
          </label>
        </div>

        {/* Botones */}
        <div className="agendar-sesion-btn-container">
          <button
            className="agendar-sesion-button cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            className="agendar-sesion-button submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? 'Agendando...' : 'Agendar'}
          </button>
        </div>
      </div>
      <style jsx>{`
        /* Añade fade animations a todos los botones */
        .agendar-sesion-day-btn,
        .agendar-sesion-block-btn,
        .agendar-sesion-button {
          transition: background-color 0.3s ease, color 0.3s ease, opacity 0.3s ease;
        }
        /* Nuevas reglas para hover con colores más suaves */
        .agendar-sesion-day-btn:hover {
          background-color: #CDC1FF;
        }
        .agendar-sesion-button:hover {
          background-color: #CDC1FF;
          color: #fff;
        }
        .cancel-btn:hover {
          background-color: #ffd8d8;
          color: #000;
        }
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
          max-width: 50rem;
        }
        .agendar-sesion-box > * + * {
          margin-top: 1rem;
        }
        .agendar-sesion-heading {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        .agendar-sesion-label {
          display: block;
          font-weight: 500;
        }
        .agendar-sesion-input,
        .agendar-sesion-textarea {
          background-color: #E5D9F2;
          display: block;
          width: 100%;
          margin-top: 0.25rem;
          padding: 0.5rem;
          border-radius: 0.25rem;
          box-sizing: border-box;
        }
        .agendar-sesion-main {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .agendar-sesion-left,
        .agendar-sesion-right {
          flex: 1;
        }
        .agendar-sesion-day-container,
        .agendar-sesion-blocks-container,
        .agendar-sesion-btn-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          
        }
        .agendar-sesion-day-btn {
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
          background-color: #E5D9F2;
          cursor: pointer;
        }
        .agendar-sesion-day-btn.selected {
          background-color: #A294F9;
          color: #fff;
          border-color: #2563eb;
        }
        .agendar-sesion-day-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .agendar-sesion-block-group {
          margin-top: 1rem;
        }
        .agendar-sesion-blocks-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
          
        }
        
        .agendar-sesion-block-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.3rem;
          background-color: #E5D9F2;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease !important;
          width: 100%;
        }
        /* Instead of applying hover only on the button, now the entire row changes style */
        .agendar-sesion-block-row:hover {
          background-color: #CDC1FF;
        }
        .agendar-sesion-block-row.selected {
          background-color: #A294F9;
          color: #fff;
        }
        .agendar-sesion-block-btn {
          width: 3rem;
          text-align: center;
          font-weight: bold;
        }
        .block-time {
          font-weight: 500;
        }
        .agendar-sesion-motivo-container {
          margin-top: 1rem;
          text-align: center;
        }
        .agendar-sesion-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          background-color: #fff;
        }
        .cancel-btn {
          background-color: #fff;
          color: #000;
        }
        .submit-btn {
          background-color: #A294F9;
          color: #fff;
          border: none;
        }
        .agendar-sesion-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .morning-blocks {
          margin-bottom: 1rem; // added small padding between morning and afternoon sections
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        /* Apply fade animation on mount and when items change */
        .agendar-sesion-blocks-container > .agendar-sesion-block-row {
          animation: fadeIn 0.3s ease;
          transition: opacity 0.10s ease;
        }
        /* When an element is removed or its content changes, add the "fade-out" class via JS to trigger fadeOut */
        .fade-out {
          animation: fadeOut 1.3s ease;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
