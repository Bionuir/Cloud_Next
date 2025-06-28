import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase'; // ruta a tu configuración de Firebase

export default function VistaHorario() {
  // Días con mayúscula para mostrar en la tabla, y su contrapartida en minúscula
  const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const daysOfWeekLower = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // [8,9,…,19]
  
  // Estado para almacenar casillas seleccionadas (e.g. { 'Lunes-8': true, 'Martes-12': true, … })
  const [selectedCells, setSelectedCells] = useState({});
  // Estado para guardar el googleId (UID de Firebase). Si es null, no hay usuario logueado.
  const [googleId, setGoogleId] = useState(null);
  // Estado para saber si ya cargamos los datos iniciales
  const [loading, setLoading] = useState(true);

  // 1) Obtener el googleId del usuario con Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setGoogleId(user.uid);
      } else {
        setGoogleId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2) Cuando tengamos el googleId, solicitamos el horario existente y poblamos selectedCells
  useEffect(() => {
    if (!googleId) {
      setSelectedCells({});
      setLoading(false);
      return;
    }

    // mientras no llega la respuesta, mostramos loading=true
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horario/${googleId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          console.error('Error al obtener horario:', data);
          // Si hubo error, dejamos selectedCells vacío
          setSelectedCells({});
          setLoading(false);
          return;
        }
        const nuevoSelected = {};
        daysOfWeekLower.forEach((diaLower, idxDia) => {
          const arrBloques = data.dias[diaLower] || [];
          arrBloques.forEach((bloqueObj, idxBloque) => {
            if (bloqueObj.activado) {
              // idxBloque va de 0 a 11. Su hora correspondiente es hours[idxBloque].
              const hora = hours[idxBloque];
              // Convertimos diaLower a "Lunes", "Martes", … para la clave
              const diaCapitalizado = diaLower.charAt(0).toUpperCase() + diaLower.slice(1);
              const key = `${diaCapitalizado}-${hora}`;
              nuevoSelected[key] = true;
            }
          });
        });

        setSelectedCells(nuevoSelected);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error en fetch GET horario:', err);
        setSelectedCells({});
        setLoading(false);
      });
  }, [googleId]);

  // Función para togglear la selección de una casilla haciendo click
  const handleCellClick = (day, hour) => {
    const key = `${day}-${hour}`;
    setSelectedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Función que genera el objeto "dias" para el POST, a partir de selectedCells
  const generarDiasDesdeSelected = () => {
    const diasObj = {};
    daysOfWeekLower.forEach((diaLower, idx) => {
      // ahora usamos el mismo nombre (con acentos) que en daysOfWeek[idx]
      const diaCapitalizado = daysOfWeek[idx];
      diasObj[diaLower] = hours.map((hora, horaIdx) => {
        const keyFront = `${diaCapitalizado}-${hora}`; // coincide con el key usado en handleCellClick
        return {
          bloque: horaIdx + 1,
          activado: !!selectedCells[keyFront],
        };
      });
    });
    return diasObj;
  };

  // Handler cuando el usuario hace click en "Guardar"
  const handleSave = async () => {
    if (!googleId) {
      alert('No hay usuario autenticado.');
      return;
    }

    const payload = {
      googleId,
      dias: generarDiasDesdeSelected(),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error guardando:', data);
        alert('Ocurrió un error al guardar el horario.');
        return;
      }

      alert('Horario guardado correctamente.');
      console.log('Respuesta del servidor:', data.horario);
    } catch (error) {
      console.error('Error en fetch POST horario:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  // Si aún estamos cargando el GET inicial, podemos mostrar un mensaje (o spinner)
  if (loading) {
    return <div></div>;
  }

  return (
    <div className="horario-container">
      <h1 className="text-2xl font-bold mb-4">Horario Semanal</h1>
      <table className="horario-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: '#CDC1FF' }}></th>
            {daysOfWeek.map((day) => (
              <th key={day} style={{ backgroundColor: '#CDC1FF' }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, rowIndex) => (
            <tr key={hour}>
              <td className="hora-label" style={{ backgroundColor: '#F5EFFF' }}>
                {`${hour}:00 - ${hour + 1}:00`}
              </td>
              {daysOfWeek.map((day, colIndex) => {
                const key = `${day}-${hour}`;
                const isSelected = selectedCells[key];
                const cellStyle = {
                  backgroundColor: isSelected ? '#A294F9' : '#E5D9F2',
                  cursor: 'pointer'
                };
                if (isSelected) {
                  const leftSelected =
                    colIndex > 0 && selectedCells[`${daysOfWeek[colIndex - 1]}-${hour}`];
                  const rightSelected =
                    colIndex < daysOfWeek.length - 1 &&
                    selectedCells[`${daysOfWeek[colIndex + 1]}-${hour}`];
                  const topSelected =
                    rowIndex > 0 && selectedCells[`${day}-${hours[rowIndex - 1]}`];
                  const bottomSelected =
                    rowIndex < hours.length - 1 &&
                    selectedCells[`${day}-${hours[rowIndex + 1]}`];
                  cellStyle.borderTopLeftRadius =
                    !topSelected && !leftSelected ? '0.5rem' : '0';
                  cellStyle.borderTopRightRadius =
                    !topSelected && !rightSelected ? '0.5rem' : '0';
                  cellStyle.borderBottomLeftRadius =
                    !bottomSelected && !leftSelected ? '0.5rem' : '0';
                  cellStyle.borderBottomRightRadius =
                    !bottomSelected && !rightSelected ? '0.5rem' : '0';
                }
                return (
                  <td
                    key={key}
                    className={`hora-cell ${isSelected ? 'selected-cell' : ''}`}
                    onClick={() => handleCellClick(day, hour)}
                    style={cellStyle}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botones de acción */}
      <div className="button-container">
        <button className="btn-save" onClick={handleSave} disabled={!googleId}>
          Guardar
        </button>
        <button
          className="btn-cancel"
          onClick={() => {
            setSelectedCells({});
          }}
        >
          Cancelar
        </button>
      </div>

      <style jsx>{`
        .horario-container {
          padding: 1rem;
        }
        .horario-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .horario-table thead {
          border-bottom: 2px solid rgba(0,0,0,0.2);
        }
        .horario-table th,
        .horario-table td {
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          text-align: center;
          height: 45px;
        }
        .horario-table tr:first-child th,
        .horario-table tr:first-child td {
          border-top-color: transparent;
        }
        .horario-table tr:last-child th,
        .horario-table tr:last-child td {
          border-bottom-color: transparent;
        }
        .horario-table tr th:first-child,
        .horario-table tr td:first-child {
          border-left-color: transparent;
        }
        .horario-table tr th:last-child,
        .horario-table tr td:last-child {
          border-right-color: transparent;
        }
        .hora-label {
          font-weight: bold;
        }
        .hora-cell.selected-cell {
          position: relative;
        }
        .hora-cell.selected-cell::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #CDC1FF;
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          border-bottom-left-radius: inherit;
          border-bottom-right-radius: inherit;
          z-index: -1;
        }
        .button-container {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .btn-save {
          background-color: #A294F9;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-save:hover,
        .btn-save:focus {
          background-color: #8A80E2;
        }
        .btn-save:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .btn-cancel {
          background-color: #f56565;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-cancel:hover,
        .btn-cancel:focus {
          background-color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
