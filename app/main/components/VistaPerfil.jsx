'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { useEffect, useState } from 'react';

export default function VistaPerfil({ user, datosUsuario }) {
  const router = useRouter();
  const [terapeutas, setTerapeutas] = useState([]);
  const [tipoSel, setTipoSel] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Cargar lista de terapeutas si el usuario es terapeuta
  useEffect(() => {
    if (datosUsuario?.rol === 4) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terapeuta`)
        .then(res => res.json())
        .then(data => setTerapeutas(data))
        .catch(err => console.error('[VistaPerfil] Error al cargar terapeutas:', err));
    }
  }, [datosUsuario]);

  // Sincronizar tipoSel cuando se actualice tipo_terapeuta
  useEffect(() => {
    if (datosUsuario?.tipo_terapeuta) {
      setTipoSel(datosUsuario.tipo_terapeuta);
    }
  }, [datosUsuario?.tipo_terapeuta]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('[VistaPerfil] Error al cerrar sesión:', error);
    }
  };

  const handleSelect = (e) => {
    setTipoSel(e.target.value);
    setMsg('');
  };

  const handleSave = async () => {
    if (!tipoSel) {
      setMsg('Debes seleccionar un tipo de terapeuta.');
      return;
    }

    setLoading(true);
    setMsg('');

    const userId = user?.uid;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/terapeuta`;
    const body = { tipo_terapeuta: tipoSel };

    console.log('[VistaPerfil] PUT ->', url, body);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('[VistaPerfil] respuesta:', res.status, data);

      if (!res.ok) {
        throw new Error(data.error || `Status ${res.status}`);
      }

      setMsg('Tipo de terapeuta guardado correctamente');
    } catch (error) {
      console.error('[VistaPerfil] Error al actualizar tipo_terapeuta:', error);
      setMsg('No se pudo actualizar. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  if (!datosUsuario) return <p>Cargando perfil...</p>;

  const mostrarDato = (v) => (v || 'No establecido');

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Perfil del Usuario</h1>
      <div className="perfil-box">
        <p><strong>Nombre:</strong> {mostrarDato(datosUsuario.nombre)}</p>
        <p><strong>Apellido:</strong> {mostrarDato(datosUsuario.apellido)}</p>
        <p><strong>Email:</strong> {mostrarDato(datosUsuario.correo)}</p>
        <p><strong>Dirección:</strong> {mostrarDato(datosUsuario.direccion)}</p>
        <p><strong>Sexo:</strong> {mostrarDato(datosUsuario.sexo)}</p>
        <p><strong>Teléfono:</strong> {mostrarDato(datosUsuario.telefono)}</p>

        {datosUsuario.rol === 4 && (
          <div className="perfil-therapeuta">
            <label className="perfil-label">Tipo de terapeuta:</label>
            <select
              value={tipoSel}
              onChange={handleSelect}
              disabled={loading}
              className="perfil-select"
            >
              <option value="">-- Selecciona un tipo --</option>
              {terapeutas.map(t => (
                <option key={t._id} value={t.nombre}>
                  {t.nombre} ({t.tipo})
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={loading || !tipoSel}
              className="perfil-save-btn"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            {msg && (
              <p className={`perfil-msg ${msg.includes('correcto') ? 'success' : 'error'}`}>
                {msg}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="perfil-logout-btn"
        >
          Cerrar sesión
        </button>
      </div>
      <style jsx>{`
        .perfil-container {
          padding: 1rem;
        }
        .perfil-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
        }
        .perfil-box {
          background-color: #F5EFFF;
          padding: 1rem;
          border-radius: 1rem;
          max-width: 28rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .perfil-therapeuta {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .perfil-label {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .perfil-select {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 0.5rem; // espacio extra para la flecha
          border: 1px solid #ccc;
          border-radius: 0.375rem;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          transition: border-color 0.3s;
        }
        .perfil-select:focus {
          outline: none;
          border-color: #A294F9;
        }
        .perfil-save-btn {
          margin-top: 0.25rem;
          background-color: #A294F9; // fondo A294F9
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .perfil-save-btn:hover,
        .perfil-save-btn:focus {
          background-color: #8A80E2; // color un poco más oscuro al hover y focus
        }
        .perfil-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .perfil-msg {
          margin-top: 0.5rem;
          font-size: 0.875rem;
        }
        .perfil-msg.success {
          color: #16a34a;
        }
        .perfil-msg.error {
          color: #dc2626;
        }
        .perfil-logout-btn {
          margin-top: 0.5rem;
          background-color: transparent; // por defecto transparente
          color: #ef4444; // texto en rojo
          padding: 0.5rem 1rem;
          border: 1px solid #ef4444; // borde rojo
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s, color 0.3s;
        }
        .perfil-logout-btn:hover,
        .perfil-logout-btn:focus {
          background-color: #ef4444; // fondo rojo al hover y focus
          color: white; // texto blanco al hover y focus
        }
      `}</style>
    </div>
  );
}
