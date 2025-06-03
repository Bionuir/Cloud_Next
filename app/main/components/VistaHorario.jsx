import React, { useState } from 'react';

export default function VistaHorario() {
  // Definir días de la semana (en español)
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Genera un array de horas de 8 a 20
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  
  // Estado para almacenar casillas seleccionadas
  const [selectedCells, setSelectedCells] = useState({});

  // Función para togglear la selección de una casilla
  const handleCellClick = (day, hour) => {
    const key = `${day}-${hour}`;
    setSelectedCells(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="horario-container">
      <h1 className="text-2xl font-bold mb-4">Horario Semanal</h1>
      <table className="horario-table">
        <thead>
          <tr>
            {/* Columna vacía para etiquetas de hora, color de días */}
            <th style={{ backgroundColor: '#CDC1FF' }}></th>
            {daysOfWeek.map((day) => (
              <th key={day} style={{ backgroundColor: '#CDC1FF' }}>{day}</th>
            ))}
          </tr>
          {/* Separador sutil debajo de los días se aplica en CSS */}
        </thead>
        <tbody>
          {hours.map((hour, rowIndex) => (
            <tr key={hour}>
              <td className="hora-label" style={{ backgroundColor: '#F5EFFF' }}>{`${hour}:00 - ${hour + 1}:00`}</td>
              {daysOfWeek.map((day, colIndex) => {
                const key = `${day}-${hour}`;
                const isSelected = selectedCells[key];
                // Calcular estilos de borderRadius como antes
                const cellStyle = {
                  backgroundColor: isSelected ? 'transparent' : '#A294F9', // Se pone transparente si está seleccionado
                  cursor: 'pointer'
                };
                if (isSelected) {
                  const leftSelected = colIndex > 0 && selectedCells[`${daysOfWeek[colIndex - 1]}-${hour}`];
                  const rightSelected = colIndex < daysOfWeek.length - 1 && selectedCells[`${daysOfWeek[colIndex + 1]}-${hour}`];
                  const topSelected = rowIndex > 0 && selectedCells[`${day}-${hours[rowIndex - 1]}`];
                  const bottomSelected = rowIndex < hours.length - 1 && selectedCells[`${day}-${hours[rowIndex + 1]}`];
                  cellStyle.borderTopLeftRadius = (!topSelected && !leftSelected) ? '0.5rem' : '0';
                  cellStyle.borderTopRightRadius = (!topSelected && !rightSelected) ? '0.5rem' : '0';
                  cellStyle.borderBottomLeftRadius = (!bottomSelected && !leftSelected) ? '0.5rem' : '0';
                  cellStyle.borderBottomRightRadius = (!bottomSelected && !rightSelected) ? '0.5rem' : '0';
                }
                return (
                  <td
                    key={key}
                    className={`hora-cell ${isSelected ? 'selected-cell' : ''}`}
                    onClick={() => handleCellClick(day, hour)}
                    style={cellStyle}
                  >
                    {/* Casilla seleccionable */}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .horario-container {
          padding: 1rem;
        }
        .horario-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed; // Asegura mismo ancho de casillas
          border-radius: 1rem; // Borde redondeado
          overflow: hidden; // Para que se aplique el border-radius
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); // Sombra detrás de la tabla
        }
        .horario-table thead {
          border-bottom: 2px solid rgb(0,0,0,0.2); // Separador sutil
        }
        .horario-table th,
        .horario-table td {
          border: 1px solid rgb(0, 0, 0, 0.1); // Borde sutil
          padding: 0.5rem;
          text-align: center;
          height: 50px; // Altura fija
        }
        /* Hacer transparentes los bordes exteriores */
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
        /* Nueva capa para el background de celdas seleccionadas */
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
      `}</style>
    </div>
  );
}
