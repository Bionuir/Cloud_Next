// VistaTerapeutas.jsx
'use client';

import { useEffect, useState } from 'react';
import AgendarSesion from './subcomponents/AgendarSesion'; // Ajusta el path si es necesario

export default function VistaTerapeutas() {
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  useEffect(() => {
    const fetchTerapeutas = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        const data = await res.json();
        const filtrados = data.filter((usuario) => usuario.rol === 4);
        setTerapeutas(filtrados);
      } catch (error) {
        console.error('Error al obtener terapeutas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerapeutas();
  }, []);

  // Obtener tipos únicos de terapeuta
  const tiposUnicos = [
    ...new Set(terapeutas.map(t => t.tipo_terapeuta).filter(Boolean))
  ];

  // Filtrado por nombre y tipo
  const terapeutasFiltrados = terapeutas.filter(t => {
    const coincideNombre = `${t.nombre} ${t.apellido}`.toLowerCase().includes(search.toLowerCase());
    const coincideTipo = tipoFiltro === 'todos' || t.tipo_terapeuta === tipoFiltro;
    return coincideNombre && coincideTipo;
  });

  // Helper to use View Transitions API when available
  const wrapTransition = (updateFn) => {
    if (document.startViewTransition) document.startViewTransition(updateFn);
    else updateFn();
  };

  // Open modal with transition
  const handleOpen = (t) => {
    wrapTransition(() => {
      setTerapeutaSeleccionado(t);
      setShowModal(true);
    });
  };

  // Close modal with transition
  const handleClose = () => {
    wrapTransition(() => {
      setShowModal(false);
    });
  };

  if (loading) return <p className="terapeuta-loading"></p>;
  if (terapeutas.length === 0) return <p className="terapeuta-empty">No hay terapeutas registrados.</p>;

  return (
    <div className="terapeuta-container">
      <h2 className="terapeuta-heading">Lista de Terapeutas</h2>
      <div className="terapeuta-filtros">
        <input
          type="text"
          className="terapeuta-busqueda"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="terapeuta-select"
          value={tipoFiltro}
          onChange={e => setTipoFiltro(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          {tiposUnicos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>
      <div className="terapeuta-grid">
        {terapeutasFiltrados.map((t) => (
          <div key={t._id} className="terapeuta-card">
            <h3 className="terapeuta-card-title">{t.nombre} {t.apellido}</h3>
            <p className="terapeuta-card-email">{t.correo}</p>
            <p className="terapeuta-card-phone">📞 {t.telefono || 'No registrado'}</p>
            <p className="terapeuta-card-type">🧩 Tipo: {t.tipo_terapeuta || 'No asignado'}</p>
            <button
              onClick={() => handleOpen(t)}
              className="terapeuta-btn"
            >
              Agendar sesión
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && terapeutaSeleccionado && (
        <AgendarSesion
          terapeuta={terapeutaSeleccionado}
          onClose={handleClose}
        />
      )}

      <style jsx>{`
        .terapeuta-container {
          padding: 1rem;
        }
        .terapeuta-heading {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: left;
        }
        .terapeuta-filtros {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .terapeuta-busqueda {
          flex: 1 1 200px;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
          font-size: 1rem;
          background: #fff;
        }
        .terapeuta-select {
          flex: 0 0 200px;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
          font-size: 1rem;
          background: #fff;
        }
        .terapeuta-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .terapeuta-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .terapeuta-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .terapeuta-card {
          background-color: #F5EFFF;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #ccc;
        }
        .terapeuta-card-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .terapeuta-card-email {
          font-size: 14px;
          color: #555;
        }
        .terapeuta-card-phone,
        .terapeuta-card-type {
          font-size: 14px;
          margin-top: 0.25rem;
          color: #555;
        }
        .terapeuta-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #A294F9;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s;
          width: 100%;
        }
        .terapeuta-btn:hover {
          background-color: #8A80E2;
        }
        .terapeuta-loading,
        .terapeuta-empty {
          text-align: center;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
