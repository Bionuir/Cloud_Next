'use client';

import { useEffect, useState } from 'react';
import PopupTiposTerapeuta from './subcomponents/PopupTiposTerapeuta';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function TipoTerapeutaCard({ tipo }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tipo-card">
      <div className="tipo-header" onClick={() => setOpen(true)}>
        <h3 className="tipo-title">{tipo.nombre}</h3>
        <ChevronRightIcon className="chevron-icon" />
      </div>
      {open && (
        <PopupTiposTerapeuta tipo={tipo} onClose={() => setOpen(false)} />
      )}
      <style jsx>{`
        .tipo-card {
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 1rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          transition: all 0.3s;
        }
        .tipo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          background-color: #f5efff;
        }
        .tipo-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        .chevron-icon {
          font-size: 1.5rem;
          font-weight: bold;
          user-select: none;
        }
      `}</style>
    </div>
  );
}

export default function VistaTiposTerapeuta() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/terapeuta`;
        console.log('[VistaTiposTerapeuta] GET', url);

        const res = await fetch(url);
        const data = await res.json();
        console.log('[VistaTiposTerapeuta] respuesta:', data);

        if (!res.ok) throw new Error('Error al obtener los tipos de terapeuta');
        setTipos(data);
      } catch (err) {
        console.error('[VistaTiposTerapeuta] Error:', err);
        setError('No se pudieron cargar los tipos de terapeuta');
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  if (loading) return <p className="tipo-loading"></p>;
  if (error) return <p className="tipo-error">{error}</p>;

  return (
    <div className="tipo-container">
      <h1 className="tipo-heading">Tipos de Terapeuta</h1>
      {tipos.length === 0 ? (
        <p>No hay tipos de terapeuta registrados.</p>
      ) : (
        <div className="tipo-list">
          {tipos.map((tipo) => (
            <TipoTerapeutaCard key={tipo._id} tipo={tipo} />
          ))}
        </div>
      )}
      <style jsx>{`
        .tipo-container {
          max-width: 96rem;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .tipo-heading {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .tipo-loading,
        .tipo-error {
          padding: 1rem;
          text-align: center;
          font-size: 1rem;
        }
        .tipo-error {
          color: #dc2626;
        }
        .tipo-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}