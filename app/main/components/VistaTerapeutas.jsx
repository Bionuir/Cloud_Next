'use client';

import { useEffect, useState } from 'react';
import AgendarSesion from './subcomponents/AgendarSesion'; // Ajusta el path si es necesario
import PhoneIcon from '@mui/icons-material/Phone';
import ExtensionIcon from '@mui/icons-material/Extension';

export default function VistaTerapeutas() {
  const [terapeutas, setTerapeutas]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showModal, setShowModal]               = useState(false);
  const [terapeutaSeleccionado, setSeleccionado] = useState(null);
  const [search, setSearch]                     = useState('');
  const [tipoFiltro, setTipoFiltro]             = useState('todos');

  const baseApi = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

  useEffect(() => {
    const fetchTerapeutas = async () => {
      try {
        const res = await fetch(`${baseApi}/terapeutas`);
        if (!res.ok) throw new Error('Error al cargar terapeutas');
        const data = await res.json();
        setTerapeutas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTerapeutas();
  }, []);

  if (loading) return <p className="terapeuta-loading"></p>;
  if (terapeutas.length === 0) return <p className="terapeuta-empty">No hay terapeutas registrados.</p>;

  // Tipos únicos para el filtro
  const tiposUnicos = [
    ...new Set(terapeutas.map(t => t.tipo_terapeuta).filter(Boolean))
  ];

  // Aplicar búsqueda y filtro de tipo
  const terapeutasFiltrados = terapeutas.filter(t => {
    const nombreCompleto = `${t.nombre} ${t.apellido}`.toLowerCase();
    const matchNombre = nombreCompleto.includes(search.toLowerCase());
    const matchTipo   = tipoFiltro === 'todos' || t.tipo_terapeuta === tipoFiltro;
    return matchNombre && matchTipo;
  });

  // Transiciones si están disponibles
  const wrapTransition = (fn) =>
    document.startViewTransition ? document.startViewTransition(fn) : fn();

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
        {terapeutasFiltrados.map(t => (
          <div key={t._id} className="terapeuta-card">
            <h3 className="terapeuta-card-title">{t.nombre} {t.apellido}</h3>
            <p className="terapeuta-card-email">{t.correo}</p>
            <p className="terapeuta-card-phone">
              <PhoneIcon fontSize="small" style={{verticalAlign: 'middle', marginRight: 4}} />
              {t.telefono || 'No registrado'}
            </p>
            <p className="terapeuta-card-type">
              <ExtensionIcon fontSize="small" style={{verticalAlign: 'middle', marginRight: 4}} />
              Tipo: {t.tipo_terapeuta || 'No asignado'}
            </p>
            <button
              className="terapeuta-btn"
              onClick={() => wrapTransition(() => {
                setSeleccionado(t);
                setShowModal(true);
              })}
            >
              Agendar sesión
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <AgendarSesion
          terapeuta={terapeutaSeleccionado}
          onClose={() => setShowModal(false)}
        />
      )}

      <style jsx>{`
        .terapeuta-container { padding: 1rem; }
        .terapeuta-heading { font-size: 24px; font-weight: bold; margin-bottom: 1rem; }
        .terapeuta-filtros { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .terapeuta-busqueda, .terapeuta-select {
          padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.5rem; background: #fff;
          font-size: 1rem;
        }
        .terapeuta-busqueda { flex: 1 1 200px; }
        .terapeuta-select  { flex: 0 0 200px; }
        .terapeuta-grid { display: grid; gap: 1rem; grid-template-columns: 1fr;
          }
        @media (min-width: 768px) { .terapeuta-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1024px){ .terapeuta-grid { grid-template-columns: repeat(3,1fr); } }
        .terapeuta-card {
          background: #F5EFFF; border: 1px solid #ccc; border-radius: 1rem;
          padding: 1rem; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .terapeuta-card-title { font-size: 18px; font-weight: 600; margin-bottom: 0.5rem; }
        .terapeuta-card-email,
        .terapeuta-card-phone,
        .terapeuta-card-type {
          font-size: 14px; color: #555; margin-top: 0.25rem;
        }
        .terapeuta-btn {
          width: 100%; margin-top: 1rem; padding: 0.5rem;
          background: #A294F9; color: white; border: none; border-radius: 0.5rem;
          cursor: pointer; transition: background-color 0.3s;
        }
        .terapeuta-btn:hover { background: #8A80E2; }
        .terapeuta-loading,
        .terapeuta-empty { text-align: center; font-size: 16px; }
      `}</style>
    </div>
  );
}